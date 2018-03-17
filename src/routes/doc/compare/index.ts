import git from '@lib/git'
import { NextFunction, Request, Response } from 'express'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    compare.apply(route, [req, res, next])
  }
}

const compare = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { hash, docName, into } = req.query

  const diffs = await git(this.config).$diff(docName, into, hash[0], hash[1])

  console.log(diffs)
  const scope: object = {}

  this.render(req, res, 'doc-history', scope)
}
