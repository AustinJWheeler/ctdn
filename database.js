const mongoose = require('mongoose');
const keys = require('./config/keys');
mongoose.model('users',
    new mongoose.Schema({
        googleEmail: String,
        googleAvatar: String,
        googleId: String
    }));
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
