import { Message, ChatUser } from '@/types/chat';
import { gameType } from '@/types/game';
import { FC } from 'react';
import AvatarSet from '../AvatarSet';
import { FiRefreshCcw } from 'react-icons/fi';

interface Image {
  url: string;
  title: string;
}

const images: {
  [key: string]: Image;
} = {
  'normal' : {
    url: 'https://www.gamespot.com/a/uploads/original/1592/15920003/3670936-nda%20_5_14_9_am_pt%20kartrider%20drift%2011.png',
    title: 'Normal',
  },
  'special' : {
    url: 'https://mmoculture.com/wp-content/uploads/2019/04/Crazy-Racing-KartRider.jpg',
    title: 'Special',
  },
}

interface InviteMessage {
  gameId: string, 
  gameMode: gameType,
}

function parseInviteMessage(content: string) {
  const data: InviteMessage = JSON.parse(content);
  const image = images[data.gameMode];
  const imageUrl = image ? image.url : '';
  const p1 = 'dongkim';
  const p2 = null;
  const gameState = 'wait';

  function getGameState(state: string) {
    switch (state) {
      case 'wait':
        return '대기중';
      case 'run':
        return '게임중';
      case 'end':
        return '게임종료'
      default:
        return '알수없음';
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        <p className="font-bold text-lg">[3D Pong]</p>
        <p>ID: {data.gameId}</p>
        <p>모드: {data.gameMode}</p>
        <p>상태: {getGameState('')}</p>

        <p>{p1} vs {p2 || '???'}</p>

        <img src={imageUrl} alt={image?.title} style={{ width:'100%'}} />

        <div className="mt-2 flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg">게임 참여하기</button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-lg">관전하기</button>
        </div>
      </div>

      {/* 참여자의 닉네임, 게임상태 등을 요청하는 버튼 닉네임을 가져오기 어렵다면 상태만 가져와도됨 */}
      <button disabled className="absolute top-0 right-0
        bg-transparent hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg mt-2 mr-2">
        <FiRefreshCcw className="inline-block mr-1" />
      </button>
    </div>
  );
}

interface MessageCardProps {
  message: Message;
  sender: ChatUser;
  isMyMessage: boolean;
  isFirstMessage: boolean;
  isLastMessage: boolean;
  scrollY: number;
}

const MessageCard: FC<MessageCardProps> = ({
  message,
  sender,
  isMyMessage,
  isFirstMessage,
  isLastMessage,
  scrollY,
}) => {

  return (
    <div
      key={message.id}
      className={`flex items-end space-x-2
                ${isFirstMessage ? 'space-y-4' : ''}
                ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      {!isMyMessage && (
        <div
          className={`relative transition-opacity duration-300
                        ${isFirstMessage ? '' : 'invisible'}
                        ${isLastMessage ? 'pb-4' : ''}`}
        >
          <AvatarSet user={sender} scrollY={scrollY} />
        </div>
      )}

      <div className={`ml-2 ${isMyMessage ? 'text-right pl-8' : 'text-left pr-8'}`}>
        {isFirstMessage && !isMyMessage && <p className="text-sm text-gray-600">{sender.nickname}</p>}
        <div
          className={`inline-block px-3 py-2 mt-1 rounded-lg text-sm ${
            isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          } break-all`}
        >
          {message.type === 'message' ? message.content : parseInviteMessage(message.content)}
        </div>
        {isLastMessage && <p className="text-xs text-gray-500 mt-1">{message.created_at}</p>}
      </div>
    </div>
  );
};

export default MessageCard;
