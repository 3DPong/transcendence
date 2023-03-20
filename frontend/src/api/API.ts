
// 여기서 API 리스트들 묶어서 내보내기.
// 사용할 땐 import * as 이름 from "@/api/API"
export { changeUserRelation, RelationAction } from "./userRelation";
export type { RelationFormat } from "./userRelation";

export { getGlobalUsersListData, getFriendsListData } from "./userData";