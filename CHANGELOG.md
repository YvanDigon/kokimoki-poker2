# Changelog

All notable changes to this project will be documented in this file.

## [0.1.13] - 2026-01-14

### Added
- Added comprehensive hand ranking configuration strings: `handName*`, `handExample*`, `handDesc*` for all 10 poker hand types
- Added hand quality configuration strings: `handQuality*` (e.g., "Bad hand", "Incredible hand", "Legendary hand")
- Added additional UI configuration strings: `netLabel`, `foldedLabel`, `comebackPredictingLabel`
- Added elimination/mugging-related configuration strings: `eliminationBonusTitle`, `eliminationBonusMessage`, `eliminationMissedTitle`, `eliminationMissedMessage`, `muggedTitle`, `muggedMessage`
- **Comeback Mode**: Players who reach 0 gold now enter "Comeback Mode" instead of being eliminated
  - Comeback players see a spectator view similar to the presenter screen
  - They can predict which active player will win each round
  - If their prediction is correct, they rejoin the game with winnings equal to the split pot amount
  - Comeback players can change their prediction multiple times before the betting phase ends
  - They do not receive bonuses from cheaters being caught or other players being eliminated
- Added `inComebackMode` and `comebackPrediction` fields to player data in global store
- Added `setComebackPrediction` action in global actions
- Created new `ComebackModeView` component for comeback mode UI
- Added comeback mode routing in player app
- Game now ends immediately when only 1 active player remains (all others in comeback mode)

### Changed
- Fully centralized all hardcoded user-facing text strings into configuration
- Updated `evaluateHand()` in `card-utils.ts` to use config keys for all poker hand names
- Updated `getHandQuality()` in `card-utils.ts` to use config keys for hand quality labels
- Refactored `HandRankingsModal` component to read all hand rankings (names, examples, descriptions) from config
- Refactored `ResultsView` to use config strings for all notifications and labels
- Refactored `BettingPhaseView` to use config strings for status messages
- Updated presenter view to use `config.comebackPredictingLabel` for comeback predictions display
- Updated presenter banner to use `config.importantNoteText` instead of hardcoded warning
- Elimination bonus is now only distributed to active players (not comeback mode players)
- Cheater punishment gold redistribution excludes comeback mode players
- `startNewRound` now handles comeback mode players separately from active players
- Betting phase time calculation and mugging mechanics exclude comeback mode players
- Results view shows appropriate messages for entering comeback mode, successful comebacks, and failed predictions

### Removed
- Removed `rejoinGame` action from player actions (replaced by comeback mode)
- Removed `eliminatedPlayers` tracking from global store (no longer needed)