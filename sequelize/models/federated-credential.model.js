const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const model = sequelize.define('federated_credential', {
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    }, 
    provider: { 
      type: DataTypes.STRING,
      field: 'provider'
    },
    subject: { 
      type: DataTypes.STRING,
      field: 'subject'
    },
  },
  {
    underscored: true
  }
  );

  model.sync();
}
