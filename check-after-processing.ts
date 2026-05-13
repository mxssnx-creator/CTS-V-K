import { initRedis, getRedisClient } from './lib/redis-db';

async function checkAfterProcessing() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== CHECKING FOR STRATEGY KEYS AFTER PROCESSING ===');
  
  // Run the strategy processing first
  console.log('Running strategy processing...');
  const { triggerStrategyProcessing } = await import('./trigger-processing');
  await triggerStrategyProcessing();
  
  console.log('\nChecking for strategy keys...');
  const connectionId = 'bingx-x01';
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
  const stages = ['base', 'main', 'real', 'live'];
  
  let totalFound = 0;
  
  for (const symbol of symbols) {
    for (const stage of stages) {
      // This is the exact key pattern used in setSettings
      const key = `settings:strategies:${connectionId}:${symbol}:${stage}:sets`;
      const exists = await client.exists(key);
      
      if (exists === 1) {
        totalFound++;
        const data = await client.hgetall(key);
        console.log(`FOUND: ${key}`);
        console.log(`  Data:`, JSON.stringify(data, null, 2));
        
        // Parse the sets data to see what's actually stored
        if (data.sets) {
          try {
            const parsedSets = JSON.parse(data.sets);
            console.log(`  Sets count: ${parsedSets.length}`);
            if (parsedSets.length > 0) {
              console.log(`  First set sample: ${JSON.stringify(parsedSets[0]).substring(0, 100)}...`);
            }
          } catch (e) {
            console.log(`  Could not parse sets data: ${e}`);
          }
        }
      }
    }
  }
  
  console.log(`\nTotal strategy keys found: ${totalFound}`);
  
  if (totalFound === 0) {
    console.log('No strategy keys found with the expected pattern.');
    
    // Let's see what keys we DO have in the settings namespace
    console.log('\nChecking all settings keys...');
    const allSettingsKeys = await client.keys('settings:*');
    console.log(`Total settings keys: ${allSettingsKeys.length}`);
    
    // Look for any keys that might be related to our connection/symbols
    const filteredKeys = allSettingsKeys.filter(key => 
      key.includes(connectionId) || 
      symbols.some(symbol => key.includes(symbol))
    );
    
    console.log(`Keys containing connection or symbol names: ${filteredKeys.length}`);
    filteredKeys.forEach(key => {
      console.log(`  ${key}`);
      // Show a sample of the data
      client.hgetall(key).then(data => {
        if (Object.keys(data).length > 0) {
          console.log(`    Data sample: ${JSON.stringify(data).substring(0, 200)}...`);
        }
      }).catch(e => {
        console.log(`    Error reading data: ${e}`);
      });
    });
  }
  
  // Also check the progression hash to see if it's getting updated
  console.log('\n=== CHECKING PROGRESSION HASH ===');
  const progressionKey = `progression:${connectionId}`;
  const progressionData = await client.hgetall(progressionKey);
  console.log(`Progression data:`, JSON.stringify(progressionData, null, 2));
}

checkAfterProcessing().catch(console.error);