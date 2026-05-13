import { initRedis, getRedisClient, setSettings, getSettings } from './lib/redis-db';

async function testSettingsMechanism() {
  await initRedis();
  const client = getRedisClient();
  
  console.log('=== TESTING SETTINGS MECHANISM ===\n');
  
  // Test 1: Simple string value
  console.log('Test 1: Simple string value');
  await setSettings('test:simple', 'hello world');
  const simpleResult = await getSettings('test:simple');
  console.log(`  Set: 'hello world'`);
  console.log(`  Got: ${JSON.stringify(simpleResult)}`);
  console.log(`  Match: ${simpleResult === 'hello world'}\n`);
  
  // Test 2: Object value
  console.log('Test 2: Object value');
  const testObj = { a: 1, b: 'test', c: [1, 2, 3] };
  await setSettings('test:object', testObj);
  const objectResult = await getSettings('test:object');
  console.log(`  Set: ${JSON.stringify(testObj)}`);
  console.log(`  Got: ${JSON.stringify(objectResult)}`);
  console.log(`  Match: ${JSON.stringify(objectResult) === JSON.stringify(testObj)}\n`);
  
  // Test 3: Array value (like what strategy coordinator uses)
  console.log('Test 3: Array value (simulating strategy sets)');
  const testArray = [
    { id: 1, name: 'set1', value: 100 },
    { id: 2, name: 'set2', value: 200 }
  ];
  await setSettings('test:array', testArray);
  const arrayResult = await getSettings('test:array');
  console.log(`  Set: ${JSON.stringify(testArray)}`);
  console.log(`  Got: ${JSON.stringify(arrayResult)}`);
  console.log(`  Match: ${JSON.stringify(arrayResult) === JSON.stringify(testArray)}\n`);
  
  // Test 4: The exact format used by strategy coordinator
  console.log('Test 4: Strategy coordinator format');
  const connectionId = 'bingx-x01';
  const symbol = 'BTCUSDT';
  const baseKey = `strategies:${connectionId}:${symbol}:base:sets`;
  const testSetsData = {
    sets: [
      { 
        setKey: `test:set:1`,
        indicationType: 'direction',
        direction: 'long',
        entries: [],
        avgProfitFactor: 1.5,
        avgDrawdownTime: 0,
        entryCount: 0
      }
    ],
    count: 1,
    created: new Date().toISOString()
  };
  
  console.log(`  Storing to key: ${baseKey}`);
  await setSettings(baseKey, testSetsData);
  
  // Now try to read it back
  const retrieved = await getSettings(baseKey);
  console.log(`  Retrieved data: ${JSON.stringify(retrieved, null, 2)}`);
  
  // Also check what's actually in Redis
  const rawData = await client.hgetall(`settings:${baseKey}`);
  console.log(`  Raw Redis data: ${JSON.stringify(rawData, null, 2)}`);
  
  console.log(`  Sets count match: ${retrieved?.sets?.length === testSetsData.sets.length}\n`);
  
  // Clean up
  await client.del(`settings:test:simple`);
  await client.del(`settings:test:object`);
  await client.del(`settings:test:array`);
  await client.del(`settings:${baseKey}`);
}

testSettingsMechanism().catch(console.error);