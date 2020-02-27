const eventManager = require('./eventManager');

module.exports = (app, db) => {
  const events = eventManager(db);
  app.ws('/api/socket', ws => {
    const jobs = [];
    ws.on('message', (msg) => {
      const job = events.subscribe(msg.toString(), (hidden) => {
        ws.send('H:'+hidden);
      });
      if (job) jobs.push(job);
      else ws.send('E:key not in cache');
    });
    ws.on('close', () => {
      jobs.forEach(j => j.cancel());
    });
  });
};