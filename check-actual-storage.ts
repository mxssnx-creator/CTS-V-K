import { initRedis, getRedisClient } from './lib/redis-db';

async function checkActualStrategyStorage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== CHECKING ACTUAL STRATEGY STORAGE LOCATION ===\n');
  
  // The strategy data is stored in the settings namespace
  const settingsKeys = await client.keys('settings:*');
  console.log(`Total settings keys: ${settingsKeys.length}`);
  
  // Filter for strategy-related settings keys
  const strategySettingsKeys = settingsKeys.filter(key => 
    key.includes('strategies:') && 
    (key.includes(':base:') || key.includes(':main:') || key.includes(':real:') || key.includes(':live:')) &&
    key.endsWith(':sets')
  );
  
  console.log(`Strategy settings keys (ending with :sets): ${strategySettingsKeys.length}`);
  
  if (strategySettingsKeys.length > 0) {
    for (const key of strategySettingsKeys.slice(0, 10)) { // Show first 10
      const data = await client.hgetall(key);
      console.log(`\n${key}:`);
      if (data && Object.keys(data).length > 0) {
        try {
          const parsed = JSON.parse(data.sets || data.value || '{}');
          console.log(`  Sets count: ${Array.isArray(parsed) ? parsed.length : 'invalid'}`);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`  First set sample:`, JSON.stringify(parsed[0], null, 2));
          }
        } catch (e) {
          console.log(`  Raw sets data:`, (data.sets || data.value || '').substring(0, 200) + '...');
        }
        console.log(`  Created: ${data.created}`);
        console.log(`  Count field: ${data.count}`);
      } else {
        console.log(`  (empty or invalid data)`);
      }
    }
  } else {
    console.log('No strategy settings keys found ending with :sets');
    
    // Let's see what strategy-related settings keys we DO have
    const allStrategySettings = settingsKeys.filter(key => key.includes('strategies:'));
    console.log(`\nAll strategy-related settings keys: ${allStrategySettings.length}`);
    
    if (allStrategySettings.length > 0) {
      for (const key of allStrategySettings.slice(0, 15)) {
        const data = await client.hgetall(key);
        console.log(`\n${key}:`);
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }
  
  // Also check the active strategies hash
  console.log(`\n=== CHECKING ACTIVE STRATEGIES HASH ===\n`);
  const activeKey = `strategies_active:bingx-x01`;
  const activeData = await client.hgetall(activeKey);
  console.log(`${activeKey}:`);
  console.log(JSON.stringify(activeData, null, 2));
  
  // And check the string counters
  console.log(`\n=== CHECKING STRING COUNTERS ===\n`);
  const counterPatterns = [
    'strategies:bingx-x01:BTCUSDT:base:count',
    'strategies:bingx-x01:BTCUSDT:base:evaluated',
    'strategies:bingx-x01:BTCUSDT:main:count',
    'strategies:bingx-x01:BTCUSDT:main:evaluated',
    'strategies:bingx-x01:BTCUSDT:real:count',
    'strategies:bingx-x01:BTCUSDT:real:evaluated',
    'strategies:bingx-x01:BTCUSDT:live:count',
    'strategies:bingx-x01:BTCUSDT:live:evaluated'
  ];
  
  for (const pattern of counterPatterns) {
    const value = await client.get(pattern);
    console.log(`${pattern}: ${value !== null ? value : 'NULL'}`);
  }
}

checkActualStrategyStorage().catch(console.error);