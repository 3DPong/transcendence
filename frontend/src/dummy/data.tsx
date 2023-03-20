import {Message, Room, User} from '@/types/chat';

export const dummy_chatdata: Message[][] = [ [
               {"messageId": 1, "userId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
               {"messageId": 2, "userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"messageId": 3, "userId": 1, "content": "겜한판 하실분?", "created_at": "2022-03-12 13:47:45" },
               {"messageId": 4, "userId": 3, "content": "저요", "created_at": "2022-03-12 13:50:45" },
               {"messageId": 5, "userId": 4, "content": "저는 관전할게요", "created_at": "2022-03-12 13:50:51" },
               {"messageId": 6, "userId": 5, "content": "저랑하실분?", "created_at": "2022-03-12 14:21:45" },
               {"messageId": 7, "userId": 2, "content": "저요", "created_at": "2022-03-12 14:22:43" },
               {"messageId": 8, "userId": 4, "content": "테스트메시지입니다", "created_at": "2022-03-12 15:27:45" },
               {"messageId": 9, "userId": 4, "content": "또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요또 테스트 메시지 아주길게 작성하면 어떻게될까요? 정말 궁금하네요", "created_at": "2022-03-12 16:27:45" },
               {"messageId": 10, "userId": 4, "content": "테스트메시지입니다", "created_at": "2022-03-12 15:27:45" },
               {"messageId": 11, "userId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
               {"messageId": 12, "userId": 1, "content": "하이요", "created_at": "2022-03-12 13:27:45" },
            ], 
            [
               {"messageId": 13, "userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"messageId": 14, "userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
            ] ,
            [
               {"messageId": 15, "userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"messageId": 16, "userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"messageId": 17, "userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"messageId": 19, "userId": 5, "content": "gd", "created_at": "2022-03-12 13:27:45" },
               {"messageId": 20, "userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"messageId": 21, "userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"messageId": 22, "userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
               {"messageId": 23, "userId": 2, "content": "ㅎㅇ", "created_at": "2022-03-12 13:30:45" },
            ]
          ];


export const dummy_users:User[] = [
  {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim", status:"online"	},
  {"userId": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki", status:"online"	},
  {"userId": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar", status:"offline"	},
  {"userId": 4, "profile": "https://cdn.intra.42.fr/users/22068839dcdec3e543cf9dfdec1fcf8e/schoe.jpg", "nickname": "schoe", status:"ingame"		},
  {"userId": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek", status:"offline"	},
];

export const dummy_chatrooms:Room[] = [
  { "channelId" : 1, "channelType" : "private", "channelName" : "3dpong_transcendence",
    "owner" : 
            {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim"	},
  },
  { "channelId" : 2, "channelType" : "public", "channelName" : "r",
    "owner" : 
            {"userId": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki" },
  },
  { "channelId" : 3, "channelType" : "public", "channelName" : "1:1 PONG 초보만",
    "owner" : 
            {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim" },
  },
  { "channelId" : 4, "channelType" : "public", "channelName" : "안오면 지상렬",
    "owner" : 
            {"userId": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar" },
  },
  { "channelId" : 5, "channelType" : "protected", "channelName" : "아템전 ㄱㄱ",
    "owner" : 
            {"userId": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki"},
  },
  { "channelId" : 6, "channelType" : "private", "channelName" : "42seoul 단톡방",
    "owner" : 
            {"userId": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek"},
  },
  { "channelId" : 7, "channelType" : "dm", "channelName" : "kback님과의 DM",
    "owner" : 
            {"userId": 5, "profile": "https://cdn.intra.42.fr/users/60f2218ca091c4fdff3f596797747bc4/kbaek.jpg", "nickname": "kbaek"},
  },
  { "channelId" : 8, "channelType" : "dm", "channelName" : "schoe님과의 DM",
    "owner" : 
            {"userId": 4, "profile": "https://cdn.intra.42.fr/users/22068839dcdec3e543cf9dfdec1fcf8e/schoe.jpg", "nickname": "schoe"},
  },
]

export const dummy_globalchatrooms:Room[] = [
  { "channelId" : 9, "channelType" : "private", "channelName" : "음 무슨방으로 하지",
    "owner" : 
            {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim"	},
  },
  { "channelId" : 10, "channelType" : "public", "channelName" : "ㄴㅁ어ㅏㄹ",
    "owner" : 
            {"userId": 2, "profile": "https://cdn.intra.42.fr/users/3185bf6f53751f455e9b1f5833c23393/minkyeki.JPG", "nickname": "minkyeki" },
  },
  { "channelId" : 21, "channelType" : "protected", "channelName" : "aaa",
    "owner" : 
            {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim" },
  },
  { "channelId" : 13, "channelType" : "public", "channelName" : "글로벌방입니다",
    "owner" : 
            {"userId": 1, "profile": "https://cdn.intra.42.fr/users/438c44cacfdc69822c7ff066a0b7959d/dongkim.jpg", "nickname": "dongkim" },
  },
  { "channelId" : 14, "channelType" : "protected", "channelName" : "아주긴이름의 채팅방입니다 과연글이 어떻게될지 테스트하는 용도예요",
    "owner" : 
            {"userId": 3, "profile": "https://cdn.intra.42.fr/users/e433fdfa3b130d737d084240f3e86371/sungjpar.jpg", "nickname": "sungjpar" },
  },
]

import { userListData_t, eUserStatus } from '@/types/user';

const DUMMY_IMG = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png";
export const UserListDataDummy: userListData_t[] = [
  {
    profile: {
      id: 0,
      imgSrc: DUMMY_IMG,
      name: "userA",
    },
    isBlocked: false,
    status: eUserStatus.online,
  },
  {
    profile: {
      id: 1,
      imgSrc: DUMMY_IMG,
      name: "userB",
    },
    isBlocked: false,
    status: eUserStatus.offline,
  },
  {
    profile: {
      id: 2,
      imgSrc: DUMMY_IMG,
      name: "userC",
    },
    isBlocked: true,
    status: eUserStatus.offline,
  },
  {
    profile: {
      id: 3,
      imgSrc: DUMMY_IMG,
      name: "userD",
    },
    isBlocked: false,
    status: eUserStatus.online,
  },
];

// Create Dummy Data
export const createDummyUserListData = (initialCount: number) => {
  const DUMMY_IMG = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png";
  let users = new Array<userListData_t>();
  while (initialCount > 0) {
    users.push({
      profile: {
        id: initialCount + 500,
        imgSrc: DUMMY_IMG,
        name: "user" + initialCount.toString(),
      },
      isBlocked: false,
      status: initialCount % 2,
    });
    --initialCount;
  }
  return users;
};
