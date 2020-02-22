const node_schedule = require('node-schedule');

module.exports = db => {
  const countdowns = {cache: {}};

  const updateCache = (fireDate, callback = null) => {
    const fireMin = Math.floor((new Date(fireDate)).getTime() / (1000 * 60));
    const range = [];
    for (let i = fireMin - 1; i < fireMin + 8; i++) range.push(i);

    db.getCountdownsByEndingRange(range)
      .then(x => countdowns.cache = x.reduce((acc, x) => ({...acc, [x.key]: x}), {}))
      .then(() => callback && callback());
  };
  updateCache(Date.now(), () => node_schedule.scheduleJob('50 * * * * *', updateCache));

  return {
    subscribe: (key, callback) =>
      countdowns.cache[key] ?
        node_schedule.scheduleJob(countdowns.cache[key].ending, () => callback(countdowns.cache[key].hidden)) : null
  }
};
