const {expressjwt: jwt}  = require('express-jwt'),
  {secret} = require(process.cwd() + '/config');

function getTokenFromHeader(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

var auth = {
  required: jwt({
    secret: secret,
    algorithms: ["HS256"],
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
