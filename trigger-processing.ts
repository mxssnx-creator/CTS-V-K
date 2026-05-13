import { getAllConnections, getRedisClient } from './lib/redis-db';

async function triggerStrategyProcessing() {
  try {
    console.log('=== TRIGGERING STRATEGY PROCESSING ===');

    const connections = await getAllConnections();
    const client = getRedisClient();

     // Find active connections
     const activeConnections = connections.filter(c => c.is_enabled_dashboard === true);
    console.log(`Found ${activeConnections.length} active connections`);

    for (const conn of activeConnections) {
      console.log(`\nProcessing connection: ${conn.id}`);

        // Get symbols for this connection
        const symbolsKey = `connection:${conn.id}:symbols`;
        let symbolsData = await client.hgetall(symbolsKey).catch(() => ({}));
        // Ensure symbolsData is an object (hgetall can return null)
        if (symbolsData === null) {
          symbolsData = {};
        }
        // If no symbols exist, set default symbols
        if (Object.keys(symbolsData).length === 0) {
          console.log(`No symbols found for ${conn.id}, setting default symbols...`);
          const defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
          for (const symbol of defaultSymbols) {
            await client.hset(symbolsKey, symbol, '1');
          }
          // Reload symbolsData
          symbolsData = await client.hgetall(symbolsKey);
          // Ensure it's an object again
          if (symbolsData === null) {
            symbolsData = {};
          }
        }
        const symbols = Object.keys(symbolsData);

      console.log(`Symbols: ${symbols.join(', ')}`);

       // Check if we have market data for these symbols
       for (const symbol of symbols) {
         const marketDataKey = `market_data:${symbol}`;
         let marketData = await client.hgetall(marketDataKey).catch(() => ({}));
         // Ensure marketData is an object (hgetall can return null)
         if (marketData === null) {
           marketData = {};
         }
         if (Object.keys(marketData).length === 0) {
           console.log(`No market data for ${symbol}, setting dummy data...`);
           // Set some dummy market data
           await client.hset(marketDataKey, {
             symbol,
             close: '50000',
             price: '50000',
             last: '50000',
             volume: '1000',
             timestamp: Date.now().toString()
           });
         }
       }

      // Trigger strategy processing for each symbol
      for (const symbol of symbols) {
        console.log(`Processing strategies for ${conn.id}:${symbol}...`);

         try {
           // Import and run strategy processor
           const { StrategyProcessor } = await import('./lib/trade-engine/strategy-processor');
           const processor = new StrategyProcessor(conn.id);

           // Run strategy flow
           const result = await processor.processStrategy(symbol, []);
           console.log(`✓ Strategy processing completed for ${symbol}: strategiesEvaluated=${result.strategiesEvaluated}, liveReady=${result.liveReady}`);

         } catch (error) {
           console.error(`Error processing ${symbol}:`, error);
         }
      }
    }

     // Check final state
     console.log('\n=== FINAL STATE CHECK ===');
     const strategyKeys = await client.keys('settings:strategies:*:*:*:sets');
     console.log(`Total strategy sets: ${strategyKeys.length}`);

    const progressionKeys = await client.keys('progression:*');
    console.log(`Progression keys: ${progressionKeys.length}`);

    const activePositions = await client.scard('pseudo_positions:bingx-x01:active_config_keys').catch(() => 0);
    console.log(`Active pseudo positions: ${activePositions}`);

  } catch (error) {
    console.error('Error triggering strategy processing:', error);
  }
}

triggerStrategyProcessing();