# Red Handed Poker - Game Specification

## Overview
A multiplayer 5-card draw poker game with betting phases, card changing mechanics, hand rankings, and casino-themed UI.

## Game Flow

### 1. Lobby Phase
- Players join and enter their names
- Each player starts with 100 gold
- Host waits for at least 2 players to start the game

### 2. Betting Phase (60 seconds)
- Each player receives 5 cards
- Players can:
  - Select 0-5 cards to change
  - Place bets (minimum 1 gold)
  - Fold (exit the round)
- Host can end betting phase early
- Timer auto-ends phase after 60 seconds
- Players who don't bet/fold in time are treated as folded

### 3. Card Change
- Selected cards are replaced with new cards from the deck
- Cards are drawn from a shared deck (1 deck per 10 players)

### 4. Results Phase
- All hands are evaluated using standard poker rankings
- Pot (sum of all bets) is distributed to winner(s)
- Ties split the pot equally
- Players with 0 gold are eliminated
- Winners and final gold amounts are displayed

### 5. Next Round
- Host can start a new round or end the game
- Eliminated players can rejoin as new players with 100 gold

## Poker Hand Rankings (Highest to Lowest)
1. **Royal Flush** - A, K, Q, J, 10 of the same suit
2. **Straight Flush** - 5 consecutive cards of the same suit
3. **Four of a Kind** - 4 cards of the same rank
4. **Full House** - 3 of a kind + 2 of a kind
5. **Flush** - 5 cards of the same suit
6. **Straight** - 5 consecutive cards of any suit
7. **Three of a Kind** - 3 cards of the same rank
8. **Two Pair** - 2 pairs of cards
9. **One Pair** - 2 cards of the same rank
10. **High Card** - Highest card in hand

## Display Modes

### Player Mode (Mobile)
- Card selection interface
- Betting controls with +/- buttons
- Results display with winnings/losses
- Hand rankings modal for reference

### Host Mode (Desktop)
- Game control buttons (start, end betting, new round, end game)
- Player count display
- Timer for betting phase
- QR code and links for joining

### Presenter Mode (Large Screen)
- Large "Red Handed Poker" title with QR code
- Real-time display of all players
- 3-column grid layout during results
- Shows player bets, hands, and winners
- When the host ends the game, presenter shows final rankings sorted by remaining gold (highest first)

## Casino Theme
- Green poker table background
- Red borders for important elements
- White playing cards with red/black suits
- Colorful poker chip-style buttons
- Compact card design for presenter view

## Technical Details
- State management: Kokimoki SDK with valtio
- Multiple decks: 1 deck per 10 players (allows duplicates)
- Server-side timing: Synchronized betting phase timer
- Automatic cleanup: Eliminated players removed from active game
- Random name generation: Unique names for quick entry
