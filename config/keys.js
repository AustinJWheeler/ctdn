module.exports = process.env.NODE_ENV === 'production' ? {
  production: true,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_URI,
  expressSessionSecret: process.env.EXPRESS_SESSION_SECRET,
} : require('./dev');
