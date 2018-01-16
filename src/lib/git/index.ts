import { Config } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import { noop as _noop } from 'lodash'
import * as simplegit from 'simple-git/promise'

export interface IGitOps {
  $add (docName: string, into: string): void
  $commit (docName: string, into: string, comment: string): void
  $rm (docName: string, into: string): void
}

const nop: IGitOps = {
  $add: _noop,
  $commit: _noop,
  $rm: _noop
}

const git = (config: Config): GitOps | IGitOps => {
  if (!config.hasFeature('gitSupport')) {
    return nop
  }

  return new GitOps(config)
}

// @TODO ought to update this definitions
// Extends SimpleGit to add the missing methods.
// Reference: https://github.com/types/simple-git/blob/master/src/index.d.ts
interface ISimpleGit extends simplegit.SimpleGit {
  add (files: string | string[]): Promise<void>
  commit (message: string, files: string[], options?: any): Promise<void>
  rm (files: string[]): Promise<void>
}

export class GitOps implements IGitOps {
  public docHelpers: Doc
  private _git: ISimpleGit

  constructor (public config: Config) {
    this.docHelpers = doc(this.config)
    this._git = simplegit(this.config.get('documentRoot')) as ISimpleGit
  }

  public async $add (docName: string, into: string): Promise<void> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    await this._git.add(pathname)
    return
  }

  public async $rm (docName: string, into: string): Promise<void> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    await this._git.rm([pathname])
    return
  }

  public async $commit (docName: string, into: string, comment: string): Promise<void> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    await this._git.commit(comment, [pathname])
    return
  }
}

export default git
