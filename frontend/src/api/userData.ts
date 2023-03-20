import { userListData_t } from "@/types/user";
import { createDummyUserListData, UserListDataDummy } from "@/dummy/data";

// 전체 사용자 데이터 요청
export const getGlobalUsersListData = () => {
  return new Promise<Array<userListData_t>>((resolve, reject) => {
    setTimeout(() => {
      // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
      const randomTestUsers = createDummyUserListData(50);
      resolve(randomTestUsers);
    }, 1000);
  });
};

// 전체 사용자 데이터 요청
export const getFriendsListData = () => {
  return new Promise<Array<userListData_t>>((resolve, reject) => {
      setTimeout(() => {
        // 테스트용이며, 아래 코드는 실제 API 요청으로 변경할 예정.
        resolve(UserListDataDummy);
      }, 1000);
  });
};