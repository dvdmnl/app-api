const catchAsync = require('../utils/catchAsync');
const { authService, tokenService } = require('../services');


const loginWithUserName = catchAsync(async (req, res) => {
  const { username } = req.body;
  const user = await authService.loginUserWithUsername(username);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});


module.exports = {
  loginWithUserName
};
