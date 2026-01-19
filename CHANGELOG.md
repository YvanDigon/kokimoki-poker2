# Changelog

All notable changes to this project will be documented in this file.

## [0.1.19] - 2026-01-19

### Changed
- Presenter view now shows final rankings sorted by remaining gold when the host ends the game
- Presenter end-of-game screen hides "wrongly accused" and "caught cheating" badges to keep the final standings clean

## [0.1.18] - 2026-01-15

### Removed
- Removed unused config variables `hostInstructionsTitle` and `comebackChangePrediction` from schema

## [0.1.17] - 2026-01-15

### Changed
- Updated `ComebackModeView` to use `config.foldedLabel` instead of hardcoded "Folded" string
- Removed unused config variables hostInstructionsTitle and comebackChangePrediction

## [0.1.16] - 2026-01-15

### Fixed
- Game ended message now displays for all players, including those in comeback mode
- Players can now re-enter cheat mode after cancelling by tapping the card multiple times again

## [0.1.15] - 2026-01-15

### Fixed
- Card selection is now automatically cleared when entering a new betting phase, preventing selection from persisting across rounds
- Game ended message now displays for all players, including those in comeback mode
- All strings are added in default config YAML

## [0.1.14] - 2026-01-14

### Added
- Added host instructions configuration: `hostInstructionsTitle`, `hostInstructionsMd`, `hostInstructionsButton`
- Host screen now displays comprehensive instructions on the right side of the QR code during player join phase
- Added "Info" button to host screen that toggles instructions panel after game starts

### Changed
- Updated `ComebackModeView` to display "No Winner" notification (grey) when no players place bets during a round
- Host instructions now appear in a collapsible panel during gameplay instead of always visible

## [0.1.13] - 2026-01-14

### Added
- Added comprehensive hand ranking configuration strings: `handName*`, `handExample*`, `handDesc*` for all 10 poker hand types
- Added hand quality configuration strings: `handQuality*` (e.g., "Bad hand", "Incredible hand", "Legendary hand")
- Added additional UI configuration strings: `netLabel`, `foldedLabel`, `comebackPredictingLabel`
- Added elimination/mugging-related configuration strings: `eliminationBonusTitle`, `eliminationBonusMessage`, `eliminationMissedTitle`, `eliminationMissedMessage`, `muggedTitle`, `muggedMessage`
- Added comeback edge case configuration strings: `comebackAllPlayersFoldedTitle`, `comebackAllPlayersFoldedMessage`
- Added `allPlayersFolded` field to track when all players fold during a round
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
- Fixed edge case: when all players fold and comeback mode players are present, they now see a grey "No Winner" notification instead of a red "Wrong Prediction" notification

### Removed
- Removed `rejoinGame` action from player actions (replaced by comeback mode)
- Removed `eliminatedPlayers` tracking from global store (no longer needed)