const events = require('../eventManager')();

module.exports = app => {
  app.ws('/api/socket', ws => {
    const jobs = [];
    ws.on('message', (msg) => {
      const job = events.subscribe(msg.toString(), (hidden) => {
        ws.send(hidden);
      });
      if (job) jobs.push(job);
    });
    ws.on('close', () => {
      jobs.forEach(j => j.cancel());
    });
  });
};