## **! 환경변수를 추가하거나 바꾸는 경우 해당 파일을 반드시 업데이트할 것 !**
## SAMPLE:  **env.sample**
- `.env.dev` 등으로 복사 변경하여 사용하세요.
## ENV FILE REQUIREMENTS
### POSTGRESQL
- **host**
    - **PG_HOST**
      - VALUE
          - in local
              - `postgresql` (docker container name)
              - `host.docker.internal`
              - `localhost`
- **port**
    - **PG_PORT**
    - default : 5432
- **username**
    - **PG_USER_NAME**
    - default : postgres (production 에서는 바뀝니다.)
- **password**
    - **PG_PASSWORD**
    - default : postgres (production 에서는 바뀝니다.
- **DB Name**
    - **PG_DATABASE**
    - default : transcendence (production 에서는 바뀝니다.

### APP
- **host**
    - **APP_HOST**
        - VALUE
            - in local
                - `host.docker.internal`
                - `localhost`
- **port**
    - **APP_PORT**
    - default: 3000 (바뀔 수 있습니다.)
### REDIS
- **host**
    - **REDIS_HOST**
        - redis 에 연결하기 위한 hostname
    - **REDIS_PORT**
        - redis 에 연결하기 위한 port 

### SESSION
- **secret**
    - **SESSION_SECRET**
        - session 에 사용되는 secret key

### FT

**auth 모듈 42 api 설정을 위함**

- **client_id**
    - **FT_CLIENT**
        - 42 api client id 
- **secret**
     - **FT_SECRET**
        - 42 api secret key
- **callback**
    - **FT_CALLBACK**
        - api redirection uri
        - `/auth/redirect/42`

### IMAGE
**image 저장 디렉토리 지정을 위함**
- **IMAGE_STORAGE_PATH**
  - `storage/images`
  - `{저장하고싶은 경로}`
  - 실제 저장 경로 `/backend/{해당 경로}`

### OTP
**OTP 암호화를 위한 키**
- **OTP_SECRET**
  - 32byte string 