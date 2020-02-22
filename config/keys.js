module.exports = process.env.NODE_ENV === 'production' ? {
  production: true,
  forceTLS: process.env.FORCE_TLS,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  dynamoTableName: process.env.TABLE_NAME,
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },
  expressSessionSecret: process.env.EXPRESS_SESSION_SECRET, // any string (not empty string) will work here for testing purposes
  skip: process.env.SKIP_KEY, // 20 digit hex value for cipher '0xffffffffffffffffffff'
} : require('./dev');
