module.exports = process.env.NODE_ENV === 'production' ? {
  production: true,
  forceTLS: process.env.FORCE_TLS,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_URI,
  expressSessionSecret: process.env.EXPRESS_SESSION_SECRET, // any string (not empty string) will work here testing purposes
  skip: process.env.SKIP_KEY, // 20 digit hex value for cipher '0xffffffffffffffffffff'
} : require('./dev');
