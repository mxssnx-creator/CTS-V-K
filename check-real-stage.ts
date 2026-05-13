import { initRedis, getRedisClient } from './lib/redis-db';

async function checkRealStage() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== CHECKING REAL STAGE STORAGE ===\n');
  
  const connectionId = 'bingx-x01';
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
  
  for (const symbol of symbols) {
    console.log(`--- ${symbol} ---`);
    
    const realSetsKey = `settings:strategies:${connectionId}:${symbol}:real:sets`;
    const realCountKey = `settings:strategies:${connectionId}:${symbol}:real:count`;
    const realEvaluatedKey = `settings:strategies:${connectionId}:${symbol}:real:evaluated`;
    
    // Check existence
    const [setsExists, countExists, evaluatedExists] = await Promise.all([
      client.exists(realSetsKey),
      client.exists(realCountKey),
      client.exists(realEvaluatedKey)
    ]);
    
    console.log(`  Sets key exists: ${setsExists === 1}`);
    console.log(`  Count key exists: ${countExists === 1}`);
    console.log(`  Evaluated key exists: ${evaluatedExists === 1}`);
    
    // Get values
    if (setsExists === 1) {
      const setsData = await client.hgetall(realSetsKey);
      console.log(`  Sets data:`, JSON.stringify(setsData, null, 2));
    }
    
    if (countExists === 1) {
      const countData = await client.get(realCountKey);
      console.log(`  Count: ${countData}`);
    }
    
    if (evaluatedExists === 1) {
      const evaluatedData = await client.get(realEvaluatedKey);
      console.log(`  Evaluated: ${evaluatedData}`);
    }
    
    console.log('');
  }
  
  // Also check the progression hash for real stage counts
  console.log(`=== PROGRESSION HASH FOR REAL STAGE ===\n`);
  const progressionKey = `progression:${connectionId}`;
  const progressionData = await client.hgetall(progressionKey);
  console.log(`Progression data for ${connectionId}:`);
  // Filter for real stage related fields
  const realFields = Object.keys(progressionData).filter(key => 
    key.includes('real') || key.includes('Real')
  );
  if (realFields.length > 0) {
    console.log(`  Real stage fields:`);
    for (const field of realFields) {
      console.log(`    ${field}: ${progressionData[field]}`);
    }
  } else {
    console.log(`  No real stage fields found in progression hash.`);
  }
  
  // Show all progression fields for context
  console.log(`\nAll progression fields:`);
  console.log(JSON.stringify(progressionData, null, 2));
}

checkRealStage().catch(console.error);