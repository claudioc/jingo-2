import { Request } from 'express'
import { validationResult } from 'express-validator/check'
import { matchedData } from 'express-validator/filter'

const inspectRequest = (req: Request) => {
  const errors = validationResult(req)

  return {
    data: matchedData(req),
    errors: errors.isEmpty() ? null : validationErrorsToArray(errors)
  }
}

function validationErrorsToArray (errors) {
  const map = errors.mapped()
  return Object.keys(map).map(key => map[key].msg)
}

export default inspectRequest
