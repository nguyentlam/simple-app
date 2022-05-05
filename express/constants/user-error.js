
class UserError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
};

const ERRORS = {
  USER_EMAIL_IN_USE : new UserError(401, 'Email is already in use.'),
  USER_EMAIL_IN_USE_WITH_GOOGLE: new UserError(402, 'Email is already used to login with Google.'),
  USER_EMAIL_IN_USE_WITH_FACEBOOK: new UserError(403, 'Email is already used to login with Facebook.'),
  USER_NOT_EXISTS: new UserError(404, 'User does not exist'),
  USER_LOGIN_WITH_GOOGLE: new UserError(405, 'User login with Google.'),
  USER_LOGIN_WITH_FACEBOOK: new UserError(406, 'User login with Facebook.'),
  USER_PASSWORD_NOT_MATCH: new UserError(407, 'User password does not match.'),
};

module.exports = ERRORS;
