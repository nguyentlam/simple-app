const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const model = sequelize.define('session', {
    sid: {
      type: DataTypes.STRING,
      field: 'sid',
      primaryKey: true,
    }, 
    expires: {
      type: DataTypes.DATE,
      field: 'expires',
    },
    data: { 
      type: DataTypes.TEXT,
      field: 'data'
    },
    userId: { 
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
  },
  {
    underscored: true
  }
  );

  model.sync();
}
