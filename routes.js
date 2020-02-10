const passport = require('passport');
const mongoose = require('mongoose');
const requireLogin = require('./require-login');

const Countdown = mongoose.model('countdowns');
const Counter = mongoose.model('counters');

const cipher = require('./cipher');

module.exports = (app) => {

  app.get('/api/countdowns/:key', (req, res) => {
    Countdown.findOne({key: req.params.key}).then(x => {
      const now = Date.now();
      const showMessage = x.ending.getTime() < now;
      res.send({
        ending: x.ending,
        message: x.message,
        hiddenMessage: showMessage ? x.hiddenMessage : undefined,
        key: x.key,
        now,
      })
    })
  });

  app.get('/api/countdowns', requireLogin, (req, res) => {
    Countdown.where({user: req.user.id})
      .then(items => {
        const now = Date.now();
        res.send(items.map(x => ({
          ending: x.ending,
          message: x.message,
          hiddenMessage: x.hiddenMessage,
          key: x.key,
          now,
        })))
      });
  });

  app.post('/api/countdowns', requireLogin, (req, res) => {
    let {ending, message, hiddenMessage, key} = req.body;

    // TODO sanatize message input
    // TODO Check Date
    key = null;

    Counter
      .findOneAndUpdate({key: "countdown"},
        {$inc: {value: 1}}
      ).then(x => new Countdown({
      user: req.user.id,
      ending: new Date(ending),
      message: message,
      hiddenMessage: hiddenMessage,
      autoInc: key ? undefined : x.value,
      key: key ? key : cipher.encode64(cipher.encrypt(x.value)),
    }).save())
      .then(x => {
        res.send({key: x.key});
      });
  });
};
