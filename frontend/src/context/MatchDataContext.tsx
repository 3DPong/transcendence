import { createContext, useContext, useState, ReactNode } from 'react';
import * as gameType from "@/types/game";

interface MatchDataContextValue {
  matchData: gameType.matchStartData | null;
  setMatchData: (matchData: gameType.matchStartData | null) => void;
  inviteChannelId: number | null;
  setInviteChannelId: (id: number | null) => void;
  inviteGameId: string | null;
  setInviteGameId: (id: string | null) => void;
  clearInviteData: () => void;
}

export const MatchDataContext = createContext<MatchDataContextValue>({
  matchData: null,
  setMatchData: () => {},
  inviteChannelId: null,
  setInviteChannelId: () => {},
  inviteGameId: null,
  setInviteGameId: () => {},
  clearInviteData: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export function MatchProvider({ children }: ProviderProps): JSX.Element {
  const [matchData, setMatchData] = useState<gameType.matchStartData | null>(null);
  const [inviteChannelId, setInviteChannelId] = useState<number | null>(null);
  const [inviteGameId, setInviteGameId] = useState<string | null>(null);

  function clearInviteData() {
    setInviteChannelId(null);
    setInviteGameId(null);
  }

  return (
    <MatchDataContext.Provider value={{
      matchData, setMatchData,
      inviteChannelId, setInviteChannelId,
      inviteGameId, setInviteGameId,
      clearInviteData,
    }}>
      {children}
    </MatchDataContext.Provider>
  );
}