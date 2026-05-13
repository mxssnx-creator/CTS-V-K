import { initRedis, getRedisClient, setSettings, getSettings } from './lib/redis-db';

async function debugStorageProcess() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== DEBUGGING THE STORAGE PROCESS ===\n');
  
  // Let's manually do exactly what the strategy coordinator does
  const connectionId = 'bingx-x01';
  const symbol = 'BTCUSDT';
  const baseKey = `strategies:${connectionId}:${symbol}:base:sets`;
  
  console.log(`1. Using baseKey: ${baseKey}`);
  
  // Create test data
  const baseSets = [
    {
      setKey: `base:set:1`,
      indicationType: 'direction',
      direction: 'long',
      entries: [{ value: 1, confidence: 0.8, profitFactor: 1.5 }],
      avgProfitFactor: 1.5,
      avgDrawdownTime: 0,
      entryCount: 1
    }
  ];
  
  const dataToStore = {
    sets: baseSets,
    count: baseSets.length,
    created: new Date()
  };
  
  console.log(`2. Data to store:`, JSON.stringify(dataToStore, null, 2));
  
  // Store it using setSettings (which is what the coordinator does)
  await setSettings(baseKey, dataToStore);
  console.log(`3. Stored using setSettings`);
  
  // Now check what's actually in Redis
  const settingsKey = `settings:${baseKey}`;
  console.log(`4. Checking Redis key: ${settingsKey}`);
  
  const rawHash = await client.hgetall(settingsKey);
  console.log(`5. Raw hash from Redis:`, JSON.stringify(rawHash, null, 2));
  
  // Now try to retrieve it using getSettings (which is what the coordinator does)
  console.log(`6. Trying to retrieve using getSettings('${baseKey}')`);
  const retrieved = await getSettings(baseKey);
  console.log(`7. Retrieved data:`, JSON.stringify(retrieved, null, 2));
  
  // Let's also try getting it directly with hgetall to compare
  console.log(`8. Trying direct hgetall('settings:${baseKey}')`);
  const directHash = await client.hgetall(`settings:${baseKey}`);
  console.log(`9. Direct hash result:`, JSON.stringify(directHash, null, 2));
  
  // Clean up
  await client.del(settingsKey);
}

debugStorageProcess().catch(console.error);