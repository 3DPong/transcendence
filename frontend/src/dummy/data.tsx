import {Message, Room, User} from '@/types/chat';

export const dummy_chatdata: Message[][] = [ [
               {"userId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
               {"userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"userId": 1, "content": "겜한판 하실분?", "created_at": "2022-03-12 13:47:45" },
               {"userId": 3, "content": "저요", "created_at": "2022-03-12 13:50:45" },
               {"userId": 4, "content": "저는 관전할게요", "created_at": "2022-03-12 13:50:51" },
               {"userId": 5, "content": "저랑하실분?", "created_at": "2022-03-12 14:21:45" },
               {"userId": 2, "content": "저요", "created_at": "2022-03-12 14:22:43" },
               {"userId": 4, "content": "테스트메시지입니다", "created_at": "2022-03-12 15:27:45" },
               {"userId": 4, "content": "또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요", "created_at": "2022-03-12 16:27:45" },
               {"userId": 4, "content": "테스트메시지입니다", "created_at": "2022-03-12 15:27:45" },
               {"userId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
               {"userId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
            ], 
            [
               {"userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
            ] ,
            [
               {"userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
            ]
          ];

export const dummy_chatroomdata = 
{"users": [
  {"userId": 1, "profile": "www.naver.com", "nickname": "dongkim", state:"online"	},
  {"userId": 2, "profile": "www.naver.com", "nickname": "minkyeki", state:"online"	},
  {"userId": 3, "profile": "www.naver.com", "nickname": "sungjpar", state:"offline"	},
  {"userId": 4, "profile": "www.naver.com", "nickname": "schoe", state:"ingame"		},
  {"userId": 5, "profile": "www.naver.com", "nickname": "kbaek", state:"offline" 	} ],
 "options" : { "chatname": "3dpong_transcendence", "access" : "public" },
};

export const dummy_users:User[] = [
  {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim", status:"available"	},
  {"userId": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki", status:"available"	},
  {"userId": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar", status:"invisible"	},
  {"userId": 4, "profile": "https://cdn.intra.42.fr/users/22068839dcdec3e543cf9dfdec1fcf8e/schoe.jpg", "nickname": "schoe", status:"dnd"		},
  {"userId": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek", status:"invisible"	},
];

export const dummy_chatrooms:Room[] = [
  { "channelId" : 1, "channelType" : "private", "channelName" : "3dpong_transcendence",
    "owner" : 
            {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim", status:"available"	},
  },
  { "channelId" : 2, "channelType" : "public", "channelName" : "rpdla rkxdl gktlfqns!!",
    "owner" : 
            {"userId": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki", status:"available"	},
  },
  { "channelId" : 3, "channelType" : "public", "channelName" : "1:1 PONG 초보만",
    "owner" : 
            {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim", status:"available"	},
  },
  { "channelId" : 4, "channelType" : "public", "channelName" : "안오면 지상렬",
    "owner" : 
            {"userId": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar", status:"invisible"	},
  },
  { "channelId" : 5, "channelType" : "protected", "channelName" : "아템전 ㄱㄱ",
    "owner" : 
            {"userId": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki", status:"available"	},
  },
  { "channelId" : 6, "channelType" : "private", "channelName" : "42seoul 단톡방",
    "owner" : 
            {"userId": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek", status:"invisible"	},
  },
  { "channelId" : 7, "channelType" : "private", "channelName" : "kback님과의 DM",
    "owner" : 
            {"userId": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek", status:"invisible"	},
  },
  { "channelId" : 8, "channelType" : "private", "channelName" : "schoe님과의 DM",
    "owner" : 
            {"userId": 4, "profile": "https://cdn.intra.42.fr/users/22068839dcdec3e543cf9dfdec1fcf8e/schoe.jpg", "nickname": "schoe", status:"dnd"		},
  },
]