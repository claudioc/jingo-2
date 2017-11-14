import { NextFunction, Request, Response, Router } from 'express'
import { check, validationResult } from 'express-validator/check'
import { matchedData, sanitize } from 'express-validator/filter'
import { unwikify } from '../lib/wiki'
import { BaseRoute } from './route'

// Returns a validator chains for the new document
function validatesNew () {
  return [
    check('docName')
      .isLength({ min: 1 })
      .withMessage('The document name cannot be empty')
      .trim(),

    check('content')
      .isLength({ min: 1 })
      .withMessage('The document content cannot be empty')
      .trim(),

    sanitize(['docName', 'content'])
  ]
}

export class DocRoute extends BaseRoute {
  constructor () {
    super()
  }

  public static create (router: Router) {
    router.get('/doc/new/:docName', (req: Request, res: Response, next: NextFunction) => {
      new DocRoute().newDoc(req, res, next)
    })

    router.post('/doc/new', validatesNew(), (req: Request, res: Response, next: NextFunction) => {
      new DocRoute().createDoc(req, res, next)
    })
  }

  public newDoc (req: Request, res: Response, next: NextFunction) {
    const docName = req.params.docName
    const docTitle = unwikify(docName)

    this.title = `Jingo – Creating ${docTitle}`

    const scope: object = {
      docName,
      title: docTitle
    }

    this.render(req, res, 'doc-new', scope)
  }

  public createDoc (req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log(errors.mapped())
    }

    const data = matchedData(req)

    console.log(data)
    res.redirect('/doc/new/lovely')
    //const docName = req.params.docName
    //const docTitle = unwikify(docName)
  }
}
