import * as bodyParser from 'body-parser'
import * as errorHandler from 'errorhandler'
import * as express from 'express'
import * as boom from 'express-boom'
import * as expressFlash from 'express-flash'
import * as expressHandlebars from 'express-handlebars'
import * as session from 'express-session'
import * as methodOverride from 'method-override'
import * as logger from 'morgan'
import * as os from 'os'
import * as path from 'path'
import * as sessionFileStore from 'session-file-store'

const FileStore = sessionFileStore(session)

import {
  JingoEvent,
  jingoEventHandlerFor,
  jingoEvents
} from '@events/index'
import { Config } from '@lib/config'
import { mcache } from '@lib/mcache'
import viewHelpers from '@lib/view-helpers'
import ApiRoute from '@routes/api'
import DocRoute from '@routes/doc'
import FolderRoute from '@routes/folder'
import IndexRoute from '@routes/index'
import WikiRoute from '@routes/wiki'

import * as moreHelpers from 'just-handlebars-helpers'

import ipc from '@lib/ipc'

/**
 * The server.
 *
 * @class Server
 */
export default class Server {
  public app: express.Application

  constructor (public config: Config) {
    this.app = express()
    this.setup()
    this.routes()
    this.events()
    this.ipc()
  }

  public static bootstrap (config: Config): Server {
    return new Server(config)
  }

  public routes () {
    const router: express.Router = express.Router()

    IndexRoute.create(router, this.config)
    WikiRoute.create(router, this.config)
    DocRoute.create(router, this.config)
    FolderRoute.create(router, this.config)
    ApiRoute.create(router, this.config)

    this.app.use(this.config.get('mountPath'), router)
  }

  public events () {
    jingoEvents.forEach((event: JingoEvent) => {
      this.app.on(event, jingoEventHandlerFor(event).bind(null, this.config))
    })
  }

  /**
   * Setup the IPC server
   */
  public ipc () {
    ipc(this.config).connect()
  }

  public setup () {
    const staticOptions = {
      redirect: false
    }

    // Exclude files from being served from the
    // static middleware. Note: to use the static middleware
    // from the wiki pages directly we need to create a
    // whitelist (not a blacklist)
    const mountPath = this.config.get('mountPath')
    this.app.use([/(.*)\.md/, `${mountPath}public`], express.static(path.join(__dirname, 'public'), staticOptions))

    this.app.use(boom())
    const expressHbs = expressHandlebars.create({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: viewHelpers(this.config),
      layoutsDir: path.join(__dirname, '../src/views/layouts'),
      partialsDir: [
        path.join(__dirname, '../src/views/partials')
      ]
    })

    moreHelpers.registerHelpers(expressHbs.handlebars)

    this.app.engine('.hbs', expressHbs.engine)

    this.app.set('views', path.join(__dirname, '../src/views'))
    this.app.set('view engine', '.hbs')
    this.app.enable('trust proxy')
    this.app.enable('strict routing')

    // 'combined' or 'dev'
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(logger('combined' as any))
    }

    this.app.use(methodOverride((req, res) => {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        const method = req.body._method
        delete req.body._method
        return method
      }
    }))

    this.app.use(bodyParser.urlencoded({
      extended: true,
      limit: '500kb'
    }))

    this.app.use(express.json())

    this.app.use(session({
      cookie: { httpOnly: true },
      name: 'jingosid',
      resave: false,
      saveUninitialized: false,
      secret: 'SECRET_GOES_HERE',
      store: new FileStore({
        path: os.tmpdir()
      })
    }))
    this.app.use(expressFlash())

    // catch 404 and forward to error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      err.status = 404
      next(err)
    })

    if (process.env.NODE_ENV === 'development') {
      this.app.use(errorHandler())
    }

    this.app.set('cache', mcache())
  }
}
