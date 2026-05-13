import { initRedis, getRedisClient } from './lib/redis-db';

async function checkSettingsStorage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== CHECKING WHERE STRATEGY DATA IS ACTUALLY STORED ===\n');
  
  // Look for settings keys related to strategies
  const settingsKeys = await client.keys('settings:*');
  console.log(`Total settings keys: ${settingsKeys.length}`);
  
  const strategySettingsKeys = settingsKeys.filter(key => 
    key.includes('strategies:') && 
    (key.includes(':base:') || key.includes(':main:') || key.includes(':real:') || key.includes(':live:'))
  );
  
  console.log(`Strategy-related settings keys: ${strategySettingsKeys.length}`);
  
  if (strategySettingsKeys.length > 0) {
    for (const key of strategySettingsKeys.slice(0, 10)) { // Show first 10
      const data = await client.hgetall(key);
      console.log(`\n${key}:`);
      console.log(JSON.stringify(data, null, 2));
    }
  } else {
    console.log('No strategy-related settings keys found');
    
    // Let's see what settings keys we DO have
    console.log(`\nFirst 10 settings keys:`);
    for (let i = 0; i < Math.min(10, settingsKeys.length); i++) {
      const key = settingsKeys[i];
      const data = await client.hgetall(key);
      console.log(`  ${key}: ${JSON.stringify(data, null, 2)}`);
    }
  }
  
  // Also check if the data is being stored with a different pattern
  console.log(`\n=== CHECKING FOR ALTERNATIVE STORAGE PATTERNS ===\n`);
  
  // Check if maybe it's stored as a string instead of hash
  const allKeys = await client.keys('*');
  const stringKeys = [];
  
  // We need to check the type differently - let's try to get and see if it's not null/not an object
  for (const key of allKeys) {
    try {
      const value = await client.get(key);
      if (value !== null && !(typeof value === 'object' && value !== null)) {
        // It's a string value (or number, boolean)
        stringKeys.push(key);
      }
    } catch (e) {
      // If we can't get it as a string, it's likely a hash or other type
    }
  }
  
  console.log(`String keys: ${stringKeys.length}`);
  const strategyStringKeys = stringKeys.filter(key => key.includes('strategies:'));
  console.log(`Strategy string keys: ${strategyStringKeys.length}`);
  
  if (strategyStringKeys.length > 0) {
    for (const key of strategyStringKeys.slice(0, 5)) {
      const value = await client.get(key);
      console.log(`\n${key}: ${value}`);
    }
  }
  
  // Let's look at what's actually in the strategy detail keys mentioned in the progression
  console.log(`\n=== CHECKING STRATEGY DETAIL KEYS FROM PROGRESSION ===\n`);
  
  const detailKeys = await client.keys('strategy_detail:*');
  console.log(`Strategy detail keys: ${detailKeys.length}`);
  
  if (detailKeys.length > 0) {
    for (const key of detailKeys.slice(0, 5)) {
      const data = await client.hgetall(key);
      console.log(`\n${key}:`);
      console.log(JSON.stringify(data, null, 2));
    }
  }
  
  // And let's check if the actual sets are stored in a different format
  console.log(`\n=== LOOKING FOR ACTUAL SETS STORAGE ===\n`);
  
  // Check if sets are stored as lists or other structures
  for (const key of allKeys) {
    if (key.includes('strategies:') && 
        (key.includes(':sets') || key.includes(':base') || key.includes(':main') || 
         key.includes(':real') || key.includes(':live'))) {
      try {
        // Try to get as a hash first
        const hashData = await client.hgetall(key);
        if (hashData && Object.keys(hashData).length > 0) {
          console.log(`Hash key ${key}:`);
          console.log(JSON.stringify(hashData, null, 2));
          continue;
        }
      } catch (e) {}
      
      try {
        // Try to get as a string
        const stringData = await client.get(key);
        if (stringData !== null) {
          console.log(`String key ${key}: ${stringData.substring(0, 200)}...`);
          continue;
        }
      } catch (e) {}
      
      // Try to get as a list
      try {
        // We don't have a direct list command, but we can check if it's a list by trying lrange
        // Actually, let's just see what type it might be by checking if it exists
        const exists = await client.exists(key);
        if (exists) {
          console.log(`Other type key ${key}: exists but couldn't read as hash/string`);
        }
      } catch (e) {}
    }
  }
}

checkSettingsStorage().catch(console.error);