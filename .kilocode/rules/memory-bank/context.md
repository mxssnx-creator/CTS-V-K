# Active Context: Tmp3 Trading System

## Current State

**Project Status**: ✅ Trading Engine System (loaded from Tmp3 repository)

This is a trading system with Real, Main, Base, and Live strategy stages. The system shows strategy progression and positions via the logistics page.

## Recently Completed

- [x] Loaded Tmp3 project content into CTS-V-K repository
- [x] Fixed Real stage showing 0 Sets by adding fallback to `strategies:{connId}:real:count` key in `/api/trading/engine-stats`
- [x] Updated fallback logic to always read `strategies:{connId}:real:count` and `strategies:{connId}:live:count` keys (unconditionally, not just when all counts are 0)

## Project Structure

| Feature | Files | Purpose |
|---------|-------|---------|
| Logistics Dashboard | `app/logistics/page.tsx` | Main trading system monitoring |
| Engine Stats API | `app/api/trading/engine-stats/route.ts` | Strategy counts by stage |
| Strategy Coordinator | `lib/strategy-coordinator.ts` | Real stage logic and accumulation |

## Current Focus

The Real stage strategy count was showing 0 because `strategies_real_total` is a cumulative counter in the progression hash. The fix adds a fallback to read from `strategies:{connId}:real:count` which is written by StrategyCoordinator on each cycle.

## Session History

| Date | Changes |
|------|---------|
| Today | Loaded Tmp3 project from GitHub; Fixed Real stage count bug; Updated fallback to read strategy count keys unconditionally |
