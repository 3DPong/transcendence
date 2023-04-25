# Seeder

## 사용 방법

1. 우선 컨테이너를 올려줍니다.
    - 더미 데이터를 주입 과정에서 node 컨테이너는 필요없으니, stop 해두셔도 됩니다.
2. `npm run seed` 를 통해서 `seeder` 를 실행합니다.
3. 도커 컨테이너에 올려둔 pgadmin 을 통해서 확인하면 데이터가 주입된 것을 확인하실 수 있습니다.

## 기능

1. 각 테이블에 더미 데이터를 랜덤한 값으로 주입합니다.
2. 랜덤한 값이 주입되어 맞지 않는 데이터 (protected 가 아닌데 비밀번호가 있다거나, dm 채널이 아닌데 DmChannel 에 있다거나)를 교정합니다.

## 주의 사항

1. production 환경에서는 절대 실행하시면 안됩니다!!
2. 현재 데이터가 있는 경우 데이터 충돌이 일어납니다. 빈 데이터 베이스에서 활용해주세요

## 데이터베이스 비우기

1. postgres 컨테이너에서 직접 접근 혹은 pgadmin 을 통해 데이터베이스에 접근합니다.
2. 데이터베이스는 drop 후 다시 create 합니다.

- cli 환경의 경우

``` sql
drop database transcendence; 
create dateabase transcendence;
```

- pgadmin 의 경우
    - db 를 drop 하고 다시 만듭니다.

## seeder 를 추가 / 변경하고 싶은 경우

- 아래 문서 참고
    - https://velog.io/@from_numpy/NestJS-nestJS-seeder-%EB%8D%94%EB%AF%B8%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-feet.-faker-js
- 그래도 모르겠다면 @JuneParkCode 에게 문의
