import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as logger from 'morgan'
import * as path from 'path'
import * as expressValidator from 'express-validator'
import * as expressFlash from 'express-flash'
import * as session from 'express-session'
import * as errorHandler from 'errorhandler'
import * as methodOverride from 'method-override'
const cookieSession = require('cookie-session')

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {Server} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server()
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    this.app = express()
    this.config()
    this.routes()
    this.api()
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    this.app.use(express.static(path.join(__dirname, 'public')))

    //configure pug
    this.app.set('views', path.join(__dirname, 'views'))
    this.app.set('view engine', 'pug')

    this.app.enable('trust proxy')

    // 'combined' or 'dev'
    this.app.use(logger('combined' as any))

    this.app.use(methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
    }))

    this.app.use(bodyParser.urlencoded({
      extended: true,
      limit: '500kb'
    }))

    //use cookie parser middleware
    this.app.use(cookieParser('SECRET_GOES_HERE'))

    this.app.use(cookieSession({
      name: 'JingoSession',
      keys: ['jingo'],
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
    }))

    this.app.use(session({ name: 'jingosid',
      secret: 'SECRET_GOES_HERE',
      cookie: { httpOnly: true },
      saveUninitialized: true,
      resave: true
    }))
    this.app.use(expressFlash())
    this.app.use(expressValidator())

    // catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404
      next(err)
    })

    if (process.env.NODE_ENV === 'development') {
      this.app.use(errorHandler())
    }
  }

  /**
   * Create router
   *
   * @class Server
   * @method api
   */
  public routes() {
  }
}