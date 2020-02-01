const mongoose = require('mongoose');
const keys = require('./config/keys');
mongoose.model('users',
  new mongoose.Schema({
    googleEmail: String,
    googleAvatar: String,
    googleId: String,
  }));
mongoose.model('countdowns',
  new mongoose.Schema({
    user: {type: mongoose.Types.ObjectId},
    ending: Date,
    message: String,
    hiddenMessage: String,
    autoInc: Number,
    key: String,
  }));
mongoose.model('counters',
  new mongoose.Schema({
    value: Number,
  }));
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: !keys.production,
  autoCreate: !keys.production,
});
