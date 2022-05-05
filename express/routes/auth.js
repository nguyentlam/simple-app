const router = require('express').Router(),
  passport = require('passport'),
  sesssionService = require('../services/session-service');

router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard');
  }
  const errors = req.session.messages; //failure message from passport
  delete req.session.messages;
  res.render('login', { errors });
});

/* This route hande login by email and password
*/
router.post('/login/password', passport.authenticate('local', {failureRedirect: '/login', failureMessage: true}), (req, res) => {
  sesssionService.save(req.session); // save session on login for statistic
  res.redirect('/');
});

/* 
 * This route redirects the user to Google, where they will authenticate.
 */
router.get('/login/federated/google', passport.authenticate('google'));

/*
  This route completes the authentication sequence when Google redirects the
  user back to the application.
*/
router.get('/oauth2/redirect/google', passport.authenticate('google', {failureRedirect: '/login'}), (req, res) => {
  sesssionService.save(req.session); // save session on login for statistic
  res.redirect('/');
});

/* 
 * This route redirects the user to Facebook, where they will authenticate.
 */
router.get('/login/federated/facecbook', passport.authenticate('facebook'));

/*
  This route completes the authentication sequence when Facebook redirects the
  user back to the application.
*/
router.get('/oauth2/redirect/facecbook', passport.authenticate('facebook', { failureRedirect: '/login', scope : ['email']}), (req, res) => {
  sesssionService.save(req.session); // save session on login for statistic
  res.redirect('/');
});

router.post('/logout',  (req, res) => {
  sesssionService.update(req.session); // update session on logout

  req.logOut(); //call passport logOut

  req.session.regenerate(function(error) {
    // prevent session fixation
    if (error) {
      console.error(error);
    }
    res.redirect('/');
  }); 
  
});

module.exports = router;