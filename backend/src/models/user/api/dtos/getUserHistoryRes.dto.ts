export interface GameHistoryDto {
  user_id: number;
  target_id: number;
  user_score: number;
  target_score: number;
  user_nickname: string;
  target_nickname: string;
}

export interface GetUserHistoryResDto {
  history: GameHistoryDto[];
}
