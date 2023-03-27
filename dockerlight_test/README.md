# Pong-backend
## run
`npm install` in `/backend`

`docker-compose up -d`
- 현재 세팅은 개발 환경이며, `pgadmin`, `postgresql`, `node`, `redis` 컨테이너가 올라갑니다.
- node 가 볼륨으로 현재 작업 디렉토리에 연결되어 있습니다.
## setting
- `.env.dev` 세팅 (env.readme.md 확인)
- seeder 내장 `npm run seed` (seeder readme 확인)
## architecture
![image](https://user-images.githubusercontent.com/81505228/224909735-59149f6c-f75d-45fd-b4fb-68e12714799a.png)
## documentation
### docker
- `/backend/docker.readme.md`
### environments
- `/backend/env.readme.md`
### seeder
- `/backend/src/datatbase/dummy/README.md`