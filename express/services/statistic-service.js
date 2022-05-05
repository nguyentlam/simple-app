const sequelize = require('../../sequelize'),
  {Op} = require('sequelize');

function getAllUsers() {
  const now = new Date();
  const today = new Date(now.toDateString());
  return sequelize.models.user.findAll({
    include: [ {
      model: sequelize.models.session,
      required: false,
      attributes: [],
    }],
    attributes: ['id', 'name', 'email', 'createdAt', [sequelize.fn('count', sequelize.col('sessions.user_id')), 'totalLogin'], [sequelize.fn('max', sequelize.col('sessions.created_at')), 'lastLogin']],
    group: ['id', 'name', 'email', 'createdAt'],
    order: [['id', 'asc']],
    raw: true,
  });
}

function countAllUsers() {
  return sequelize.models.user.count();
}

function countUsesActiveToday() {
  const now = new Date();
  const today = new Date(now.toDateString());
  return sequelize.models.session.count({
    distinct: true,
    col: 'userId',
    where: {createdAt: {[Op.gte]: today}}
  });
}

function calculateAverageActiveUsersIn7day() {
  const now = new Date();
  const today = new Date(now.toDateString());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const f = (n) => {
    if (n <= 0) {
      return [];
    }
    const arr = f(n - 1);
    arr.push(n - 1);
    return arr;
  }

  const numArr = f(7); //[0, 1, 2, 3, 4, 5, 6];

  const periodArr = numArr.map(n => {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - n);
    const endDate = new Date(tomorrow);
    endDate.setDate(endDate.getDate() - n);
    return [startDate, endDate];
  });

  return Promise.all(periodArr.map(([startDate, endDate]) => {
    return countUsersActiveInPeriod(startDate, endDate);
  }))
  .then(results => {
    return results.reduce((a, b) => a + b , 0) / results.length;
  });
}

function countUsersActiveInPeriod(startTime, endTime) {
  return sequelize.models.session.count({
    distinct: true,
    col: 'userId',
    where: {
      [Op.and]: [
        {createdAt: {[Op.gte]: startTime}},
        {createdAt: {[Op.lt]: endTime}}
      ]
    }
  });
}
module.exports = {
  getAllUsers,
  countAllUsers,
  countUsesActiveToday,
  calculateAverageActiveUsersIn7day
};