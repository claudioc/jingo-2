import { Config, TFeaturesSettings } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import folder, { Folder } from '@lib/folder'
import inspectRequest from '@lib/inspect-request'
import wiki, { Wiki } from '@lib/wiki'
import sdk, { Sdk } from '@sdk'
import { Request, Response } from 'express'

export default class BaseRoute {
  public wikiHelpers: Wiki
  public docHelpers: Doc
  public folderHelpers: Folder
  public sdk: Sdk
  public features: TFeaturesSettings[]

  constructor(public config: Config, public title: string = 'Jingo') {
    this.wikiHelpers = wiki(this.config)
    this.docHelpers = doc(this.config)
    this.folderHelpers = folder(this.config)
    this.sdk = sdk(this.config)
  }

  public render(req: Request, res: Response, view: string, options?: object) {
    res.locals.title = this.title
    res.render(view, options)
  }

  public inspectRequest(req: Request) {
    return inspectRequest(req)
  }
}
