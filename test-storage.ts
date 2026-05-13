import { initRedis, getRedisClient, setSettings, getSettings } from './lib/redis-db';

async function testStorage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== TESTING STORAGE MECHANISM ===');
  
  const testKey = 'test:strategy:data';
  const testData = {
    sets: [{ id: 1, name: 'test set' }],
    count: 1,
    created: new Date()
  };
  
  console.log(`Storing data to key: ${testKey}`);
  console.log(`Data:`, JSON.stringify(testData, null, 2));
  
  await setSettings(testKey, testData);
  
  console.log(`\nRetrieving data from key: ${testKey}`);
  const retrieved = await getSettings(testKey);
  console.log(`Retrieved:`, JSON.stringify(retrieved, null, 2));
  
  // Also check what's actually in Redis
  const redisKey = `settings:${testKey}`;
  console.log(`\nChecking raw Redis key: ${redisKey}`);
  const rawData = await client.hgetall(redisKey);
  console.log(`Raw data:`, JSON.stringify(rawData, null, 2));
  
  // Clean up
  await client.del(redisKey);
}

testStorage().catch(console.error);