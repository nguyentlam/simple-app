const { Sequelize } = require('sequelize'),
  {db} = require('../config');

const sequelize = new Sequelize(db.name, db.username, db.password, {
  host: db.host,
  port: db.port,
  dialect: db.dialect,
  dialectOptions: {
    ssl: db.enableSSL && {
      require: true,
      rejectUnauthorized: false
    }
  },
});

const modelDefines = [
  require('./models/user.model'),
  require('./models/federated-credential.model'),
  require('./models/session.model'),
]

for (const modelDefine of modelDefines) {
  modelDefine(sequelize);
}

const models = sequelize.models;

models.user.hasMany(models.federated_credential);
models.federated_credential.belongsTo(models.user, {foreignKey: {name: 'user_id'}});

models.user.hasMany(models.session);
models.session.belongsTo(models.user, {foreignKey: {name: 'user_id'}});

module.exports = sequelize;