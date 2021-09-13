const express = require('express');
const multer = require('multer');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const fileController = require('../../controllers/file.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() })

router
  .route('/')
  .get(fileController.getFiles)
  .put(upload.single('file'), fileController.uploadFile);

router
  .route('/:fileId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
