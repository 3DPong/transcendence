import {Message, Channel, User, ChatUser} from '@/types/chat';

export const dummy_chatdata: Message[][] = [ [
               {"id": 1, "senderId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
               {"id": 2, "senderId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"id": 3, "senderId": 1, "content": "겜한판 하실분?", "created_at": "2022-03-12 13:47:45" },
               {"id": 4, "senderId": 3, "content": "저요", "created_at": "2022-03-12 13:50:45" },
               {"id": 5, "senderId": 4, "content": "저는 관전할게요", "created_at": "2022-03-12 13:50:51" },
               {"id": 6, "senderId": 5, "content": "저랑하실분?", "created_at": "2022-03-12 14:21:45" },
               {"id": 7, "senderId": 2, "content": "저요", "created_at": "2022-03-12 14:22:43" },
               {"id": 8, "senderId": 4, "content": "테스트메시지입니다", "created_at": "2022-03-12 15:27:45" },
               {"id": 9, "senderId": 4, "content": "또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요", "created_at": "2022-03-12 16:27:45" },
               {"id": 10, "senderId": 4, "content": "테스트메시지입니다", "created_at": "2022-03-12 15:27:45" },
               {"id": 11, "senderId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
               {"id": 12, "senderId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
            ], 
            [
               {"id": 13, "senderId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"id": 14, "senderId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
            ] ,
            [
               {"id": 15, "senderId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"id": 16, "senderId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"id": 17, "senderId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"id": 19, "senderId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"id": 20, "senderId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"id": 21, "senderId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"id": 22, "senderId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"id": 23, "senderId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
            ]
          ];


export const dummy_users:ChatUser[] = [
  {"id": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim",  "role": "owner", status:"online"	},
  {"id": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki", "role": "admin", status:"online"	},
  {"id": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar", "role": "user", status:"offline"	},
  {"id": 4, "profile": "https://cdn.intra.42.fr/users/22068839dcdec3e543cf9dfdec1fcf8e/schoe.jpg", "nickname": "schoe","role":"admin",status:"ingame"		},
  {"id": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek","role":"user", status:"offline"	},
  {"id": 6, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "testsetsetsetsetsetsetsetsetsetsetsetsetsetsetsnjak", "role":"user", status:"offline"	},
];

export const dummy_chatrooms:Channel[] = [
  { "id" : 1, "type" : "private", "title" : "3dpong_transcendence",
    "owner" : 
            {"id": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim"	},
  },
  { "id" : 2, "type" : "public", "title" : "r",
    "owner" : 
            {"id": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki" },
  },
  { "id" : 3, "type" : "public", "title" : "1:1 PONG 초보만sanfjkasnfjkasnfjkasdnfjkasndfjkansfjka",
    "owner" : 
            {"id": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim" },
  },
  { "id" : 4, "type" : "public", "title" : "안오면 지상렬",
    "owner" : 
            {"id": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar" },
  },
  { "id" : 5, "type" : "protected", "title" : "아템전 ㄱㄱ",
    "owner" : 
            {"id": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki"},
  },
  { "id" : 6, "type" : "private", "title" : "42seoul 단톡방",
    "owner" : 
            {"id": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek"},
  },
  { "id" : 7, "type" : "dm", "title" : "kback님과의 DM",
    "owner" : 
            {"id": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek"},
  },
  { "id" : 8, "type" : "dm", "title" : "schoe님과의 DM",
    "owner" : 
            {"id": 4, "profile": "https://cdn.intra.42.fr/users/22068839dcdec3e543cf9dfdec1fcf8e/schoe.jpg", "nickname": "schoe"},
  },
]

export const dummy_globalchatrooms:Channel[] = [
  { "id" : 9, "type" : "private", "title" : "음 무슨방으로 하지",
    "owner" : 
            {"id": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim"	},
  },
  { "id" : 10, "type" : "public", "title" : "ㄴㅁ어ㅏㄹ",
    "owner" : 
            {"id": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki" },
  },
  { "id" : 21, "type" : "protected", "title" : "aaa",
    "owner" : 
            {"id": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim" },
  },
  { "id" : 13, "type" : "public", "title" : "글로벌방입니다",
    "owner" : 
            {"id": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim" },
  },
  { "id" : 14, "type" : "protected", "title" : "아주긴이름의 채팅방입니다 과연글이 어떻게될지 테스트하는 용도예요",
    "owner" : 
            {"id": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar" },
  },
]


type status = 'friend' | 'block' | 'none';
const statusArr: status[] = ['friend', 'block', 'none'];
const DUMMY_IMG = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png";
function staticFunc() {
  let static_num = 0;
  return function num(_searchString: string) {
    ++static_num;
    return {
      user_id: _searchString.charCodeAt(0) + static_num,
      nickname: _searchString + static_num.toString(),
      profile_url: DUMMY_IMG,
      status: statusArr[static_num % 3],
    };
  };
};
const createUserDummyDataByNickname = staticFunc();

export const createUsersDummyByString = (str: string, size: number) => {
  let arr = [];
  while (size > 0) {
    arr.push(createUserDummyDataByNickname(str));
    --size;
  }
  return arr;
}