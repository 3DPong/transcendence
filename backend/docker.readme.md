## 도커 컨테이너
## 사용방법
### 주의
- 개발 환경의 경우와 배포 환경에서 서로 다릅니다.
- 개발 환경일 경우 `/backend`에서 `npm install` 이후 실행해주세요.
- `docker-compose up -d` at `/backend`
### 컨테이너
#### postgres
- postgres 컨테이너
- port : 5432 
- connect : postgres:5432
#### pgadmin
- pgadmin 컨테이너 (백엔드 편의성을 위함
- port: 5050
- connect : localhost:5050
- **로그인 정보 (기본값)**
  - **id :** pong@42seoul.kr
  - **pw :** pong
  - 로컬 환경이니 각자 맞춰서 변경하세요.
#### node
- node 컨테이너 (백엔드 앱 구동용)
#### redis
- redis 컨테이너
## 필요 디렉토리
```
backend
 └── docker-volume
    ├── pgadmin
    ├── postgres-data
    └── redis-data
```

