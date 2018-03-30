import fsApi from '@lib/fs-api'
import * as child_process from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as semver from 'semver'
import { promisify } from 'util'

import { Config } from '@lib/config'

const checkDocumentRoot = async (config: Config, documentRoot: string): Promise<void> => {
  const fsapi = fsApi(config.fsDriver)
  if (!documentRoot) {
    throw new Error('The document root is not defined')
  }

  if (!await fsapi.access(documentRoot, fs.constants.R_OK | fs.constants.W_OK)) {
    throw new Error(`EACCES The document root is not accessible by Jingo (${documentRoot})`)
  }

  const stat = await fsapi.stat(documentRoot)
  if (!stat.isDirectory()) {
    throw new Error(`EACCES The document root must be a directory (${documentRoot})`)
  }

  // @TODO it must be an absolute path (`path.isAbsolute`)
}

const checkGit = async (config: Config): Promise<void> => {
  const fsapi = fsApi(config.fsDriver)
  const documentRoot = config.get('documentRoot')
  const exec = promisify(child_process.exec)
  let result

  try {
    result = await exec('git --version')
  } catch (err) {
    throw new Error('(git support) The `git` binary is not in the path.')
  }

  let parts = result.stdout.trim().split(' ')
  if (parts[0] !== 'git' || parts.length < 3) {
    throw new Error("(git support) The `git` binary doesn't look like git to me.")
  }

  parts = parts[2].split('.').slice(0, 3)
  const version = parts.concat(Array(3 - parts.length).fill('0')).join('.')

  if (!semver.valid(version)) {
    throw new Error(`(git support) Unrecognized git version ${version}`)
  }

  if (!semver.satisfies(version, '>=1.8.5')) {
    throw new Error(`(git support) Jingo requires a git with version >= 1.8.5 (found ${version})`)
  }

  const gitDir = path.join(documentRoot, '.git')
  if (!await fsapi.access(gitDir, fs.constants.R_OK | fs.constants.W_OK)) {
    throw new Error(`(git support) The document root is not a git repository`)
  }

  const remote = config.get('features.gitSupport.remote')
  if (remote !== '') {
    result = await exec('git remote')
    const remotes = result.stdout.split('\n')
    if (!remotes.includes(remote)) {
      throw new Error(`(git support) The specified remote is not defined`)
    }
  }

  const branch = config.get('features.gitSupport.branch')
  // @TODO make this use of the simple-git library
  result = await exec(
    `git --git-dir=${gitDir} --work-tree=${documentRoot} symbolic-ref --short HEAD`
  )
  if (result.stdout.split('\n')[0] !== branch) {
    throw new Error(`(git support) The local repository is not on branch ${branch}`)
  }
}

export default {
  checkDocumentRoot,
  checkGit
}
