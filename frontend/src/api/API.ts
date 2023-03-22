
// 여기서 API 리스트들 묶어서 내보내기.

// (1) User Data
export {

    // GET
    type GET_UserDataResponseFormat,
    getUserDataById,

    // POST
    type POST_UserDataRequestFormat,
    type POST_UserDataResponseFormat,
    updateUserData,

} from "@/api/user/userData";

// (2) User Relation
export {
    type Relation,

    // GET /user/search/{string}
    type GET_GlobalSearchResponseFormat,
    getUsersListBySearchString,

    // GET /user_relation?query
    GET_RelationType, 
    type GET_RelationResponseFormat,
    getUserRelationsList,

    // PUT /user_relation
    type PUT_RelationRequestFormat,
    type PUT_RelationResponseFormat,
    PUT_RelationActionType,
    changeUserRelation,

} from "@/api/user/userRelation";