import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as errorHandler from 'errorhandler'
import * as express from 'express'
import * as expressFlash from 'express-flash'
import * as expressHandlebars from 'express-handlebars'
import * as session from 'express-session'
import * as methodOverride from 'method-override'
import * as logger from 'morgan'
import * as path from 'path'

import * as helpers from './lib/view-helpers'
import DocRoute from './routes/doc'
import { IndexRoute } from './routes/index'
import { WikiRoute } from './routes/wiki'

const cookieSession = require('cookie-session')

/**
 * The server.
 *
 * @class Server
 */
export default class Server {

  public app: express.Application

  constructor () {
    this.app = express()
    this.config()
    this.routes()
    this.api()
  }

  public static bootstrap (): Server {
    return new Server()
  }

  public routes () {
    let router: express.Router
    router = express.Router()

    IndexRoute.create(router)
    WikiRoute.create(router)
    DocRoute.create(router)

    this.app.use(router)
  }

  public api () {
    // empty
  }

  public config () {

    const staticOptions = {
      redirect: false
    }

    // Exclude files from being served from the
    // static middleware. Note: to use the static middleware
    // from the wiki pages directly we need to create a
    // whitelist (not a blacklist)
    this.app.use([/(.*)\.md/, '/public'], express.static(path.join(__dirname, 'public'), staticOptions))

    this.app.engine('.hbs', expressHandlebars({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers,
      layoutsDir: path.join(__dirname, '../src/views/layouts'),
      partialsDir: [
        path.join(__dirname, '../src/views/partials')
      ]
    }))

    this.app.set('views', path.join(__dirname, '../src/views'))
    this.app.set('view engine', '.hbs')
    this.app.enable('trust proxy')

    // 'combined' or 'dev'
    this.app.use(logger('combined' as any))

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

    this.app.use(cookieParser('SECRET_GOES_HERE'))

    this.app.use(cookieSession({
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
      keys: ['jingo'],
      name: 'JingoSession'
    }))

    this.app.use(session({
      cookie: { httpOnly: true },
      name: 'jingosid',
      resave: true,
      saveUninitialized: true,
      secret: 'SECRET_GOES_HERE'
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
  }
}
