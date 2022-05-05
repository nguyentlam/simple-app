const sequelize = require('../../sequelize');

function create(credential) {
  return sequelize.models.federated_credential.create(credential);
}

function find(provider, subject) {
  return sequelize.models.federated_credential.findOne({where : {provider: provider, subject: subject}});
}

module.exports = {
  create,
  find
};