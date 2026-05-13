import { initRedis, getRedisClient } from './lib/redis-db';

async function testProgressionHash() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== TESTING PROGRESSION HASH OPERATIONS ===');
  
  const connectionId = 'bingx-x01';
  const progressionKey = `progression:${connectionId}`;
  
  // Test 1: Check initial state
  console.log(`1. Checking initial state of ${progressionKey}:`);
  const initialData = await client.hgetall(progressionKey);
  console.log(`   ${JSON.stringify(initialData, null, 2)}`);
  
  // Test 2: Set a value using hset
  console.log(`\n2. Setting test_hset_field to "test_value" using hset:`);
  await client.hset(progressionKey, 'test_hset_field', 'test_value');
  const afterHset = await client.hgetall(progressionKey);
  console.log(`   ${JSON.stringify(afterHset, null, 2)}`);
  
  // Test 3: Increment a value using hincrby (like the strategy code does)
  console.log(`\n3. Incrementing test_hincrby_field by 5 using hincrby:`);
  await client.hincrby(progressionKey, 'test_hincrby_field', 5);
  const afterIncrby1 = await client.hgetall(progressionKey);
  console.log(`   After first increment: ${JSON.stringify(afterIncrby1, null, 2)}`);
  
  // Test 4: Increment again
  console.log(`\n4. Incrementing test_hincrby_field by 3 using hincrby:`);
  await client.hincrby(progressionKey, 'test_hincrby_field', 3);
  const afterIncrby2 = await client.hgetall(progressionKey);
  console.log(`   After second increment: ${JSON.stringify(afterIncrby2, null, 2)}`);
  
  // Test 5: Check the current value
  console.log(`\n5. Getting test_hincrby_field value:`);
  const value = await client.hget(progressionKey, 'test_hincrby_field');
  console.log(`   Value: ${value}`);
  
  // Clean up
  console.log(`\n6. Cleaning up test fields:`);
  await client.hdel(progressionKey, 'test_hset_field', 'test_hincrby_field');
  const afterCleanup = await client.hgetall(progressionKey);
  console.log(`   After cleanup: ${JSON.stringify(afterCleanup, null, 2)}`);
}

testProgressionHash().catch(console.error);