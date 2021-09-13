const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {fileService} = require('../services');
const {verifyToken} = require("../services/token.service");

const uploadFile = catchAsync(async (req, res) => {
  const {file} = req
  console.log('file ===>', file)
  const bearerHeader = req.headers['authorization'];
  let userId = null
  if (bearerHeader) {
    userId = await getUserIdFromBearer(bearerHeader)
  }
  fileService.saveEncryptedFile(file.buffer, './storedFiles', userId.sub, file.originalname)
  res.status(httpStatus.CREATED).send(file.originalname);
});

const getFiles = catchAsync(async (req, res) => {
  const bearerHeader = req.headers['authorization'];
  let userId = null
  if (bearerHeader) {
    userId = await getUserIdFromBearer(bearerHeader)
  }
  const result = await fileService.queryFiles(userId.sub);
  res.send(result);
});

const getUserIdFromBearer = async (bearerHeader) => {
  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];
  const userId = await verifyToken(bearerToken)
  return userId
}

const getFile = catchAsync(async (req, res) => {
  const user = await fileService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const shareFile = catchAsync(async (req, res) => {
  const user = await fileService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteFile = catchAsync(async (req, res) => {
  await fileService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  uploadFile,
  getFiles,
  getFile,
  shareFile,
  deleteFile,
};
