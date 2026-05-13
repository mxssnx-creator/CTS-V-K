import { initRedis, getRedisClient, setSettings } from './lib/redis-db';

async function testStrategyPersistence() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== TESTING STRATEGY PERSISTENCE ===');
  
  const connectionId = 'bingx-x01';
  const symbol = 'BTCUSDT';
  
  // Test BASE sets persistence
  console.log('\n--- Testing BASE sets persistence ---');
  const baseKey = `strategies:${connectionId}:${symbol}:base:sets`;
  const baseSets = [
    {
      setKey: 'base:set:1',
      indicationType: 'direction',
      direction: 'long',
      entries: [{ value: 1, confidence: 0.8, profitFactor: 1.5 }],
      avgProfitFactor: 1.5,
      avgDrawdownTime: 0,
      entryCount: 1
    },
    {
      setKey: 'base:set:2',
      indicationType: 'move',
      direction: 'short',
      entries: [{ value: 1, confidence: 0.7, profitFactor: 1.3 }],
      avgProfitFactor: 1.3,
      avgDrawdownTime: 5,
      entryCount: 1
    }
  ];
  
  console.log(`Storing BASE sets to key: ${baseKey}`);
  console.log(`Number of sets: ${baseSets.length}`);
  
  try {
    await setSettings(baseKey, { sets: baseSets, count: baseSets.length, created: new Date() });
    console.log(`✓ BASE sets stored successfully`);
  } catch (error) {
    console.error(`✗ Failed to store BASE sets:`, error);
    return;
  }
  
  // Verify it was stored
  const settingsKey = `settings:${baseKey}`;
  const storedData = await client.hgetall(settingsKey);
  if (storedData && Object.keys(storedData).length > 0) {
    console.log(`✓ BASE sets verified in Redis:`);
    console.log(`  Raw data:`, JSON.stringify(storedData, null, 2));
    
    // Parse the sets data
    if (storedData.sets) {
      try {
        const parsedSets = JSON.parse(storedData.sets);
        console.log(`  Parsed sets count: ${parsedSets.length}`);
        if (parsedSets.length > 0) {
          console.log(`  First set:`, JSON.stringify(parsedSets[0], null, 2));
        }
      } catch (e) {
        console.log(`  Error parsing sets data:`, e);
      }
    }
  } else {
    console.log(`✗ BASE sets NOT found in Redis at key: ${settingsKey}`);
  }
  
  // Test MAIN sets persistence
  console.log('\n--- Testing MAIN sets persistence ---');
  const mainKey = `strategies:${connectionId}:${symbol}:main:sets`;
  const mainSets = [
    {
      setKey: 'main:set:1',
      indicationType: 'direction',
      direction: 'long',
      entries: [{ value: 1, confidence: 0.8, profitFactor: 1.6 }],
      avgProfitFactor: 1.6,
      avgDrawdownTime: 2,
      entryCount: 1,
      parentSetKey: 'base:set:1'
    }
  ];
  
  console.log(`Storing MAIN sets to key: ${mainKey}`);
  console.log(`Number of sets: ${mainSets.length}`);
  
  try {
    await setSettings(mainKey, { sets: mainSets, count: mainSets.length, created: new Date() });
    console.log(`✓ MAIN sets stored successfully`);
  } catch (error) {
    console.error(`✗ Failed to store MAIN sets:`, error);
    return;
  }
  
  // Verify it was stored
  const mainSettingsKey = `settings:${mainKey}`;
  const mainStoredData = await client.hgetall(mainSettingsKey);
  if (mainStoredData && Object.keys(mainStoredData).length > 0) {
    console.log(`✓ MAIN sets verified in Redis:`);
    console.log(`  Raw data:`, JSON.stringify(mainStoredData, null, 2));
  } else {
    console.log(`✗ MAIN sets NOT found in Redis at key: ${mainSettingsKey}`);
  }
  
  // Test REAL sets persistence
  console.log('\n--- Testing REAL sets persistence ---');
  const realKey = `strategies:${connectionId}:${symbol}:real:sets`;
  const realSets = [
    {
      setKey: 'real:set:1',
      indicationType: 'direction',
      direction: 'long',
      entries: [{ value: 1, confidence: 0.9, profitFactor: 1.8 }],
      avgProfitFactor: 1.8,
      avgDrawdownTime: 1,
      entryCount: 1,
      parentSetKey: 'base:set:1'
    }
  ];
  
  console.log(`Storing REAL sets to key: ${realKey}`);
  console.log(`Number of sets: ${realSets.length}`);
  
  try {
    await setSettings(realKey, { sets: realSets, count: realSets.length, created: new Date() });
    console.log(`✓ REAL sets stored successfully`);
  } catch (error) {
    console.error(`✗ Failed to store REAL sets:`, error);
    return;
  }
  
  // Verify it was stored
  const realSettingsKey = `settings:${realKey}`;
  const realStoredData = await client.hgetall(realSettingsKey);
  if (realStoredData && Object.keys(realStoredData).length > 0) {
    console.log(`✓ REAL sets verified in Redis:`);
    console.log(`  Raw data:`, JSON.stringify(realStoredData, null, 2));
  } else {
    console.log(`✗ REAL sets NOT found in Redis at key: ${realSettingsKey}`);
  }
  
  // Test LIVE sets persistence
  console.log('\n--- Testing LIVE sets persistence ---');
  const liveKey = `strategies:${connectionId}:${symbol}:live:sets`;
  const liveSets = [
    {
      setKey: 'live:set:1',
      indicationType: 'direction',
      direction: 'long',
      entries: [{ value: 1, confidence: 0.95, profitFactor: 2.0 }],
      avgProfitFactor: 2.0,
      avgDrawdownTime: 0,
      entryCount: 1,
      parentSetKey: 'base:set:1'
    }
  ];
  
  console.log(`Storing LIVE sets to key: ${liveKey}`);
  console.log(`Number of sets: ${liveSets.length}`);
  
  try {
    await setSettings(liveKey, { sets: liveSets, count: liveSets.length, created: new Date() });
    console.log(`✓ LIVE sets stored successfully`);
  } catch (error) {
    console.error(`✗ Failed to store LIVE sets:`, error);
    return;
  }
  
  // Verify it was stored
  const liveSettingsKey = `settings:${liveKey}`;
  const liveStoredData = await client.hgetall(liveSettingsKey);
  if (liveStoredData && Object.keys(liveStoredData).length > 0) {
    console.log(`✓ LIVE sets verified in Redis:`);
    console.log(`  Raw data:`, JSON.stringify(liveStoredData, null, 2));
  } else {
    console.log(`✗ LIVE sets NOT found in Redis at key: ${liveSettingsKey}`);
  }
  
  // Final check: list all strategy-related settings keys
  console.log('\n=== FINAL CHECK: ALL STRATEGY SETTINGS KEYS ===');
  const allSettingsKeys = await client.keys('settings:*');
  const strategySettingsKeys = allSettingsKeys.filter(key => 
    key.startsWith('settings:strategies:') && 
    key.includes(connectionId) && 
    key.includes(symbol)
  );
  
  console.log(`Found ${strategySettingsKeys.length} strategy settings keys for ${connectionId}:${symbol}:`);
  strategySettingsKeys.forEach(key => {
    console.log(`  ${key}`);
    const data = client.hgetall(key);
    if (data && data.sets) {
      try {
        const parsed = JSON.parse(data.sets);
        console.log(`    Sets count: ${parsed.length}`);
      } catch (e) {
        console.log(`    Sets data: ${data.sets.substring(0, 100)}...`);
      }
    }
  });
  
  // Clean up
  console.log('\n=== CLEANING UP ===');
  const keysToDelete = [
    `settings:${baseKey}`,
    `settings:${mainKey}`,
    `settings:${realKey}`,
    `settings:${liveKey}`
  ];
  
  for (const key of keysToDelete) {
    await client.del(key);
    console.log(`Deleted: ${key}`);
  }
}

testStrategyPersistence().catch(console.error);