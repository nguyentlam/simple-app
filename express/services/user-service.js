const sequelize = require('../../sequelize'),
  {Op} = require('sequelize');

function create(user) {
  return sequelize.models.user.create(user);
}

function save(user) {
  return user.save({fields: ['name']})
}


function findById(userId) {
  return sequelize.models.user.findOne({where: {id: userId}})
}

function findByEmail(email) {
  return sequelize.models.user.findOne({where: {email: email}});
}

function markEmailVerified(userId) {
  return sequelize.models.user.update({verified: true}, { where: { id: userId }});
}

function updatePassword(user, salt, password) {
  user.salt = salt;
  user.password = password;
  user.save(['salt', 'password']);
}

module.exports = {
  save,
  create,
  findById,
  findByEmail,
  updatePassword,
  markEmailVerified
};