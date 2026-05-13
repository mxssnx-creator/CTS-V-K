import { initRedis, getRedisClient } from "./lib/redis-db"
import { getGlobalTradeEngineCoordinator } from "./lib/trade-engine"
import { getAllConnections, updateConnection } from "./lib/redis-db"

async function startEngines() {
  await initRedis()
  const client = getRedisClient()

  // Start global trade engine coordinator
  console.log("Starting Global Trade Engine Coordinator...")
  const coordinator = getGlobalTradeEngineCoordinator()
  await coordinator.startAll()
  await coordinator.refreshEngines()

  // Set global state to running
  await client.hset("trade_engine:global", { 
    status: "running", 
    started_at: new Date().toISOString(),
    coordinator_ready: "true"
  })
  console.log("Global Trade Engine Coordinator state set to running")

  // Get all connections and start engines for enabled ones
  const connections = await getAllConnections()
  console.log(`Found ${connections.length} total connections`)

  for (const conn of connections) {
    // Check if connection is assigned and dashboard enabled
    if (conn.is_assigned === "1" || conn.is_assigned === true) {
      if (conn.is_enabled_dashboard === "1" || conn.is_enabled_dashboard === true) {
        console.log(`Starting engine for connection: ${conn.id}`)
        try {
          // Ensure live trade is enabled
          await updateConnection(conn.id, {
            ...conn,
            is_live_trade: "1",
            updated_at: new Date().toISOString(),
          })

          // Start the engine for this connection
          await coordinator.startEngine(conn.id, {
            connectionId: conn.id,
            connection_name: conn.name,
            exchange: conn.exchange,
            indicationInterval: 1, // 1 second
            strategyInterval: 1,   // 1 second
            realtimeInterval: 0.2, // 200ms
          })
          console.log(`✓ Engine started for ${conn.id}`)
        } catch (err) {
          console.error(`✗ Failed to start engine for ${conn.id}:`, err)
        }
      }
    }
  }

  console.log("\nEngines started. Monitoring progression...")
  // Monitor progression every 10 seconds
  setInterval(async () => {
    const strategyKeys = await client.keys('strategies:*:*:*:sets')
    const progressionKeys = await client.keys('progression:*')
    const activePositions = await client.scard('pseudo_positions:bingx-x01:active_config_keys').catch(() => 0)
    console.log(`[${new Date().toISOString()}] Strategy sets: ${strategyKeys.length}, Progression keys: ${progressionKeys.length}, Active pseudo positions: ${activePositions}`)
  }, 10000)
}

startEngines().catch(console.error)