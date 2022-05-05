const sequelize = require('../../sequelize'),
  {Op} = require('sequelize'),
  { Session } = require('express-session');

/**
 * 
 * @param {Session} session express session object
 * @returns 
 */
function save(session) {
  const userSession = {
    sid : session.id,
    expires: session.cookie?.expires,
    data: JSON.stringify(session),
    userId: (session.passport && session.passport.user)? session.passport.user.id: null,
  };
  return sequelize.models.session.create(userSession);
}

/**
 * 
 * @param {Session} session express session object
 * @returns 
 */
 function update(session) {
  const updateData = {
    expires: session.cookie?.expires,
    data: JSON.stringify(session),
  };
  return sequelize.models.session.update(updateData, {where : {sid: session.id}});
}

module.exports = {
  save,
  update
};