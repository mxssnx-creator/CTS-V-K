import { initRedis, getRedisClient } from './lib/redis-db';
import { StrategyProcessor } from './lib/trade-engine/strategy-processor';

async function traceStrategyProcessing() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== TRACING STRATEGY PROCESSING ===');
  
  const connectionId = 'bingx-x01';
  const symbol = 'BTCUSDT';
  
  // Create a strategy processor
  const processor = new StrategyProcessor(connectionId);
  
  console.log('Processing strategy for ' + connectionId + ':' + symbol);
  
  // Call the processStrategy method
  const result = await processor.processStrategy(symbol, []);
  
  console.log('Result:', result);
  
  // Now check what was actually written to Redis
  console.log('\n=== CHECKING REDIS AFTER PROCESSING ===\n');
  
  const baseKey = 'strategies:' + connectionId + ':' + symbol + ':base:sets';
  const mainKey = 'strategies:' + connectionId + ':' + symbol + ':main:sets';
  const realKey = 'strategies:' + connectionId + ':' + symbol + ':real:sets';
  const liveKey = 'strategies:' + connectionId + ':' + symbol + ':live:sets';
  
  const [baseData, mainData, realData, liveData] = await Promise.all([
    client.get(baseKey),
    client.get(mainKey),
    client.get(realKey),
    client.get(liveKey)
  ]);
  
  console.log('Base sets key (' + baseKey + '): ' + (baseData !== null ? 'EXISTS' : 'NULL'));
  if (baseData !== null) {
    try {
      const parsed = JSON.parse(baseData);
      console.log('  Sets count: ' + (parsed?.sets?.length || 0));
      if (parsed?.sets?.length && parsed.sets.length > 0) {
        console.log('  First set:', JSON.stringify(parsed.sets[0], null, 2));
      }
      console.log('  Created: ' + parsed?.created);
    } catch (e) {
      console.log('  Error parsing: ' + e);
      console.log('  Raw data: ' + baseData.substring(0, 200) + '...');
    }
  }
  
  console.log('Main sets key (' + mainKey + '): ' + (mainData !== null ? 'EXISTS' : 'NULL'));
  if (mainData !== null) {
    try {
      const parsed = JSON.parse(mainData);
      console.log('  Sets count: ' + (parsed?.sets?.length || 0));
      if (parsed?.sets?.length && parsed.sets.length > 0) {
        console.log('  First set:', JSON.stringify(parsed.sets[0], null, 2));
      }
      console.log('  Created: ' + parsed?.created);
    } catch (e) {
      console.log('  Error parsing: ' + e);
      console.log('  Raw data: ' + mainData.substring(0, 200) + '...');
    }
  }
  
  console.log('Real sets key (' + realKey + '): ' + (realData !== null ? 'EXISTS' : 'NULL'));
  if (realData !== null) {
    try {
      const parsed = JSON.parse(realData);
      console.log('  Sets count: ' + (parsed?.sets?.length || 0));
      if (parsed?.sets?.length && parsed.sets.length > 0) {
        console.log('  First set:', JSON.stringify(parsed.sets[0], null, 2));
      }
      console.log('  Created: ' + parsed?.created);
    } catch (e) {
      console.log('  Error parsing: ' + e);
      console.log('  Raw data: ' + realData.substring(0, 200) + '...');
    }
  }
  
  console.log('Live sets key (' + liveKey + '): ' + (liveData !== null ? 'EXISTS' : 'NULL'));
  if (liveData !== null) {
    try {
      const parsed = JSON.parse(liveData);
      console.log('  Sets count: ' + (parsed?.sets?.length || 0));
      if (parsed?.sets?.length && parsed.sets.length > 0) {
        console.log('  First set:', JSON.stringify(parsed.sets[0], null, 2));
      }
      console.log('  Created: ' + parsed?.created);
    } catch (e) {
      console.log('  Error parsing: ' + e);
      console.log('  Raw data: ' + liveData.substring(0, 200) + '...');
    }
  }
  
  // Also check progression
  const progressionKey = 'progression:' + connectionId;
  const progressionData = await client.hgetall(progressionKey);
  console.log('\nProgression key (' + progressionKey + '):');
  console.log(progressionData);
  
  // Check pseudo positions
  const pseudoPositionKey = 'pseudo_positions:' + connectionId + ':active_config_keys';
  const pseudoPositionCount = await client.scard(pseudoPositionKey);
  console.log('Pseudo position count (' + pseudoPositionKey + '): ' + pseudoPositionCount);
}

traceStrategyProcessing().catch(console.error);