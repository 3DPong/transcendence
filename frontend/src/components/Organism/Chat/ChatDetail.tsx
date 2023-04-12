import { FC, useContext, useEffect, useState, useRef } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { Channel, ChatUser, defaultChannel, Message, UserRole } from '@/types/chat';

import { useParams } from 'react-router-dom';
import MessageSender from '@/components/Molecule/Chat/Detail/MessageSender';
import MessageList from '@/components/Molecule/Chat/Detail/MessageList';
import MessageHeader from '@/components/Molecule/Chat/Detail/MessageHeader';
import BattleRequestModal from '@/components/Molecule/Chat/Detail/BattleRequestModal';
import BattleNotification from '@/components/Molecule/Chat/Detail/BattleNotification';
import MenuDrawer from '@/components/Organism/Chat/MenuDrawer';
import { API_URL } from '@/../config/backend';
import GlobalContext from '@/context/GlobalContext';
import ChatContext from '@/context/ChatContext';
import { useError } from '@/context/ErrorContext';
import { useSocket } from '@/context/SocketContext';

interface ChatDetailProps {}

const ChatDetail: FC<ChatDetailProps> = () => {
  const { channels, loggedUserId } = useContext(GlobalContext);
  const { channelId } = useParams();
  const channelIdNumber = Number(channelId);
  const [channel, setChannel] = useState<Channel>(defaultChannel);

  const [myRole, setMyRole] = useState<UserRole | null>(null);

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [banList, setBanList] = useState<Record<number, number>>({});
  const [muteList, setMuteList] = useState<Record<number, number>>({});

  const [messages, setMessages] = useState<Message[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { handleError } = useError();

  const { chatSocket } = useSocket();

  // 최신 상태 유지를 위한 ref
  const messagesRef = useRef<Message[]>([]);
  const muteListRef = useRef<Record<number, number>>({});
  const banListRef = useRef<Record<number, number>>({});
  const usersRef = useRef<ChatUser[]>([]);

  function unsetTimerHandler(
      targetId: number,
      listRef: React.MutableRefObject<Record<number, number>>,
      setter: (list: Record<number, number>) => void
    ) {
      console.log("unsetTimerHandler");
    clearTimeout(listRef.current[targetId]);
      console.log("muteRef: ", muteListRef.current);
      console.log("banRef: ", banListRef.current);
      console.log("listRef: ", listRef.current);
    const {[targetId]: value, ...newList} = listRef.current;
    // console.log("testNewLIst=>", newList);
    setter(newList);
  }

  function setTimerHandler(
      targetId: number,
      listRef: React.MutableRefObject<Record<number, number>>,
      setter: (list: Record<number, number>) => void,
      timer: number
    ) {
      console.log("setTimerHandler");
      console.log("time: ", timer);
    return setTimeout(
      () => { unsetTimerHandler(targetId, listRef, setter) }
      , timer
    );
  }

  async function fetchUsersByChannelId(_channelId: number) {
    const response = await fetch(API_URL + '/chat/' + _channelId + '/users' + '?id=' + loggedUserId, {
      cache: 'no-cache',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unknown error occurred');
    }
    const fetchUsers = await response.json();
    const usrs: ChatUser[] = fetchUsers.map((usr: any) => ({
      id: usr.user.user_id,
      profile: usr.user.profile_url,
      nickname: usr.user.nickname,
      role: usr.role,
      status: 'none',
      deleted_at: usr.deleted_at,
    }));
    return usrs;
  }

  async function fetchBanListByChannelId(_channelId: number) {
    const response = await fetch(API_URL + '/chat/' + _channelId + '/banlist' + '?id=' + loggedUserId);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unknown error occurred');
    }
    const fetchBanList = await response.json();

    return fetchBanList.reduce((banRecord: Record<number, number>, user: any) => {
      const targetId = user.user.user_id;
      const timer = new Date(user.end_at).getTime() - (Date.now());
      // 0.1초보다 큰 경우만 타이머 세팅 이러면 mute, unmute 따로 두는게 좋을수 있음
      if (timer > 100)
        banRecord[targetId] = setTimerHandler(targetId, banListRef, setBanList, timer);
      return banRecord;
    }, {});
  }

  async function fetchMuteListByChannelId(_channelId: number) {
    const response = await fetch(API_URL + '/chat/' + _channelId + '/mutelist' + '?id=' + loggedUserId);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unknown error occurred');
    }
    const fetchMuteList = await response.json();

    return fetchMuteList.reduce((muteRecord: Record<number, number>, user: any) => {
      const targetId = user.user.user_id;
      const timer = new Date(user.end_at).getTime() - (Date.now());
      console.log(timer);
      if (timer > 100)
        muteRecord[targetId] = setTimerHandler(targetId, muteListRef, setMuteList, timer);
      return muteRecord;
    }, {});
  }

  const handleGameCreate = (gameType: string) => {
    //createBattle();
    setShowNotification(true);
    setBattleModalOpen(false);
  };

  useEffect(() => {
    async function fetchAdminList() {
      const [bans, mutes] = await Promise.all([
        fetchBanListByChannelId(channelIdNumber),
        fetchMuteListByChannelId(channelIdNumber),
      ]);
      // console.log("fetchBans: ", bans);
      // console.log("fetchMute: ", mutes);
      setBanList(bans);
      setMuteList(mutes);
    }
    if (myRole !== null) {
      if (["admin", "owner"].includes(myRole)) {
        fetchAdminList();
      }
    }
  }, [myRole]);

  // State들의 최신 상태 유지
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    muteListRef.current = muteList;
  }, [muteList]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    banListRef.current = banList;
  }, [banList]);

  function setDeletedAtFromUsers(targetId : number) {
    // console.log(usersRef.current);
    const updatedUsers = usersRef.current.map((user) => {
      if (user.id === targetId)
        return {...user, deleted_at: Date.now()};
      else
        return user;
    });
    setUsers(updatedUsers as ChatUser[]);
  }

  useEffect(() => {
    console.log('socket useEffect in');
    if (chatSocket) {
      // 이게 의미가 있나? 현재 채팅방의 이벤트인지 확인 후 처리
      chatSocket.on('chat', (message) => {
        if (message.channel_id) {
          const msg: Message = {
            id: message.message_id,
            senderId: message.user_id,
            content: message.content,
            created_at: new Date(Date.parse(message.created_at)).toISOString().replace('T', ' ').slice(0, -5),
          };
          setMessages([...messagesRef.current, msg]);
        }
      });

      chatSocket.on('error', (message) => {
        handleError('Socket Error', message.message);
      });

      chatSocket.on('kick', (message) => {
        if (message.channel_id) {
          setDeletedAtFromUsers(message.user_id);
        }
      });

      chatSocket.on('ban', (message) => {
        if (message.channel_id) {
          const targetId = message.user_id;
          if (targetId in banListRef.current) {
            // UnBan
            unsetTimerHandler(targetId, banListRef, setBanList);
          }
          else {
            // Ban
            setDeletedAtFromUsers(targetId);
            const timerId = setTimerHandler(targetId, banListRef, setBanList,
              new Date(message.end_at).getTime() - (Date.now()));
            setBanList(prevState => ({...prevState, [targetId]: timerId}));
          }
        }
      });

      chatSocket.on('mute', (message) => {
        if (message.channel_id === channelId) {
          const targetId = message.user_id;
          if (targetId in muteListRef.current) {
            // UnMute
            console.log("unmute");
            unsetTimerHandler(targetId, muteListRef, setMuteList);
          } else {
            // Mute
            console.log("mute");

            const timerId = setTimerHandler(targetId, muteListRef, setMuteList,
              new Date(message.end_at).getTime() - (Date.now()));
            setMuteList(prevState => ({...prevState, [targetId]: timerId}));
          }
        }
      });
    }

    return () => {
      console.log('socket userEffect out');
    };
    // channelId가 변할땐 메시지들을 그대로 둠
  }, [chatSocket /*, channelId*/]);

  function sendMessage(textContent: string) {
    if (chatSocket && loggedUserId) {
      chatSocket.emit('message-chat', { message: textContent, channel_id: channelIdNumber });
      // const formattedTime = new Date(Date.now()).toISOString().replace('T', ' ').slice(0, -5);
      // const message : Message = {id: getMessageId(), senderId:loggedUserId, content:textContent, created_at:formattedTime};
      // setMessages([...messages, message]);
    }
  }

  useEffect(() => {
    function cleanupTimers() {
      for (const timerId in banListRef.current) {
        clearTimeout(banListRef.current[timerId]);
      }
      for (const timerId in muteListRef.current) {
        clearTimeout(muteListRef.current[timerId]);
      }
    };

    async function init() {
      setMyRole(null);
      setShowNotification(false);
      setDrawerOpen(false);
      try {
        const usrs = await fetchUsersByChannelId(channelIdNumber);
        setUsers(usrs);
        setMyRole(usrs.find((u) => u.id === loggedUserId)?.role || 'none');
      } catch (error) {
        handleError('Init Fetch', (error as Error).message);
      }
    }
    if (loggedUserId)
      init();
    return ()=>{
      console.log("======cleanTimers()=======");
      cleanupTimers();
    }
  }, [channelId, loggedUserId]);

  useEffect(() => {
    const channel = channels.find((ch) => ch.id === channelIdNumber);
    if (channel) setChannel(channel);
  }, [channelId, channels]);

  return (
    <div className="flex flex-col h-full">
      <MessageHeader
        channel={channel}
        memberCount={users.filter((u) => u.deleted_at === null).length}
        handleMenuButton={() => {
          setDrawerOpen(true);
        }}
      />
      <ChatContext.Provider
        value={{
          myRole,
          setMyRole,
          muteList,
          setMuteList,
          banList,
          setBanList,
        }}
      >
        <MessageList channelId={channelIdNumber} users={users} messages={messages} setMessages={setMessages} />
        <MenuDrawer
          users={users}
          setUsers={setUsers}
          open={drawerOpen}
          handleClose={() => {
            setDrawerOpen(false);
          }}
          channel={channel}
        />
      </ChatContext.Provider>
      <MessageSender
        sendMessage={sendMessage}
        handleBattleButton={() => {
          setBattleModalOpen(true);
        }}
      />

      <BattleRequestModal
        open={battleModalOpen}
        onClose={() => setBattleModalOpen(false)}
        onGameCreate={handleGameCreate}
      />
      {showNotification && (
        <div className="absolute top-14 left-0 right-0 ">
          <BattleNotification onClose={() => setShowNotification(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatDetail;
