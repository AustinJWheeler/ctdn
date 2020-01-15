const passport = require('passport');
const passportGoogleOauth = require('passport-google-oauth20');
const mongoose = require('mongoose');
const requireLogin = require('./require-login');
const keys = require('./config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new passportGoogleOauth.Strategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({googleId: profile.id})
                .then(existing => existing ||
                    new User({googleId: profile.id}).save())
                .then(user => done(null, user));
        }
    )
);

module.exports = app => {
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
            res.redirect('/');
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