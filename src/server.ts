import * as bodyParser from 'body-parser';
import * as session from 'cookie-session';
import * as express from 'express';
import * as boom from 'express-boom';
import * as expressHandlebars from 'express-handlebars';
import * as methodOverride from 'method-override';
import * as logger from 'morgan';
import * as passport from 'passport';
import * as path from 'path';
import * as flash from 'express-flash';
import { JingoEvent, jingoEventHandlerFor, jingoEvents } from '@events/index';
import { Config } from '@lib/config';
import { mcache } from '@lib/mcache';
import viewHelpers from '@lib/view-helpers';
import ApiRoute from '@routes/api';
import AuthRoute from '@routes/auth';
import DocRoute from '@routes/doc';
import FolderRoute from '@routes/folder';
import IndexRoute from '@routes/index';
import WikiRoute from '@routes/wiki';

import * as moreHelpers from 'just-handlebars-helpers';

import ipc from '@lib/ipc';

/**
 * The server.
 *
 * @class Server
 */
export default class Server {
  public static bootstrap(config: Config): Server {
    return new Server(config);
  }

  public app: express.Application;

  constructor(public config: Config) {
    this.app = express();
    this.setup();
    this.routes();
    this.events();
    this.ipc();
  }

  public routes() {
    const router: express.Router = express.Router();

    IndexRoute.install(router, this.config);
    WikiRoute.install(router, this.config);
    DocRoute.install(router, this.config);
    FolderRoute.install(router, this.config);
    ApiRoute.install(router, this.config);
    AuthRoute.install(router, this.config);

    this.app.use(this.config.get('mountPath'), router);

    this.app.use((req, res) => {
      return res.status(404).render('404');
    });
  }

  public events() {
    jingoEvents.forEach((event: JingoEvent) => {
      this.app.on(event, jingoEventHandlerFor(event).bind(null, this.config));
    });
  }

  /**
   * Setup the IPC server
   */
  public ipc() {
    ipc(this.config).connect();
  }

  public setup() {
    const staticOptions = {
      redirect: false
    };

    // Exclude files from being served from the
    // static middleware. Note: to use the static middleware
    // from the wiki pages directly we need to create a
    // whitelist (not a blacklist)
    const mountPath = this.config.get('mountPath');
    this.app.use(
      [/(.*)\.md/, `${mountPath}public`],
      express.static(path.join(__dirname, 'public'), staticOptions)
    );

    this.app.use(boom());
    const expressHbs = expressHandlebars.create({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: viewHelpers(this.config),
      layoutsDir: path.join(__dirname, '../src/views/layouts'),
      partialsDir: [path.join(__dirname, '../src/views/partials')]
    });

    moreHelpers.registerHelpers(expressHbs.handlebars);

    this.app.engine('.hbs', expressHbs.engine);

    this.app.set('views', path.join(__dirname, '../src/views'));
    this.app.set('view engine', '.hbs');
    this.app.enable('trust proxy');
    this.app.enable('strict routing');

    // 'combined' or 'dev'
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(logger('combined' as any));
    }

    this.app.use(
      methodOverride((req, res) => {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
          // look in urlencoded POST bodies and delete it
          const method = req.body._method;
          delete req.body._method;
          return method;
        }
      })
    );

    this.app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: '500kb'
      })
    );

    this.app.use(express.json());

    this.app.use(
      session({
        keys: ['jingok1', 'jingok2'],
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        name: 'session'
      })
    );

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    passport.serializeUser((user, done) => {
      console.log('User from serialize', user);
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      console.log('User from deserialize', user);
      done(null, user);
    });

    this.app.use(flash());
    this.app.use((req, res, next) => {
      res.locals.user = (req as any).user;
      next();
    });

    this.app.set('cache', mcache());
  }
}
