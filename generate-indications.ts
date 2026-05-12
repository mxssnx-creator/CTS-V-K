import { getRedisClient } from './lib/redis-db';

async function generateProperIndications() {
  try {
    console.log('=== GENERATING PROPER INDICATIONS ===');

    const client = getRedisClient();
    const connectionId = 'bingx-x01';
    const symbols = ['BTCUSDT', 'ETHUSDT'];

    // Import storeIndications
    const { storeIndications } = await import('./lib/redis-db');

    for (const symbol of symbols) {
      console.log(`Generating indications for ${symbol}...`);

      const testIndications = [
        {
          type: 'direction',
          metadata: { direction: 'long' },
          confidence: 0.8,
          profitFactor: 1.5,
          value: 'long'
        },
        {
          type: 'direction',
          metadata: { direction: 'short' },
          confidence: 0.7,
          profitFactor: 1.3,
          value: 'short'
        }
      ];

      await storeIndications(connectionId, symbol, testIndications);
      console.log(`✓ Stored ${testIndications.length} indications for ${symbol}`);
    }

    // Verify
    console.log('\n=== VERIFICATION ===');
    const mainKey = `indications:${connectionId}`;
    const stored = await client.get(mainKey);
    if (stored) {
      const indications = JSON.parse(stored);
      console.log(`Total stored indications: ${indications.length}`);

      // Check type-specific keys
      const typeKey = `indications:${connectionId}:direction`;
      const typeStored = await client.get(typeKey);
      if (typeStored) {
        const typeIndications = JSON.parse(typeStored);
        console.log(`Direction indications: ${typeIndications.length}`);
      }
    } else {
      console.log('No indications stored');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

generateProperIndications();