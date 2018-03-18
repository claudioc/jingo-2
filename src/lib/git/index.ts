import { Config } from '@lib/config'
import doc, { Doc } from '@lib/doc'
import { noop as _noop } from 'lodash'
import { ListLogLine, ListLogSummary } from 'simple-git'
import * as simplegit from 'simple-git/promise'

export interface IGitOps {
  $add(docName: string, into: string): void
  $commit(docName: string, into: string, comment: string): void
  $diff(docName: string, into: string, left: string, right: string): Promise<string[]>
  $history(docName: string, into: string): void
  $ls(): Promise<string[]>
  $recent(): Promise<ListLogLine[]>
  $restore(docName: string, into: string, version: string): Promise<void>
  $rm(docName: string, into: string): void
  $show(docName: string, into: string, version: string): Promise<string>
}

const nop: IGitOps = {
  $add: _noop,
  $commit: _noop,
  $diff: _noop,
  $history: _noop,
  $ls: _noop,
  $recent: _noop,
  $restore: _noop,
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
  add(files: string | string[]): Promise<void>
  commit(message: string, files: string[], options?: any): Promise<void>
  rm(files: string[]): Promise<void>
  log(options?: any): Promise<ListLogSummary>
  raw(options: any): Promise<any>
  show(options: string | string[]): Promise<string>
}

export class GitOps implements IGitOps {
  public docHelpers: Doc
  private _git: ISimpleGit | null

  constructor(public config: Config) {
    this.docHelpers = doc(this.config)

    // We need to delay the initialization of the git driver
    // to when we really need it, otherwise some tests cannot
    // even started (it's not possible to have the simple-git
    // library use our fakeFs)
    this._git = null
  }

  private get driver() {
    if (this._git) {
      return this._git
    }

    return (this._git = simplegit(this.config.get('documentRoot')) as ISimpleGit)
  }

  public async $add(docName: string, into: string): Promise<void> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    await this.driver.add(pathname)
    return
  }

  public async $commit(docName: string, into: string, comment: string): Promise<void> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    await this.driver.commit(comment, [pathname])
    return
  }

  public async $diff(
    docName: string,
    into: string,
    left: string,
    right: string
  ): Promise<string[]> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    const diffs = await this.driver.raw(['diff', '--no-color', '-b', left, right, '--', pathname])
    return diffs ? diffs.trim().split('\n') : []
  }

  public async $history(docName: string, into: string): ListLogSummary {
    const pathname = this.docHelpers.fullPathname(docName, into)
    const log = await this.driver.log({
      file: pathname
    })
    return log
  }

  public async $restore(docName: string, into: string, version: string): Promise<void> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    await this.driver.checkout([version, pathname])
    await this.driver.commit(`${docName} restored to ${version}`, [pathname])
  }

  public async $rm(docName: string, into: string): Promise<void> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    await this.driver.rm([pathname])
    return
  }

  public async $show(docName: string, into: string, version: string): Promise<string> {
    const pathname = this.docHelpers.fullPathname(docName, into)
    return await this.driver.show([`${version}:${pathname}`])
  }

  public async $ls(): Promise<string[]> {
    const items = await this.driver.raw(['ls-tree', '--name-only', '-r', 'HEAD'])
    return items ? items.trim().split('\n') : []
  }

  public async $recent(): Promise<[string, ListLogLine]> {
    const items = await this.$ls()

    const logFormat = {
      author_email: '%ae',
      author_name: '%aN',
      date: '%at',
      hash: '%H',
      message: '%s%d'
    }

    const logEntries = new Map()
    await Promise.all(
      items.map(async filepath => {
        logEntries.set(
          filepath,
          (await this.driver.log({
            file: filepath,
            format: logFormat
          })).latest
        )
      })
    )

    // Sort the entries from the most recent
    return Array.from(logEntries).sort((a, b) => {
      return b[1].date - a[1].date
    }) as any
  }
}

export default git
