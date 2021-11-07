import { check } from 'express-validator';

// Returns a validator chains for the new document
export const validateCreate = () => {
  return [
    check('docTitle')
      .isLength({ min: 1 })
      .withMessage('The document title cannot be empty')
      .trim()
      .escape(),

    check('into')
      .trim()
      .escape(),

    check('content')
      .isLength({ min: 1 })
      .withMessage('The document content cannot be empty')
      .trim()
      .escape()
  ];
};
