import { check } from 'express-validator/check'
import { sanitize } from 'express-validator/filter'

// Returns a validator chains for the new document
export const validateCreate = () => {
  return [
    check('docTitle')
      .isLength({ min: 1 })
      .withMessage('The document title cannot be empty')
      .trim(),

    check('into').trim(),

    check('content')
      .isLength({ min: 1 })
      .withMessage('The document content cannot be empty')
      .trim(),

    sanitize(['docTitle', 'content', 'into'])
  ]
}
