const sequelize = require('./sequelize'),
  app = require('./express/app');

const PORT = process.env.PORT || 3000;

async function ensureDBConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

async function init() {
  await ensureDBConnection();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

init();
