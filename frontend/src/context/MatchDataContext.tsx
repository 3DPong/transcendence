import { createContext, useContext, useState, ReactNode } from 'react';
import * as gameType from "@/types/game";

interface MatchDataContextValue {
  matchData: gameType.matchStartData | null;
  setMatchData: (matchData: gameType.matchStartData | null) => void;

  inviteChannelId: number | null;
  setInviteChannelId: (id: number | null) => void;

  inviteGameId: string | null;
  setInviteGameId: (id: string | null) => void;

  isObserve: boolean | null;
  setIsObserve: (tf: boolean | null) => void;

  clearInviteData: () => void;
}

export const MatchDataContext = createContext<MatchDataContextValue>({
  matchData: null,
  setMatchData: () => {},

  inviteChannelId: null,
  setInviteChannelId: () => {},

  inviteGameId: null,
  setInviteGameId: () => {},

  isObserve: null,
  setIsObserve: () => {},

  clearInviteData: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export function MatchProvider({ children }: ProviderProps): JSX.Element {
  const [matchData, setMatchData] = useState<gameType.matchStartData | null>(null);
  const [inviteChannelId, setInviteChannelId] = useState<number | null>(null);
  const [inviteGameId, setInviteGameId] = useState<string | null>(null);
  const [isObserve, setIsObserve] = useState<boolean | null>(null);

  function clearInviteData() {
    setInviteChannelId(null);
    setInviteGameId(null);
    setIsObserve(null);
  }

  return (
    <MatchDataContext.Provider value={{
      matchData, setMatchData,
      inviteChannelId, setInviteChannelId,
      inviteGameId, setInviteGameId,
      isObserve, setIsObserve,
      clearInviteData,
    }}>
      {children}
    </MatchDataContext.Provider>
  );
}