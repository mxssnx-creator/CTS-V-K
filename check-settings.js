const { getAppSettings } = require('./lib/redis-db.js');

(async () => {
  try {
    const settings = await getAppSettings();
    console.log('App Settings:', JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
})();