import { initRedis, getRedisClient } from './lib/redis-db';
import { triggerStrategyProcessing } from './trigger-processing';

async function checkKeysAfterProcessing() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== CHECKING KEYS BEFORE PROCESSING ===');
  let beforeKeys = await client.keys('strategies:*:*:*:sets');
  console.log(`Strategy sets keys before: ${beforeKeys.length}`);
  if (beforeKeys.length > 0) {
    console.log('Keys:', beforeKeys);
  }
  
  // Run the strategy processing
  console.log('\n=== RUNNING STRATEGY PROCESSING ===');
  await triggerStrategyProcessing();
  
  console.log('\n=== CHECKING KEYS AFTER PROCESSING ===');
  let afterKeys = await client.keys('strategies:*:*:*:sets');
  console.log(`Strategy sets keys after: ${afterKeys.length}`);
  if (afterKeys.length > 0) {
    console.log('Keys:', afterKeys);
    // Let's examine the first few keys
    for (let i = 0; i < Math.min(5, afterKeys.length); i++) {
      const key = afterKeys[i];
      const data = await client.hgetall(key);
      console.log(`  ${key}:`);
      console.log(`    ${JSON.stringify(data, null, 4)}`);
    }
  } else {
    console.log('No strategy sets keys found after processing');
    
    // Let's see what strategy-related keys DO exist
    const allStrategyKeys = await client.keys('*strategies*');
    console.log(`\nAll keys containing "strategies": ${allStrategyKeys.length}`);
    allStrategyKeys.forEach(key => {
      console.log(`  ${key}`);
    });
    
    // Let's also check the specific pattern we saw in the storage
    const connectionId = 'bingx-x01';
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
    console.log(`\nChecking for specific connection/symbol keys:`);
    for (const symbol of symbols) {
      const baseKey = `strategies:${connectionId}:${symbol}:base:sets`;
      const mainKey = `strategies:${connectionId}:${symbol}:main:sets`;
      const realKey = `strategies:${connectionId}:${symbol}:real:sets`;
      const liveKey = `strategies:${connectionId}:${symbol}:live:sets`;
      
      const [baseExists, mainExists, realExists, liveExists] = await Promise.all([
        client.exists(`settings:${baseKey}`),
        client.exists(`settings:${mainKey}`),
        client.exists(`settings:${realKey}`),
        client.exists(`settings:${liveKey}`)
      ]);
      
      console.log(`${symbol}:`);
      console.log(`  base:sets exists: ${baseExists === 1}`);
      console.log(`  main:sets exists: ${mainExists === 1}`);
      console.log(`  real:sets exists: ${realExists === 1}`);
      console.log(`  live:sets exists: ${liveExists === 1}`);
      
      if (baseExists === 1) {
        const baseData = await client.hgetall(`settings:${baseKey}`);
        console.log(`    base data: sets=${baseData.sets ? JSON.parse(baseData.sets).length : 0}, count=${baseData.count}`);
      }
    }
  }
}

checkKeysAfterProcessing().catch(console.error);