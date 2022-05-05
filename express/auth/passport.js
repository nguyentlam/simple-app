const passport = require('passport'),
  LocalStategy = require('passport-local').Strategy,
  GoogleStrategy = require('passport-google-oidc').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy;
  userService = require('../services/user-service'),
  credentialService = require('../services/federated-credential-service')
  hash = require('../helpers/hash'),
  {SIGNUPS} = require('../constants/constants'),
  config = require('../../config');

passport.use('local', new LocalStategy({
    usernameField : 'email',
    passwordField : 'password'
  },
  function(email, password, done) {
    userService.findByEmail(email)
    .then(user => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      if (user.signupBy != SIGNUPS.EMAIL) {
        return done(null, false, { message: 'Email is already used to login with google or facebook.' });
      }

      const hashPassword = hash.hashPassword(user.salt, password);
      if (hashPassword == user.password) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
    })
    .catch(error => {
      return done(error);
    });
  }
));

passport.use('google', new GoogleStrategy({
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackUrl,
  scope: [ 'profile', 'email' ]
}, function verify(issuer, profile, done) {
  // console.log(profile);
  credentialService.find(issuer, profile.id)
  .then(credential => {
    if (!credential) { 
      // first time signin using google 
      const email = (profile.emails && profile.emails.length > 0)? profile.emails[0].value: null;
      let promise = Promise.resolve(null);
      if (email) {
        //check if user already signup with email and password
        promise = userService.findByEmail(email);
      }

      promise.then(user => {
        if (user) {
          // user already signup with email and password
          return user;
        }
        return userService.create({
          name: profile.displayName,
          email: email,
          signupBy: SIGNUPS.GOOGLE,
        }); 
        
      })
      .then(user => {
        credentialService.create({
          userId: user.id,
          provider: issuer,
          subject: profile.id
        })
        .then(() => {
          return done(null, user);
        })
      });

    } else {
      // already signin with google
      userService.findById(credential.userId)
      .then(user => {
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  })
  .catch(error => {
    return done(error);
  });
  
}));

passport.use('facebook', new FacebookStrategy({
  clientID: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.facebook.callbackUrl,
  profileFields: ['id', 'displayName', 'email']
  }, function verify(accessToken, refreshToken, profile, done) {
  // console.log(profile);
  const provider = 'https://www.facebook.com';
  credentialService.find(provider, profile.id)
  .then(credential => {
    if (!credential) { 
      // first time signin using facebook 
      const email = (profile.emails && profile.emails.length > 0)? profile.emails[0].value: null;
      let promise = Promise.resolve(null);
      if (email) {
        //check if user already signup with email and password
        promise = userService.findByEmail(email);
      }
      
      promise.then(user => {
        if (user) {
          // user already signup with email and password
          return user;
        } 
        return userService.create({
          name: profile.displayName,
          email: email,
          signupBy: SIGNUPS.FACEBOOK,
        });
      })
      .then(user => {
        credentialService.create({
          userId: user.id,
          provider: provider,
          subject: profile.id
        })
        .then(() => {
          return done(null, user);
        })
      });

    } else {
      // already signin with facebook
      userService.findById(credential.userId)
      .then(user => {
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  })
  .catch(error => {
    return done(error);
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    const isVerified = (user.signupBy != SIGNUPS.EMAIL) || (user.signupBy == SIGNUPS.EMAIL && user.verified);
    cb(null, { id: user.id, name: user.name, isVerified: isVerified});
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

function requireLogin(req, res, next) {
  if(req.user) {
    return next();
  }
  res.redirect("/login"); 
}

function requireVerified(req, res, next) {
  if(!req.user) {
    return res.redirect("/login");
  }
  if (!req.user.isVerified) {
    return res.redirect("/resend-verification")
  }
  next();
}

module.exports = {
  requireLogin,
  requireVerified
}


