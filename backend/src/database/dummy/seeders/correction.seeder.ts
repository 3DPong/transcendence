import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { DataSource } from 'typeorm';
@Injectable()
export class CorrectionSeeder implements Seeder {
  constructor(private dataSource: DataSource) {}

  /**
   * 1. protected channel 만 비밀번호를 가지도록 함
   * 2. dm channel 이 아닌데 dm channel 테이블에 들어간 경우 변경
   * 3. user 에서 wins + losses = total 으로 변경
   */
  seed(): Promise<any> {
    return this.dataSource
      .createQueryRunner()
      .query(
        "UPDATE chat_channel SET password = NULL WHERE type != 'protected';" +
          "DELETE FROM dm_channel WHERE channel_id IN (SELECT channel_id FROM chat_channel WHERE type <> 'dm');" +
          'UPDATE public."user" SET total = wins + losses;'
      );
  }
  drop(): Promise<any> {
    return;
  }
}
