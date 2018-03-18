import { NextFunction, Request, Response } from 'express'
import { cloneDeep as _clone } from 'lodash'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    recent.apply(route, [req, res, next])
  }
}

const recent = async function(req: Request, res: Response, next: NextFunction): Promise<void> {
  this.title = 'Jingo – Recent edits'

  let items
  try {
    items = await this.git.$recent()
  } catch (err) {
    res.status(500).render('500', { err })
    return
  }

  const recentEdits = items.map(item => {
    const log = _clone(item[1])
    log.date = new Date(log.date * 1000)
    return {
      item: this.docHelpers.splitPath(item[0]),
      log
    }
  })

  const scope: object = {
    recentEdits
  }

  this.render(req, res, 'doc-recents', scope)
}
