import { Config } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import { noop as _noop } from 'lodash'
import { ListLogSummary } from 'simple-git'
import * as simplegit from 'simple-git/promise'

export interface IGitOps {
  $add (docName: string, into: string): void
  $commit (docName: string, into: string, comment: string): void
  $rm (docName: string, into: string): void
  $history (docName: string, into: string): void
  $show (docName: string, into: string, version: string): Promise<string>
}

const nop: IGitOps = {
  $add: _noop,
  $commit: _noop,
  $history: _noop,
  $rm: _noop,
  $show: _noop
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
  log (options?: any): Promise<ListLogSummary>
  show (options: string | string[]): Promise<string>
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

  public async $history (docName: string, into: string): ListLogSummary {
    const pathname = this.docHelpers.fullPathname(docName, into)
    const log = await this._git.log({
      file: pathname
    })

    return log
  }

  public async $show (docName: string, into: string, version: string): Promise<string> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    return await this._git.show([`${version}:${pathname}`])
  }

  // revert: function (path, revision, author, callback) {
  //   gitExec(['checkout', revision, docSubdir + path], function (err, data) {
  //     if (err) {
  //       callback(err, ('' + data).toString().trim())
  //       return
  //     }
  //     gitMech.commit(path, 'Reverted to ' + revision, author, function (err, data) {
  //       callback(err, ('' + data).toString().trim())
  //     })
  //   })
  // }

}

export default git
