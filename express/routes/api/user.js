const {body, validationResult} = require('express-validator'),
  router = require('express').Router(),
  userService = require('../../services/user-service'),
  statisticService = require('../../services/statistic-service'),
  auth = require('../../auth/auth'),
  moment = require('moment'),
  ERRORS = require('../../constants/user-error'),
  {TIMESTAMP_FORMAT} = require('../../constants/constants');

router.get('/all', auth.required, async(req, res) => {
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

  res.status(200).json({users, statistic});
})

module.exports = router;