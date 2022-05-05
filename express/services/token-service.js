const jwt = require('jsonwebtoken'),
  {emailSecret} = require('../../config');


function generateToken(userId) {
  return generateToken(userId, '');
}

function generateToken(userId, name) {
  const now = new Date();
  const expired = new Date(now);
  expired.setDate(now.getDate() + 1);

  const token = jwt.sign({
    id: userId,
    name: name,
    exp: Math.floor(expired.getTime() /1000)
  }, emailSecret);
  
  return token;
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, emailSecret);
    return decoded.id;
  } catch(error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
}