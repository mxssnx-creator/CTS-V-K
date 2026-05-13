import { initRedis, getRedisClient } from './lib/redis-db';

async function checkRealStageStorage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== CHECKING REAL STAGE STORAGE ===\n');
  
  // Let's look for any keys that might contain real stage data
  const allKeys = await client.keys('*');
  
  // Look for keys with "real" in them
  const realKeys = allKeys.filter(key => 
    key.toLowerCase().includes('real') && 
    (key.includes('strategies:') || key.includes('settings:'))
  );
  
  console.log(`Found ${realKeys.length} keys with "real" in name:`);
  realKeys.forEach(key => {
    console.log(`  ${key}`);
  });
  
  // Look for our specific connection and symbol
  const connectionId = 'bingx-x01';
  const symbol = 'BTCUSDT';
  
  // Check the exact keys that should be created for real stage
  const realSetsKey = `settings:strategies:${connectionId}:${symbol}:real:sets`;
  const realCountKey = `settings:strategies:${connectionId}:${symbol}:real:count`;
  const realEvaluatedKey = `settings:strategies:${connectionId}:${symbol}:real:evaluated`;
  
  console.log(`\nChecking specific Real stage keys:`);
  console.log(`  ${realSetsKey}`);
  console.log(`  ${realCountKey}`);
  console.log(`  ${realEvaluatedKey}`);
  
  // Check if they exist
  const [setsExists, countExists, evaluatedExists] = await Promise.all([
    client.exists(realSetsKey),
    client.exists(realCountKey),
    client.exists(realEvaluatedKey)
  ]);
  
  console.log(`\nExistence check:`);
  console.log(`  Sets exists: ${setsExists === 1}`);
  console.log(`  Count exists: ${countExists === 1}`);
  console.log(`  Evaluated exists: ${evaluatedExists === 1}`);
  
  // If they exist, get their values
  if (setsExists === 1) {
    const setsData = await client.hgetall(realSetsKey);
    console.log(`\nSets data:`);
    console.log(JSON.stringify(setsData, null, 2));
  }
  
  if (countExists === 1) {
    const countData = await client.get(realCountKey);
    console.log(`\nCount data: ${countData}`);
  }
  
  if (evaluatedExists === 1) {
    const evaluatedData = await client.get(realEvaluatedKey);
    console.log(`\nEvaluated data: ${evaluatedData}`);
  }
  
  // Let's also check what's in the strategy coordinator code for where real sets are stored
  console.log(`\n=== CHECKING STRATEGY COORDINATOR STORAGE LOCATIONS ===\n`);
  
  // From the strategy coordinator code, let's trace where real sets are stored
  // In evaluateRealSets method, we saw:
  // const realKey = `strategies:${this.connectionId}:${symbol}:real:sets`
  // But this gets passed to setSettings which prefixes with "settings:"
  
  // Let's also check if there are any active strategies for real stage
  const activeRealKey = `strategies_active:${connectionId}`;
  const activeRealData = await client.hgetall(activeRealKey);
  console.log(`\nActive strategies hash (${activeRealKey}):`);
  console.log(JSON.stringify(activeRealData, null, 2));
  
  // Check if it has real stage data
  if (activeRealData && Object.keys(activeRealData).length > 0) {
    console.log(`Active real stage entries:`);
    for (const key in activeRealData) {
      if (key.includes(':real')) {
        console.log(`  ${key}: ${activeRealData[key]}`);
      }
    }
  }
}

checkRealStageStorage().catch(console.error);