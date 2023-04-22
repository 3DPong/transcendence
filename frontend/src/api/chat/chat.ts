import { API_URL } from "@/../config/backend";
import { Channel } from "@/types/chat";
import { NavigateOptions } from "react-router-dom";

export async function fetchDM(
  id: number,
  navigate: (path: string, options?: NavigateOptions) => void,
  handleError: (title: string, errorMessage: string) => void,
  channels: Channel[],
  setChannels: (channels: Channel[]) => void
) {
  const response = await fetch(API_URL + '/chat/dm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: id,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    handleError('Send DM', error.message);
    return;
  }
  const ch = await response.json();
  const newChannel = {
    id: ch.channel_id,
    type: ch.type,
    title: ch.owner.nickname + '님과의 DM',
    thumbnail: ch.owner.profile_url,
    owner: {
      id: ch.owner.user_id,
      nickname: ch.owner.nickname,
      profile: ch.owner.profile_url,
    },
  };
  if (-1 === channels.findIndex((ch : Channel)=>(ch.id === newChannel.id)))
    setChannels([newChannel, ...channels]);
  navigate('/channels/' + ch.channel_id, { state: undefined });
  console.log(response);
}