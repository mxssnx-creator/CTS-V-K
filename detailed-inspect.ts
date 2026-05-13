import { initRedis, getRedisClient } from './lib/redis-db';

async function detailedInspection() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== DETAILED REDIS INSPECTION ===');
  
  // Look for any strategy-related keys with more specific patterns
  const patterns = [
    'strategies:*',
    '*strategies*',
    'strategy:*',
    '*strategy*'
  ];
  
  for (const pattern of patterns) {
    const keys = await client.keys(pattern);
    console.log(`Pattern "${pattern}": ${keys.length} keys`);
    if (keys.length > 0 && keys.length <= 10) {
      keys.forEach(key => console.log(`  ${key}`));
    } else if (keys.length > 10) {
      console.log(`  First 5: ${keys.slice(0, 5).join(', ')}`);
      console.log(`  Last 5: ${keys.slice(-5).join(', ')}`);
    }
  }
  
  // Check specifically for our connection and symbols
  const connectionId = 'bingx-x01';
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
  
  console.log(`\n=== CHECKING SPECIFIC CONNECTION/SYMBOLS ===\n`);
  
  for (const symbol of symbols) {
    console.log(`--- ${symbol} ---`);
    
    const baseKey = `strategies:${connectionId}:${symbol}:base:sets`;
    const mainKey = `strategies:${connectionId}:${symbol}:main:sets`;
    const realKey = `strategies:${connectionId}:${symbol}:real:sets`;
    const liveKey = `strategies:${connectionId}:${symbol}:live:sets`;
    
    const [baseData, mainData, realData, liveData] = await Promise.all([
      client.get(baseKey),
      client.get(mainKey),
      client.get(realKey),
      client.get(liveKey)
    ]);
    
    console.log(`Base sets key (${baseKey}): ${baseData !== null ? 'EXISTS' : 'NULL'}`);
    if (baseData !== null) {
      try {
        const parsed = JSON.parse(baseData);
        console.log(`  Sets count: ${parsed?.sets?.length || 0}`);
        console.log(`  Created: ${parsed?.created}`);
      } catch (e) {
        console.log(`  Raw data: ${baseData.substring(0, 100)}...`);
      }
    }
    
    console.log(`Main sets key (${mainKey}): ${mainData !== null ? 'EXISTS' : 'NULL'}`);
    if (mainData !== null) {
      try {
        const parsed = JSON.parse(mainData);
        console.log(`  Sets count: ${parsed?.sets?.length || 0}`);
        console.log(`  Created: ${parsed?.created}`);
      } catch (e) {
        console.log(`  Raw data: ${mainData.substring(0, 100)}...`);
      }
    }
    
    console.log(`Real sets key (${realKey}): ${realData !== null ? 'EXISTS' : 'NULL'}`);
    if (realData !== null) {
      try {
        const parsed = JSON.parse(realData);
        console.log(`  Sets count: ${parsed?.sets?.length || 0}`);
        console.log(`  Created: ${parsed?.created}`);
      } catch (e) {
        console.log(`  Raw data: ${realData.substring(0, 100)}...`);
      }
    }
    
    console.log(`Live sets key (${liveKey}): ${liveData !== null ? 'EXISTS' : 'NULL'}`);
    if (liveData !== null) {
      try {
        const parsed = JSON.parse(liveData);
        console.log(`  Sets count: ${parsed?.sets?.length || 0}`);
        console.log(`  Created: ${parsed?.created}`);
      } catch (e) {
        console.log(`  Raw data: ${liveData.substring(0, 100)}...`);
      }
    }
    
    console.log('');
  }
  
  // Check progression and pseudo positions
  console.log(`=== PROGRESSION AND POSITIONS ===\n`);
  
  const progressionKey = `progression:${connectionId}`;
  const progressionData = await client.hgetall(progressionKey);
  console.log(`Progression key (${progressionKey}):`);
  console.log(progressionData);
  
  const pseudoPositionKey = `pseudo_positions:${connectionId}:active_config_keys`;
  const pseudoPositionCount = await client.scard(pseudoPositionKey);
  console.log(`Pseudo position count (${pseudoPositionKey}): ${pseudoPositionCount}`);
  
  if (pseudoPositionCount > 0) {
    const pseudoPositionMembers = await client.smembers(pseudoPositionKey);
    console.log(`Pseudo position members:`);
    pseudoPositionMembers.forEach((member, index) => {
      if (index < 5) { // Show first 5
        console.log(`  ${member}`);
      }
    });
    if (pseudoPositionMembers.length > 5) {
      console.log(`  ... and ${pseudoPositionMembers.length - 5} more`);
    }
  }
  
  // Check if there are any strategy detail keys
  const detailPatterns = [
    `strategy_detail:${connectionId}:*`,
    `strategy_detail:*`
  ];
  
  console.log(`\n=== STRATEGY DETAIL KEYS ===\n`);
  for (const pattern of detailPatterns) {
    const keys = await client.keys(pattern);
    console.log(`Pattern "${pattern}": ${keys.length} keys`);
    if (keys.length > 0 && keys.length <= 5) {
      for (const key of keys) {
        const data = await client.hgetall(key);
        console.log(`  ${key}:`);
        console.log(`    ${JSON.stringify(data, null, 4)}`);
      }
    } else if (keys.length > 5) {
      console.log(`  First 3 keys:`);
      for (let i = 0; i < Math.min(3, keys.length); i++) {
        const key = keys[i];
        const data = await client.hgetall(key);
        console.log(`    ${key}: ${JSON.stringify(data, null, 2)}`);
      }
    }
  }
}

detailedInspection().catch(console.error);