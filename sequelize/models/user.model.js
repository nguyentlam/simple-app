const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const model = sequelize.define('user', {
    name: {
      type: DataTypes.STRING,
      field: 'name',
    }, 
    email: {
      type: DataTypes.STRING,
      field: 'email',
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: { 
      type: DataTypes.STRING(1024),
      field: 'password'
    },
    salt: { 
      type: DataTypes.STRING(32),
      field: 'salt'
    },
    verified: {
      type: DataTypes.BOOLEAN,
      field: 'verified',
      defaultValue: false
    },
    signupBy: {
      type: DataTypes.STRING(16),
      field: 'signup_by',
      defaultValue: 'email'
    }
  },
  {
    underscored: true
  }
  );

  model.sync();
}
