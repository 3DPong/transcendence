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
 