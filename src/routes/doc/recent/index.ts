import git from '@lib/git'
import { NextFunction, Request, Response } from 'express'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    recent.apply(route, [req, res, next])
  }
}

const recent = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Recent edits'

  const gitMech = git(this.config)
  let items
  try {
    items = await gitMech.$ls()
  } catch (err) {
    res.status(500).render('500', { err })
    return
  }

  const recentEdits = items.map(item => {
    return this.docHelpers.splitPath(item)
  })

  const scope: object = {
    recentEdits
  }

  this.render(req, res, 'doc-recents', scope)
}
