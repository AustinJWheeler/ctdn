module.exports = process.env.NODE_ENV === 'production' ? {
  production: true,
  forceTLS: process.env.FORCE_TLS,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_URI,
  expressSessionSecret: process.env.EXPRESS_SESSION_SECRET,
  skip: process.env.SKIP_KEY,
} : require('./dev');
