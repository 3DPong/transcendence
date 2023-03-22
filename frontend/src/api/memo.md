(1) User data API
https://github.com/3DPong/transcendence/discussions/14
(2) User relation API
https://github.com/3DPong/transcendence/issues/43

질문. 성준님 pr을 보니, 친구 리스트를 한번에 가져오는게 아니네.

(1) 친구리스트 
---------------------------------------------
GET /user_relation : 해당 유저의 모든 관계 반환
GET /user_relation?relation=friend : 친구관계 반환
GET /user_relation?relation=block : 차단관계 반환

- 1. 친구  (status: friend)

- 2. 차단자 (status: block)

- 3. 친구도 아니지만 차단도 안한 관계 (status: none)

(2) 친구 리스트 얻는 과정
1. 일단 /user_relation?relation=friend 요청.
2. request에는 내 친구들의 target_id가 모두 들어있음.
3. 각 relation들을 순회하면서 한칸마다 데이터 요청
    - GET /user/${target_Id}
   