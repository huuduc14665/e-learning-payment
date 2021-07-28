const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('../config.json');
const User = require('../models/user.model')
const Role = require('../helpers/role')

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_PASSPORT_CLIENT_ID,
    clientSecret: config.GOOGLE_PASSPORT_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/user/auth/google/callback/"
  },
  function(accessToken, refreshToken, profile, done) {
    //   console.log(profile._json.email);
    //   console.log(profile._json.given_name);
    //   console.log(profile);
    //   return done(null, profile);
    User.findOne({ email: profile._json.email }, function (err, user) {
      if (user) {
        return done(err, user); 
      }
      else {
          const newUser = new User({
              email: profile._json.email,
              firstname: profile._json.given_name,
              lastname: profile._json.family_name,
              role: Role.Student//,
              //isVerified: true
          });
          newUser.save(function (err, user) {
              return done(err, user);
          })
      } // used to be done(null,user)
    });
  }
));

passport.use(new FacebookStrategy({
  clientID: config.FACEBOOK_APP_ID,
  clientSecret: config.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/api/user/auth/facebook/callback/",
  profileFields: ['emails', 'name']
},
function(accessToken, refreshToken, profile, done) {
  User.findOne({ email: profile._json.email }, function (err, user) {
    if (user) {
      return done(err, user); 
    }
    else {
        const newUser = new User({
            email: profile._json.email,
            firstname: profile._json.first_name,
            lastname: profile._json.last_name,
            role: Role.Student//,
            //isVerified: true
        });
        newUser.save(function (err, user) {
            return done(err, user);
        })
    } 
  });
}
));