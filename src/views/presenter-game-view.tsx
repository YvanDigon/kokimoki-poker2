import { config } from '@/config';
import { PlayingCard } from '@/components/playing-card';
import { useServerTimer } from '@/hooks/useServerTime';
import { globalStore } from '@/state/stores/global-store';
import { getGoldEmoji } from '@/utils/gold-emoji';
import { KmTimeCountdown } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const PresenterGameView: React.FC = () => {
  const { phase, roundNumber, pot, players, winners, bettingPhaseStartTime, suspectedCheaters } = useSnapshot(globalStore.proxy);
  const serverTime = useServerTimer(250);

  const playerEntries = Object.entries(players);
  const isFinalRanking = phase === 'ended';

  const comebackPlayers = playerEntries.filter(([, player]) => player.inComebackMode);

  const bettingTimeElapsed = serverTime - bettingPhaseStartTime;
  const bettingTimeRemaining = Math.max(0, config.bettingPhaseDuration * 1000 - bettingTimeElapsed);

  const currentPot = phase === 'betting'
    ? pot + playerEntries
        .filter(([, player]) => !player.inComebackMode)
        .reduce((sum, [, p]) => sum + p.bet, 0)
    : pot;

  if (phase === 'betting') {
    return (
      <div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-bold">
          {config.bettingPhaseTitle} - {config.roundNumber} {roundNumber}
        </h2>

        <div className="mb-6 space-y-2 text-center">
          <p className="text-xl">
            {config.pot}: <span className="font-bold text-green-600">{currentPot}</span>
          </p>
          <div>
            <p className="mb-2 text-lg font-bold">{config.timeRemaining}:</p>
            <div className="text-4xl font-bold text-blue-600">
              <KmTimeCountdown ms={bettingTimeRemaining} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {playerEntries
            .filter(([, player]) => !player.inComebackMode)
            .map(([playerId, player]) => {
              const isAllIn = player.bet > 0 && player.bet === player.gold + player.bet;

              return (
                <div
                  key={playerId}
                  className={`rounded-lg border-2 p-2 ${
                    isAllIn ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {isAllIn && (
                    <div className="mb-2 text-center">
                      <span className="text-lg font-bold text-red-600">{config.allIn}</span>
                    </div>
                  )}

                  <p className="mb-1 truncate text-center text-sm font-bold">
                    {player.name}
                  </p>
                  <div className="space-y-1 text-center text-xs">
                    <div className="flex items-center justify-center gap-1">
                      <span>{config.yourGold}: <span className="font-bold">{player.gold}</span></span>
                      <span>{getGoldEmoji(player.gold)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span>
                        {config.currentBet}:{' '}
                        <span className="font-bold">
                          {player.cards.length === 0
                            ? config.newPlayerLabel
                            : player.folded
                              ? config.youFolded
                              : player.bet > 0
                                ? player.bet
                                : '-'}
                        </span>
                      </span>
                      {player.bet > 0 && !player.folded && <span>{getGoldEmoji(player.bet)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Comeback Mode Players */}
          {comebackPlayers.map(([playerId, player]) => (
            <div
              key={`comeback-${playerId}`}
              className="rounded-lg border-2 border-blue-400 bg-blue-50 p-2"
            >
              <p className="mb-1 truncate text-center text-sm font-bold text-blue-800">
                {player.name}
              </p>
              <p className="text-center text-xs text-blue-600">
                {config.comebackModePresenterDescription}
              </p>
              {player.comebackPrediction && (
                <p className="mt-1 text-center text-xs text-blue-700">
                  {config.comebackPredictingLabel} {players[player.comebackPrediction]?.name || '?'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'results' || phase === 'ended') {
    const basePlayers = isFinalRanking
      ? [...playerEntries]
      : playerEntries.filter(([, player]) => !player.inComebackMode);

    const sortedPlayers = isFinalRanking
      ? basePlayers.sort(([, a], [, b]) => {
          if (b.gold !== a.gold) return b.gold - a.gold;
          return a.name.localeCompare(b.name);
        })
      : basePlayers.sort(([aId, a], [bId, b]) => {
          const aIsWinner = winners.includes(aId);
          const bIsWinner = winners.includes(bId);
          if (aIsWinner && !bIsWinner) return -1;
          if (!aIsWinner && bIsWinner) return 1;
          if (a.handRank !== b.handRank) return b.handRank - a.handRank;
          return b.gold - a.gold;
        });

    const comebackDisplay = isFinalRanking ? [] : comebackPlayers;
    const showAccusationStatus = !isFinalRanking;

    return (
      <div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-bold">
          {isFinalRanking ? config.finalRankingsTitle : config.resultsTitle}
        </h2>

        <div className="mb-4 text-center">
          <p className="flex items-center justify-center gap-2 text-xl">
            <span>{config.pot}: <span className="font-bold text-green-600">{currentPot}</span></span>
            <span>{getGoldEmoji(pot)}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {sortedPlayers.map(([playerId, player], index) => {
            const isWinner = winners.includes(playerId);
            const wasAccused = showAccusationStatus && player.accusedOfCheating;
            const isTopGold = isFinalRanking && index === 0;
            const borderColor = isFinalRanking
              ? isTopGold
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-300 bg-gray-50'
              : wasAccused
                ? player.wronglyAccused
                  ? 'border-green-500 bg-green-50'
                  : 'border-orange-500 bg-orange-50'
                : isWinner
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-300 bg-gray-50';

            return (
              <div
                key={playerId}
                className={`rounded-lg border-2 p-2 ${borderColor}`}
              >
                <div className="mb-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-bold">{player.name}</p>
                    {isFinalRanking ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white flex-shrink-0">
                        {index + 1}
                      </div>
                    ) : (
                      <>
                        {wasAccused && (
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                            player.wronglyAccused ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                          }`}>
                            {player.wronglyAccused ? '💢' : '⚠'}
                          </div>
                        )}
                        {!wasAccused && isWinner && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white flex-shrink-0">
                            👑
                          </div>
                        )}
                        {!wasAccused && !isWinner && player.handRank > 0 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white flex-shrink-0">
                            {player.handRank}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {showAccusationStatus && wasAccused && player.cheated && (
                    <div className="mt-1 text-center">
                      <span className="text-xs font-bold text-red-600">
                        {config.caughtCheatingTitle}
                      </span>
                    </div>
                  )}

                  {showAccusationStatus && wasAccused && player.wronglyAccused && (
                    <div className="mt-1 text-center">
                      <span className="text-xs font-bold text-green-600">
                        {config.wronglyAccusedTitle}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-1 flex items-center justify-center gap-1 text-center text-xs">
                  <span>{config.yourGold}: <span className="font-bold">{player.gold}</span></span>
                  <span>{getGoldEmoji(player.gold)}</span>
                </div>

                {!player.folded && player.bet > 0 && (
                  <div className="mb-1 flex items-center justify-center gap-1 text-center text-xs">
                    <span>{config.betLabel} <span className="font-bold text-blue-600">{player.bet}</span></span>
                    <span>{getGoldEmoji(player.bet)}</span>
                  </div>
                )}

                {!player.folded && player.handName && (
                  <>
                    <p className="mb-1 text-center text-xs font-bold text-blue-600">
                      {player.handName}
                    </p>
                    <div className="flex flex-wrap justify-center gap-0.5">
                      {player.cards.map((card, idx) => (
                        <PlayingCard
                          key={idx}
                          card={card}
                          className="h-14 w-10"
                          compact
                        />
                      ))}
                    </div>
                    {showAccusationStatus && suspectedCheaters[playerId] && suspectedCheaters[playerId].length > 0 && (
                      <div className="mt-1 text-center">
                        {Array.from({ length: suspectedCheaters[playerId].length }).map((_, idx) => (
                          <span key={idx} className="text-lg">
                            👤
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {player.folded && (
                  <p className="text-center text-xs text-gray-500">{config.youFolded}</p>
                )}
              </div>
            );
          })}

          {/* Comeback Mode Players */}
          {comebackDisplay.map(([playerId, player]) => (
            <div
              key={`comeback-${playerId}`}
              className="rounded-lg border-2 border-blue-400 bg-blue-50 p-2"
            >
              <p className="mb-1 truncate text-center text-sm font-bold text-blue-800">
                {player.name}
              </p>
              <p className="text-center text-xs text-blue-600">
                {config.comebackModePresenterDescription}
              </p>
              {player.comebackPrediction && (
                <p className="mt-1 text-center text-xs text-blue-700">
                  {config.comebackPredictingLabel} {players[player.comebackPrediction]?.name || '?'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
