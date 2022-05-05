const {body, validationResult} = require('express-validator'),
  jwt = require('jsonwebtoken'),
  router = require('express').Router(),
  sequelize = require('../../../sequelize'),
  hash = require('../../helpers/hash'),
  validate = require('../../helpers/validate'),
  {secret} = require(process.cwd() + '/config'),
  ERRORS = require('../../constants/user-error');

const loginValidation = [
    body('email').notEmpty().isEmail(),
    body('password').notEmpty().isString(),
];
router.post('/login', validate(loginValidation), async(req, res) => {
  const {email, password} = req.body;

  try {
    const user = await sequelize.models.user.findOne({where: {email}});
    if (!user) {
      res.status(400).json(ERRORS.USER_LOGIN_ERROR);
      return;
    }

    const hashPassword = hash.hashPassword(user.salt, password);

    if (hashPassword == user.password) {
      const now = new Date();
      const expired = new Date(now);
      expired.setDate(now.getDate() + 1);

      const token = jwt.sign({
        id: user.id,
        email: user.email,
        exp: Math.floor(expired.getTime() /1000)
      }, secret);

      res.status(200).json({token, type: "Bearer"});
    } else {
      res.status(400).json(ERRORS.USER_LOGIN_ERROR);
    }

  } catch(error) {
    res.status(500).json({error: error.message});
  }
});

module.exports = router;