const passport = require('passport');
const passportGoogleOauth = require('passport-google-oauth20');
const requireLogin = require('./require-login');
const keys = require('./config/keys');

module.exports = (app, db) => {
  passport.serializeUser((user, done) => done(null, user.uuid));
  passport.deserializeUser((id, done) => db.getUser(id).then(user => done(null, user)));

  passport.use(
    new passportGoogleOauth.Strategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback',
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        db.getUserByGoogleId(profile.id)
          .then(existing => existing ||
          db.createUser({googleId: profile.id})
            .then(db.getUser))
          .then(user => done(null, user));
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());

    app.get(
        '/auth/google',
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })
    );
    app.get(
        '/auth/google/callback',
        passport.authenticate('google'),
        (req, res) => {
            res.redirect('/countdowns');
        }
    );
    app.get('/api/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
    app.get('/api/current_user', requireLogin, (req, res) => {
        res.send(req.user);
    });
};