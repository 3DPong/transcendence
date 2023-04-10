import { TokenStatusEnum } from '../enums/tokenStatusEnum';

export interface JwtPayloadInterface {
  status: TokenStatusEnum;
  user_id?: number;
  email?: string;
}
