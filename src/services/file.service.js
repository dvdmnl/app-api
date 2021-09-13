const httpStatus = require('http-status');
const path = require('path');
const {scryptSync, createCipheriv} = require('crypto')
const {mkdirSync, existsSync, writeFileSync} = require('fs')
const {User} = require('../models');
const ApiError = require('../utils/ApiError');

const users = require('../users.json')

const queryFiles = async (userId) => {
  return users[userId].files;
};


const encrypt = (buffer, userId) => {
  const algorithm = 'aes-192-cbc'
  const iv = Buffer.alloc(16, 0)
  const key = scryptSync(userId, 'salt', 24)

  const cipher = createCipheriv(algorithm, key, iv)
  return Buffer.concat([cipher.update(buffer), cipher.final()])
}

const saveEncryptedFile = (buffer, filePath, userId, originalname) => {
  filePath = `${filePath}/${userId}/files`
  if (!existsSync(path.dirname(filePath))) {
    mkdirSync(path.dirname(filePath), {recursive: true})
  }
  writeFileSync(filePath + originalname, encrypt(buffer, userId))
}

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};


/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<User>}
 */
const getUserByUsername = async (username) => {
  const userID = Object.keys(users).find((userKey) => {
    return users[userKey].username === username
  })

  return users[userID]
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  saveEncryptedFile,
  getUserByUsername,
  queryFiles
};
