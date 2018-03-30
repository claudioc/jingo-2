import { NextFunction, Request, Response } from 'express'

export const get = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    login.apply(route, [req, res, next])
  }
}

export const post = route => {
  return (req: Request, res: Response, next: NextFunction) => {
    didLogin.apply(route, [req, res, next])
  }
}

const login = function(req: Request, res: Response, next: NextFunction): void {
  const scope = {}
  this.renderTemplate(res, __dirname, scope)
}

const didLogin = async function(req: Request, res: Response, next: NextFunction): Promise<void> {}
