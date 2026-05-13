import { initRedis, getRedisClient } from './lib/redis-db';

async function inspectRedis() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== INSPECTING REDIS KEYS ===');
  
  // Get all keys
  const allKeys = await client.keys('*');
  console.log(`Total keys: ${allKeys.length}`);
  
  // Filter for strategy-related keys
  const strategyKeys = allKeys.filter(key => key.startsWith('strategies:'));
  console.log(`Strategy keys: ${strategyKeys.length}`);
  if (strategyKeys.length > 0) {
    console.log('First 10 strategy keys:');
    strategyKeys.slice(0, 10).forEach(key => console.log(`  ${key}`));
  }
  
  // Filter for progression-related keys
  const progressionKeys = allKeys.filter(key => key.startsWith('progression:'));
  console.log(`Progression keys: ${progressionKeys.length}`);
  if (progressionKeys.length > 0) {
    console.log('First 10 progression keys:');
    progressionKeys.slice(0, 10).forEach(key => console.log(`  ${key}`));
  }
  
  // Filter for pseudo_position-related keys
  const pseudoPositionKeys = allKeys.filter(key => key.startsWith('pseudo_positions:'));
  console.log(`Pseudo position keys: ${pseudoPositionKeys.length}`);
  if (pseudoPositionKeys.length > 0) {
    console.log('First 10 pseudo position keys:');
    pseudoPositionKeys.slice(0, 10).forEach(key => console.log(`  ${key}`));
  }
  
  // Check specific patterns we're interested in
  const strategySetsKeys = await client.keys('strategies:*:*:*:sets');
  console.log(`\nStrategy sets keys (strategies:*:*:*:sets): ${strategySetsKeys.length}`);
  
  const strategyBaseKeys = await client.keys('strategies:*:*:*:base');
  console.log(`Strategy base keys (strategies:*:*:*:base): ${strategyBaseKeys.length}`);
  
  const strategyMainKeys = await client.keys('strategies:*:*:*:main');
  console.log(`Strategy main keys (strategies:*:*:*:main): ${strategyMainKeys.length}`);
  
  const strategyRealKeys = await client.keys('strategies:*:*:*:real');
  console.log(`Strategy real keys (strategies:*:*:*:real): ${strategyRealKeys.length}`);
  
  const strategyLiveKeys = await client.keys('strategies:*:*:*:live');
  console.log(`Strategy live keys (strategies:*:*:*:live): ${strategyLiveKeys.length}`);
  
  // Check a few sample keys to see their structure
  if (strategySetsKeys.length > 0) {
    const sampleKey = strategySetsKeys[0];
    const value = await client.hgetall(sampleKey);
    console.log(`\nSample strategy set key ${sampleKey}:`);
    console.log(value);
  }
  
  if (pseudoPositionKeys.length > 0) {
    const sampleKey = pseudoPositionKeys[0];
    const value = await client.hgetall(sampleKey);
    console.log(`\nSample pseudo position key ${sampleKey}:`);
    console.log(value);
  }
  
  // Check global trade engine state
  const globalState = await client.hgetall('trade_engine:global');
  console.log(`\nGlobal trade engine state:`);
  console.log(globalState);
  
  // Check connection state for bingx-x01
  const connectionState = await client.hgetall('trade_engine_state:bingx-x01');
  console.log(`\nConnection state for bingx-x01:`);
  console.log(connectionState);
  
  // Check progression state for bingx-x01
  const progressionState = await client.hgetall('progression:bingx-x01');
  console.log(`\nProgression state for bingx-x01:`);
  console.log(progressionState);
}

inspectRedis().catch(console.error);