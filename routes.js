const requireLogin = require('./require-login');

module.exports = (app, db) => {

  app.get('/api/countdowns/:key', (req, res) => {

    db.getCountdown(req.params.key).then(x => {
      const now = Date.now();
      const showMessage = x.ending < now;
      res.send({
        ending: x.ending,
        message: x.message.trim(),
        hiddenMessage: showMessage ? x.hidden.trim() : undefined,
        key: x.key,
        now,
      });
    });
  });

  app.get('/api/countdowns', requireLogin, (req, res) => {
    db.getCountdownsByUser(req.user.uuid)
      .then(items => {
        const now = Date.now();
        res.send(items.map(x => ({
          ending: x.ending,
          message: x.message.trim(),
          hiddenMessage: x.hidden.trim(),
          key: x.key,
          now,
        })));
      });
  });

  app.post('/api/countdowns', requireLogin, (req, res) => {
    let {ending, message, hiddenMessage, key} = req.body;

    db.createCountdown({
      user: req.user.uuid,
      ending: new Date(ending).getTime(),
      message: message + ' ',
      hidden: hiddenMessage + ' ',
    }).then(key => res.send({key}));
  });
};
