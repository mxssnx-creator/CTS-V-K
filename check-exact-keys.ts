import { initRedis, getRedisClient } from './lib/redis-db';

async function checkExactKeys() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== CHECKING FOR EXACT STRATEGY KEYS ===\n');
  
  const connectionId = 'bingx-x01';
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
  const stages = ['base', 'main', 'real', 'live'];
  
  let foundAny = false;
  
  for (const symbol of symbols) {
    for (const stage of stages) {
      const key = `settings:strategies:${connectionId}:${symbol}:${stage}:sets`;
      const exists = await client.exists(key);
      if (exists === 1) {
        foundAny = true;
        const data = await client.hgetall(key);
        console.log(`FOUND: ${key}`);
        console.log(`  Data:`, JSON.stringify(data, null, 2));
        
        // Also check the count and evaluated keys
        const countKey = `settings:strategies:${connectionId}:${symbol}:${stage}:count`;
        const evaluatedKey = `settings:strategies:${connectionId}:${symbol}:${stage}:evaluated`;
        
        const [countExists, evaluatedExists] = await Promise.all([
          client.exists(countKey),
          client.exists(evaluatedKey)
        ]);
        
        if (countExists === 1) {
          const countData = await client.get(countKey);
          console.log(`  Count: ${countData}`);
        }
        if (evaluatedExists === 1) {
          const evaluatedData = await client.get(evaluatedKey);
          console.log(`  Evaluated: ${evaluatedData}`);
        }
        console.log('');
      }
    }
  }
  
  if (!foundAny) {
    console.log('NO STRATEGY KEYS FOUND WITH PATTERN: settings:strategies:${connectionId}:${symbol}:${stage}:sets');
    
    // Let's see what keys we DO have that start with settings:strategies
    const allKeys = await client.keys('settings:*');
    const strategySettingsKeys = allKeys.filter(key => key.startsWith('settings:strategies:'));
    console.log(`\nFound ${strategySettingsKeys.length} keys starting with 'settings:strategies:'`);
    if (strategySettingsKeys.length > 0) {
      for (const key of strategySettingsKeys) {
        console.log(`  ${key}`);
        const data = await client.hgetall(key);
        console.log(`    Data:`, JSON.stringify(data, null, 2));
      }
    }
  }
  
  // Also check the progression hash for strategy counts
  console.log('\n=== PROGRESSION HASH ===');
  const progressionKey = `progression:${connectionId}`;
  const progressionData = await client.hgetall(progressionKey);
  console.log(`Progression data:`, JSON.stringify(progressionData, null, 2));
}

checkExactKeys().catch(console.error);