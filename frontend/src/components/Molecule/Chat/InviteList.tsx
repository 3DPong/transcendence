import { User } from "@/types/chat";
import { FC } from "react";
import SearchList from "./SearchList";
import InviteCard from "./InviteCard";

interface InviteListProps {
  inviteUsers: User[];
  setInviteUsers: (user: User[]) => void;
};

const InviteList : FC<InviteListProps> = ({inviteUsers, setInviteUsers}) => {

  function handleAvatarClick(user : User){
    const selectedIndex = inviteUsers.findIndex(
      (inviteUser) => inviteUser.id === user.id
    );
    let newInviteUsers: User[] = [];

    newInviteUsers = newInviteUsers.concat(
      inviteUsers.slice(0, selectedIndex),
      inviteUsers.slice(selectedIndex + 1));
    setInviteUsers(newInviteUsers);
  }
  return (
    <div className=" mt-2 mb-6 p-0">
      <label className="inline-block mb-2 text-gray-700 form-label">
        초대 리스트 ({inviteUsers.length}명)
      </label>
      <div className="mb-2 flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200">
        {inviteUsers.map((user) => (
          <InviteCard key={user.id} user={user} onClick={()=>{handleAvatarClick(user)}} />
        ))}
      </div>
      <SearchList inviteUsers={inviteUsers} setInviteUsers={setInviteUsers} />
    </div>
  );
};

export default InviteList;