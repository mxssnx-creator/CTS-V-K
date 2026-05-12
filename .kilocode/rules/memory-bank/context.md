# Active Context: Tmp3 Trading System

## Current State

**Project Status**: ✅ Trading Engine System (loaded from Tmp3 repository)

This is a trading system with Real, Main, Base, and Live strategy stages. The system shows strategy progression and positions via the logistics page.

## Recently Completed

- [x] Loaded Tmp3 project content into CTS-V-K repository
- [x] Fixed Real stage showing 0 Sets by adding fallback to `strategies:{connId}:real:count` key in `/api/trading/engine-stats`
- [x] Updated fallback logic to always read `strategies:{connId}:real:count` and `strategies:{connId}:live:count` keys (unconditionally, not just when all counts are 0)
- [x] Fixed production mode low activity by ensuring trade engines can start for predefined base connections without API credentials
- [x] Updated `lib/pre-startup.ts` to allow running in production (removed NODE_ENV check)
- [x] Updated `lib/trade-engine.ts` startMissingEngines and refreshEngines to allow starting engines for predefined/testnet connections (consistent with auto-start filter)

## Project Structure

| Feature | Files | Purpose |
|---------|-------|---------|
| Logistics Dashboard | `app/logistics/page.tsx` | Main trading system monitoring |
| Engine Stats API | `app/api/trading/engine-stats/route.ts` | Strategy counts by stage |
| Strategy Coordinator | `lib/strategy-coordinator.ts` | Real stage logic and accumulation |

## Current Focus

Resolved production mode issues causing low database counts and activity. Predefined base connections (e.g., bingx-x01) now start their trade engines even without API credentials, enabling synthetic market data processing and generating activity. Pre-startup seeding is also now available in production for proper initialization when invoked.

## Session History

| Date | Changes |
|------|---------|
| Today | Loaded Tmp3 project from GitHub; Fixed Real stage count bug; Updated fallback to read strategy count keys unconditionally; Fixed production low-activity issue by enabling engine start for predefined connections without credentials; Removed NODE_ENV check from pre-startup to allow seeding in production |
