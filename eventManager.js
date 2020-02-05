const node_schedule = require('node-schedule');
const mongoose = require('mongoose');
const Countdown = mongoose.model('countdowns');

module.exports = () => {
  const countdowns = {
    cache: [],
  };

    updateCache = (fireDate, callback = null) => {
    Countdown.where({
      ending: {
        $gte: fireDate - (1000 * 60 * 2),
        $lte: new Date(fireDate + (1000 * 60 * 8))
      }
    }).then(x => {
      countdowns.cache = x.map(x => (
        {
          id: x._id,
          ending: x.ending,
          message: x.message,
          hiddenMessage: x.hiddenMessage,
          key: x.key
        }));
      if (callback) callback();
    });
  };
  updateCache(Date.now(), () => node_schedule.scheduleJob('50 * * * * *', updateCache));

  return {
    subscribe: (key, callback) => {
      const item = countdowns.cache.find(x => x.key === key);
      return item ? node_schedule.scheduleJob(item.ending, () => callback(item.hiddenMessage)) : null;
    }
  }
};
