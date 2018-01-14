import { Config } from '@lib/config'
import { noop as _noop } from 'lodash'
import * as simplegit from 'simple-git/promise'

export interface IGitOps {
  cmdAdd (docName: string, into: string): void
}

const nop: IGitOps = {
  cmdAdd: _noop
}

const git = (config: Config): GitOps | IGitOps => {
  if (!config.hasFeature('gitSupport')) {
    return nop
  }

  return new GitOps(config)
}

// @TODO ought to update this definitions
// Extends SimpleGit to add the missing methods.
// Reference: https://github.com/types/simple-git
interface ISimpleGit extends simplegit.SimpleGit {
  add (files: string | string[]): Promise<void>
}

export class GitOps implements IGitOps {
  private _git: ISimpleGit

  constructor (public config: Config) {
    this._git = simplegit(config.get('documentRoot')) as ISimpleGit
  }

  public async cmdAdd (docName: string, into: string) {
    // return await this._git.add()
  }

  public cmdCommit (docName: string, into: string, author: string, comment: string) {
    //
  }
}

export default git
