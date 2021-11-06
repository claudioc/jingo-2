import { check, sanitize } from 'express-validator';

export const validateCreate = () => {
  return [
    check('folderName')
      .isLength({ min: 1 })
      .withMessage('The folder title cannot be empty')
      .trim(),

    check('into').trim(),

    sanitize(['folderName', 'into'])
  ];
};

export const validateRename = () => {
  return [
    check('folderName')
      .isLength({ min: 1 })
      .withMessage('The folder title cannot be empty')
      .trim(),

    check('currentFolderName')
      .isLength({ min: 1 })
      .trim(),

    check('into').trim(),

    sanitize(['folderName', 'currentFolderName', 'into'])
  ];
};
