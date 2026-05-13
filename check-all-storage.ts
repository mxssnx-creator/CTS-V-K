import { initRedis, getRedisClient } from './lib/redis-db';

async function checkAllStrategyStorage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== COMPREHENSIVE STRATEGY STORAGE CHECK ===\n');
  
  const connectionId = 'bingx-x01';
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
  const stages = ['base', 'main', 'real', 'live'];
  
  for (const symbol of symbols) {
    console.log(`--- ${symbol} ---`);
    
    for (const stage of stages) {
      const settingsKey = `settings:strategies:${connectionId}:${symbol}:${stage}:sets`;
      const countKey = `settings:strategies:${connectionId}:${symbol}:${stage}:count`;
      const evaluatedKey = `settings:strategies:${connectionId}:${symbol}:${stage}:evaluated`;
      
      // Check existence
      const [setsExists, countExists, evaluatedExists] = await Promise.all([
        client.exists(settingsKey),
        client.exists(countKey),
        client.exists(evaluatedKey)
      ]);
      
      const exists = setsExists === 1 || countExists === 1 || evaluatedExists === 1;
      console.log(`  ${stage}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      
      if (setsExists === 1) {
        const setsData = await client.hgetall(settingsKey);
        if (setsData && setsData.sets) {
          try {
            const parsedSets = JSON.parse(setsData.sets);
            console.log(`    Sets count: ${parsedSets.length}`);
            if (parsedSets.length > 0) {
              console.log(`    First set: ${JSON.stringify(parsedSets[0]).substring(0, 100)}...`);
            }
          } catch (e) {
            console.log(`    Sets data (raw): ${setsData.sets.substring(0, 100)}...`);
          }
        }
      }
      
      if (countExists === 1) {
        const countData = await client.get(countKey);
        console.log(`    Count: ${countData}`);
      }
      
      if (evaluatedExists === 1) {
        const evaluatedData = await client.get(evaluatedKey);
        console.log(`    Evaluated: ${evaluatedData}`);
      }
    }
    
    console.log('');
  }
  
  // Check strategy_detail keys
  console.log('=== STRATEGY DETAIL KEYS ===');
  const detailPatterns = [
    `strategy_detail:${connectionId}:*`,
    `strategy_detail:*`
  ];
  
  for (const pattern of detailPatterns) {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      console.log(`Pattern "${pattern}": ${keys.length} keys`);
      for (const key of keys.slice(0, 10)) { // Show first 10
        const data = await client.hgetall(key);
        console.log(`  ${key}:`);
        // Show only a few fields to avoid too much output
        const limitedData = {};
        let count = 0;
        for (const [k, v] of Object.entries(data)) {
          if (count < 5) {
            limitedData[k] = v;
            count++;
          }
        }
        console.log(`    ${JSON.stringify(limitedData, null, 2)}`);
        if (Object.keys(data).length > 5) {
          console.log(`    ... and ${Object.keys(data).length - 5} more fields`);
        }
      }
    }
  }
  
  // Check progression hash for strategy counts
  console.log('\n=== PROGRESSION HASH STRATEGY COUNTS ===');
  const progressionKey = `progression:${connectionId}`;
  const progressionData = await client.hgetall(progressionKey);
  const strategyFields = Object.keys(progressionData).filter(key => 
    key.includes('strategies_') || key.includes('Strategies_')
  );
  if (strategyFields.length > 0) {
    console.log(`Strategy-related fields in progression hash:`);
    for (const field of strategyFields) {
      console.log(`  ${field}: ${progressionData[field]}`);
    }
  } else {
    console.log(`No strategy-related fields in progression hash.`);
  }
  
  // Show a few other progression fields for context
  const otherFields = Object.keys(progressionData).filter(key => 
    !key.includes('strategies_') && !key.includes('Strategies_')
  ).slice(0, 10);
  if (otherFields.length > 0) {
    console.log(`\nOther progression fields (first 10):`);
    for (const field of otherFields) {
      console.log(`  ${field}: ${progressionData[field]}`);
    }
  }
}

checkAllStrategyStorage().catch(console.error);