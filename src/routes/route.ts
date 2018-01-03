import { Config, TFeaturesSettings } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import folder, { Folder } from '@lib/folder'
import wiki, { Wiki } from '@lib/wiki'
import sdk, { Sdk } from '@sdk'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator/check'
import { matchedData } from 'express-validator/filter'

export default class BaseRoute {
  public wikiHelpers: Wiki
  public docHelpers: Doc
  public folderHelpers: Folder
  public sdk: Sdk
  public features: TFeaturesSettings[]

  constructor (public config: Config, public title: string = 'Jingo') {
    this.wikiHelpers = wiki(this.config)
    this.docHelpers = doc(this.config)
    this.folderHelpers = folder(this.config)
    this.sdk = sdk(this.config)
  }

  public render (req: Request, res: Response, view: string, options?: object) {
    res.locals.title = this.title
    res.locals.featurs = this.features
    res.render(view, options)
  }

  public inspectRequest (req: Request) {
    const validationErrors = validationResult(req)

    return {
      data: matchedData(req),
      errors: validationErrors.isEmpty() ? null : validationErrorsToArray()
    }

    function validationErrorsToArray () {
      const map = validationErrors.mapped()
      return Object.keys(map).map(key => map[key].msg)
    }
  }
}
