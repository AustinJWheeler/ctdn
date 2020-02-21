const eventManager = require('./eventManager');

module.exports = (app, db) => {
  const events = eventManager(db);
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