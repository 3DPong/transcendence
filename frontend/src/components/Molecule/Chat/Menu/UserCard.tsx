import { User } from "@/types/chat";
import { FC } from "react";

interface UserCardProps {
  user : User;
};

const UserCard : FC<UserCardProps> = ({user}) => {
  return (
    <div>
      {user.nickname}
    </div>
  );
};

export default UserCard;