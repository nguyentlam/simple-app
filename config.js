const config = {}

config.secret = 'secret';
config.emailSecret = 'emailSecret';

config.db = {};
config.db.name = process.env.DATABASE_NAME || 'db';
config.db.username = process.env.DATABASE_USERNAME || 'username';
config.db.password = process.env.DATABASE_PASSWORD || 'password';
config.db.host = process.env.DATABASE_HOST || 'localhost';
config.db.port = process.env.DATABASE_PORT || '5432';
config.db.dialect = process.env.DATABASE_DIALECT || 'postgres';
config.db.enableSSL = false;

config.google = {};
config.google.clientId = process.env.GOOGLE_CLIENT_ID || '';
config.google.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
config.google.callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/oauth2/redirect/google/';

config.facebook = {};
config.facebook.clientId = process.env.FACEBOOK_APP_ID || '';
config.facebook.clientSecret = process.env.FACEBOOK_APP_SECRET || '';
config.facebook.callbackUrl = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/oauth2/redirect/facecbook/';

config.smtp = {};
config.smtp.host = process.env.STMP_HOST || "";
config.smtp.port = process.env.STMP_PORT || 587;
config.smtp.user = process.env.STMP_USERNAME || '';
config.smtp.pass = process.env.STMP_PASSWORD || '';
config.smtp.sender = process.env.STMP_SENDER || 'example@email.com';

module.exports = config;