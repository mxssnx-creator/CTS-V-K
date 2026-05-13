import { initRedis, getRedisClient, setSettings, getSettings } from './lib/redis-db';

async function testStrategyStorage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== TESTING STRATEGY STORAGE ===');
  
  const connectionId = 'bingx-x01';
  const symbol = 'BTCUSDT';
  const stage = 'base';
  const key = `strategies:${connectionId}:${symbol}:${stage}:sets`;
  
  console.log(`Storing to key: ${key}`);
  
  const dummyData = {
    sets: [
      {
        setKey: 'test:set:1',
        indicationType: 'direction',
        direction: 'long',
        entries: [],
        avgProfitFactor: 1.5,
        avgDrawdownTime: 0,
        entryCount: 0
      }
    ],
    count: 1,
    created: new Date()
  };
  
  console.log(`Data to store:`, JSON.stringify(dummyData, null, 2));
  
  await setSettings(key, dummyData);
  
  console.log(`\nStored. Now checking what keys exist under settings:*`);
  
  const allSettingsKeys = await client.keys('settings:*');
  console.log(`Total settings keys: ${allSettingsKeys.length}`);
  allSettingsKeys.forEach(key => {
    console.log(`  ${key}`);
  });
  
  // Now try to retrieve it
  console.log(`\nRetrieving data from key: ${key}`);
  const retrieved = await getSettings(key);
  console.log(`Retrieved:`, JSON.stringify(retrieved, null, 2));
  
  // Also check the raw hash
  const rawKey = `settings:${key}`;
  console.log(`\nChecking raw hash key: ${rawKey}`);
  const rawHash = await client.hgetall(rawKey);
  console.log(`Raw hash:`, JSON.stringify(rawHash, null, 2));
  
  // Clean up
  await client.del(rawKey);
}

testStrategyStorage().catch(console.error);