const router = require('express').Router(),
  sequelize = require('../../sequelize'),
  userService = require('../services/user-service'),
  emailService = require('../services/email-service'),
  tokenService = require('../services/token-service'),
  statisticService = require('../services/statistic-service'),
  sesssionService = require('../services/session-service'),
  {body, validationResult} = require('express-validator'),
  moment = require('moment'),
  hash = require('../helpers/hash'),
  {requireLogin, requireVerified} = require('../auth/passport'),
  ERRORS = require('../constants/user-error'),
  {SIGNUPS, TIMESTAMP_FORMAT} = require('../constants/constants');

router.get('/', async(req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('index');
});

router.get('/dashboard', requireLogin, async(req, res) => {
  if (!req.user.isVerified) {
    return res.redirect('/resend-verification');
  }
  const rawUsers = await statisticService.getAllUsers();
  const users = rawUsers.map((rawUser) => {
    const user = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      createdAt: moment(rawUser.createdAt).format(TIMESTAMP_FORMAT),
      totalLogin: rawUser.totalLogin,
      lastLogin: moment(rawUser.lastLogin).format(TIMESTAMP_FORMAT),
    };
    return user;
  });

  const totalUsers = users.length;
  const totalActiveUsersToday = await statisticService.countUsesActiveToday();
  const averageActiveUsersIn7day = await statisticService.calculateAverageActiveUsersIn7day();

  const statistic = {
    totalUsers: totalUsers,
    totalActiveUsersToday: totalActiveUsersToday,
    averageActiveUsersIn7day: averageActiveUsersIn7day.toFixed(2)
  };
  res.render('dashboard', { users: users, statistic: statistic});
});

router.get('/signup', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('signup');
});

const signupValidation = [
  body('name').isString()
  .notEmpty().withMessage("Name is required"),
  body('password').notEmpty().withMessage("Password is required")
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }).withMessage("Password must be at least 8 characters in length, contains at least one lower character, upper character, digit character and special character"),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirm password does not match password');
    }
    return true;
  }),
  body('email').notEmpty().withMessage("Email is required")
  .isEmail().withMessage("Email is invalid")
  .normalizeEmail(),
];
router.post('/signup', signupValidation, async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('signup', {validateErrors: errors.array()});
  }

  const {name, password, email} = req.body;

  try {
    const existedUser = await userService.findByEmail(email);

    if (existedUser) {
      if (existedUser.signupBy == SIGNUPS.GOOGLE) {
        return res.render('signup', {error: ERRORS.USER_EMAIL_IN_USE_WITH_GOOGLE});
      } else if (existedUser.signupBy == SIGNUPS.FACEBOOK) {
        return res.render('signup', {error: ERRORS.USER_EMAIL_IN_USE_WITH_FACEBOOK});
      }
      return res.render('signup', {error: ERRORS.USER_EMAIL_IN_USE});
    }

    const salt = hash.generateSalt();
    const hashedPassword = hash.hashPassword(salt, password);

    const newUser = await userService.create({
      name,
      password: hashedPassword,
      salt,
      email,
      signupBy: SIGNUPS.EMAIL,
    });

    const token = tokenService.generateToken(newUser.id);
    const baseUrl = req.protocol + '://' + req.get('host');
    const link = baseUrl + '/verify?token=' + encodeURIComponent(token);
    //console.log(link);

    emailService.sendEmailUseTemplate(email, 'signup', {user: name, link: link});

    req.login(newUser, function(err) { // login function by passport
      if (err) { return next(err); }
      sesssionService.save(req.session); // save session on login for statistic
      return res.redirect('/');
    });

  } catch (error)  {
    res.render('signup', {error: {message: error.message}});
  };
});

router.get('/verify', async(req, res) => {
  const token = req.query.token;

  const userId = tokenService.verifyToken(token);
  if (!userId) {
    res.send('Verify link is expired or invalid.');
  }

  const user = await userService.findById(userId);
  if (!user) {
    return res.send('Verify link is expired or invalid.');
  }

  if(user.verified) {
    return res.send('Your email is already verified.');
  }

  let [num] = await userService.markEmailVerified(userId);
  
  user.verified = true;
  req.logIn(user, function(error) { // update passport user session
    if (error) {
      return next(error);
    }
    res.send('Your email is successfully verified.');
  })
  
});

router.get('/resend-verification', requireLogin, async(req, res, next) => {
  if (req.user.isVerified) {
    return res.redirect('/');
  }
  res.render('resend-verification');
});

router.post('/resend-verification', requireLogin, async(req, res, next) => {
  if (req.user.isVerified) {
    return res.redirect('/');
  }

  const user = await userService.findById(req.user.id);
  if (!user) {
    return res.redirect('error');
  }
  
  const token = tokenService.generateToken(user.id);
  const baseUrl = req.protocol + '://' + req.get('host');
  const link = baseUrl + '/verify?token=' + encodeURIComponent(token);

  emailService.sendEmailUseTemplate(user.email, 're-verify', {user: user.name, link: link});
  
  res.render('resend-verification', {message: 'Resend email succesfully.'});
});


router.get('/profile', requireVerified, async(req, res) => {
  const rawUser = await userService.findById(req.user.id);
  const user = {
    name: rawUser.name,
    email: rawUser.email
  }
  res.render('profile', {user: user});
});

const updateProfileValidation = [
  body('name').isString().trim()
  .notEmpty().withMessage("Name is required"),
];
router.post('/profile', requireVerified, updateProfileValidation, async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('profile', {
      user: req.body, 
      validateErrors: errors.array()
    });
  }

  const {name} = req.body;
  const user = await userService.findById(req.user.id);
  if (!user) {
    return res.redirect('error');
  }

  user.name = name;
  await userService.save(user);
  
  req.logIn(user, function(error) {
    if (error) {
      return next(error);
    }
    const data = {
      name: user.name,
      email: user.email
    }
    return res.render('profile', {user: data, message: 'Update profile successfully.'});
  })
  
});

router.get('/reset-password', requireVerified, async(req, res) => {
  res.render('reset-password');
});

const resetPasswordValidation = [
  body('currentPassword').notEmpty().withMessage("Current password is required"),
  body('newPassword').notEmpty().withMessage("New password is required")
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }).withMessage("New password must be at least 8 characters in length, contains at least one lower character, upper character, digit character and special character"),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Confirm password does not match new password');
    }
    return true;
  })
];
router.post('/reset-password', requireVerified, resetPasswordValidation, async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('reset-password', {validateErrors: errors.array()});
  }

  const {currentPassword, newPassword} = req.body;
  const user = await userService.findById(req.user.id);
  if (!user) {
    return res.redirect('error');
  }

  if (user.signupBy == SIGNUPS.GOOGLE) {
    return res.render('reset-password', {error: ERRORS.USER_LOGIN_WITH_GOOGLE});
  } else if (user.signupBy == SIGNUPS.FACEBOOK) {
    return res.render('reset-password', {error: ERRORS.USER_LOGIN_WITH_FACEBOOK});
  }
  const hashedPassword = hash.hashPassword(user.salt, currentPassword);
  if (hashedPassword != user.password) {
    return res.render('reset-password', {error: ERRORS.USER_PASSWORD_NOT_MATCH});
  }

  const salt = hash.generateSalt();
  const newHashedPassword = hash.hashPassword(salt, newPassword);
  userService.updatePassword(user, salt, newHashedPassword);

  res.render('reset-password', {message: 'Update password successfully.'});
});

router.get('/error', (req, res) => {
  res.send("An error has occurred. Please try to visit later.");
});

module.exports = router;