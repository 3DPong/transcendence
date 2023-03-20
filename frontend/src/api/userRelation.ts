import { Assert } from "@/utils/Assert";

// API 요청/응답 Json 포맷
export interface RelationFormat {
  user_id: number; // target user
  friend?: boolean;
  block?: boolean;
}

export enum RelationAction {
  addFriend,
  deleteFriend,
  blockUser,
  unBlockUser,
}

// 사용자의 block여부, friend 여부 수정
export const changeUserRelation = (userId: number, action: RelationAction) => {
  return new Promise<RelationFormat>((resolve, reject) => {
    let request: RelationFormat = { user_id: userId };
    switch (action) {
      case RelationAction.addFriend:
        request.friend = true;
        break;
      case RelationAction.deleteFriend:
        request.friend = false;
        break;
      case RelationAction.blockUser:
        request.block = true;
        break;
      case RelationAction.unBlockUser:
        request.block = false;
        break;
      default:
        Assert.MustBeTrue(false, "No matching relation action");
    }
    // API MOCKUP
    setTimeout(() => {
      const response = request; // 정상 수행일 경우 res = req
      resolve(response);
    }, 1000);
  });
};
