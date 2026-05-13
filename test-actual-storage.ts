import { initRedis, getRedisClient } from './lib/redis-db';

async function testActualStorage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== TESTING ACTUAL STORAGE LIKE STRATEGY COORDINATOR ===\n');
  
  // Exactly mimic what the strategy coordinator does in createBaseSets
  const connectionId = 'bingx-x01';
  const symbol = 'BTCUSDT';
  const baseKey = `strategies:${connectionId}:${symbol}:base:sets`;
  
  // Create some dummy base sets data like the coordinator would
  const baseSets = [
    {
      setKey: `base:set:1`,
      indicationType: 'direction',
      direction: 'long',
      entries: [{ value: 1, confidence: 0.8, profitFactor: 1.5 }],
      avgProfitFactor: 1.5,
      avgDrawdownTime: 0,
      entryCount: 1
    },
    {
      setKey: `base:set:2`,
      indicationType: 'move',
      direction: 'short',
      entries: [{ value: 1, confidence: 0.7, profitFactor: 1.3 }],
      avgProfitFactor: 1.3,
      avgDrawdownTime: 5,
      entryCount: 1
    }
  ];
  
  const dataToStore = {
    sets: baseSets,
    count: baseSets.length,
    created: new Date()
  };
  
  console.log(`Storing to key: ${baseKey}`);
  console.log(`Data to store:`, JSON.stringify(dataToStore, null, 2));
  
  // This is exactly what the strategy coordinator does
  await client.hset(`settings:${baseKey}`, {
    sets: JSON.stringify(baseSets),
    count: String(baseSets.length),
    created: new Date().toISOString()
  });
  
  console.log(`\nStored successfully. Now reading back...`);
  
  // Read it back exactly like getSettings does
  const rawHash = await client.hgetall(`settings:${baseKey}`);
  console.log(`Raw hash from Redis:`, JSON.stringify(rawHash, null, 2));
  
  // Parse it back
  const parsedSets = JSON.parse(rawHash.sets || '[]');
  const parsedCount = parseInt(rawHash.count || '0', 10);
  const parsedCreated = rawHash.created;
  
  console.log(`\nParsed data:`);
  console.log(`  Sets:`, JSON.stringify(parsedSets, null, 2));
  console.log(`  Count: ${parsedCount}`);
  console.log(`  Created: ${parsedCreated}`);
  
  // Now let's also check what keys actually exist
  console.log(`\n=== CHECKING WHAT KEYS ACTUALLY EXIST ===\n`);
  const allKeys = await client.keys('*');
  const strategyKeys = allKeys.filter(key => key.includes('strategies:'));
  console.log(`Found ${strategyKeys.length} strategy-related keys:`);
  strategyKeys.forEach(key => {
    console.log(`  ${key}`);
  });
  
  // Check specifically for our key
  const settingsKey = `settings:${baseKey}`;
  const exists = await client.exists(settingsKey);
  console.log(`\nDoes settings key ${settingsKey} exist? ${exists === 1}`);
  
  if (exists === 1) {
    const type = await client.type(settingsKey);
    console.log(`Type of ${settingsKey}: ${type}`);
    
    const hashData = await client.hgetall(settingsKey);
    console.log(`Hash data:`, JSON.stringify(hashData, null, 2));
  }
  
  // Clean up
  await client.del(`settings:${baseKey}`);
}

testActualStorage().catch(console.error);