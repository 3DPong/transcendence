import { FC, useContext, useEffect, useState, useRef } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { Channel, ChatUser, defaultChannel, Message, UserRole } from '@/types/chat';

import { useNavigate, useParams } from 'react-router-dom';
import MessageSender from '@/components/Molecule/Chat/Detail/MessageSender';
import MessageList from '@/components/Molecule/Chat/Detail/MessageList';
import MessageHeader from '@/components/Molecule/Chat/Detail/MessageHeader';
import MenuDrawer from '@/components/Organism/Chat/MenuDrawer';
import { API_URL } from '@/../config/backend';
import GlobalContext from '@/context/GlobalContext';
import ChatContext from '@/context/ChatContext';
import { useError } from '@/context/ErrorContext';
import { useSocket } from '@/context/SocketContext';
import { MatchDataContext } from '@/context/MatchDataContext';

interface ChatDetailProps {}

const ChatDetail: FC<ChatDetailProps> = () => {
  const navigate = useNavigate();
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
  const { handleError } = useError();

  const { chatSocket } = useSocket();

  const { inviteChannelId, setInviteChannelId } = useContext(MatchDataContext);

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
    clearTimeout(listRef.current[targetId]);
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
    return setTimeout(
      () => { unsetTimerHandler(targetId, listRef, setter) }
      , timer
    );
  }

  async function fetchUsersByChannelIdforDM(_channelId: number) {
    const response = await fetch(API_URL + '/chat/' + _channelId + '/users');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unknown error occurred');
    }
    const fetchUsers = await response.json();
    const usrs: ChatUser[] = fetchUsers.map((usr: any) => ({
      id: usr.userId,
      profile: usr.profile_url,
      nickname: usr.userName,
      role: 'user',
      status: 'none',
      deleted_at: null,
    }));
    return usrs;
  }

  async function fetchUsersByChannelId(_channelId: number) {
    const response = await fetch(API_URL + '/chat/' + _channelId + '/users');
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
    const response = await fetch(API_URL + '/chat/' + _channelId + '/banlist');
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
    const response = await fetch(API_URL + '/chat/' + _channelId + '/mutelist');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unknown error occurred');
    }
    const fetchMuteList = await response.json();

    return fetchMuteList.reduce((muteRecord: Record<number, number>, user: any) => {
      const targetId = user.user.user_id;
      const timer = new Date(user.end_at).getTime() - (Date.now());
      if (timer > 100)
        muteRecord[targetId] = setTimerHandler(targetId, muteListRef, setMuteList, timer);
      return muteRecord;
    }, {});
  }

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
    setMyRole(null);

    if (chatSocket) {
      chatSocket.emit('enter-chat', { channel_id: channelId } );
    }

    if (chatSocket) {
      chatSocket.on('chat', (message) => {
        const msg: Message = {
          id: message.message_id,
          senderId: message.user_id,
          content: message.content,
          type: message.type || 'message',
          created_at: new Date(Date.parse(message.created_at)).toISOString().replace('T', ' ').slice(0, -5),
        };
        setMessages([...messagesRef.current, msg]);
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
      });

      chatSocket.on('mute', (message) => {
        const targetId = message.user_id;
        if (targetId in muteListRef.current) {
          // UnMute
          unsetTimerHandler(targetId, muteListRef, setMuteList);
        } else {
          // Mute
          const timerId = setTimerHandler(targetId, muteListRef, setMuteList,
            new Date(message.end_at).getTime() - (Date.now()));
          setMuteList(prevState => ({...prevState, [targetId]: timerId}));
        }
      });

      chatSocket.on('role', (message) => {
        if (message.user_id === loggedUserId)
          setMyRole(message.type);
        setUsers(
          usersRef.current.map((user) => {
            if (user.id === message.user_id)
              user.role = message.type;
            return user;
          })
        );
      });

      chatSocket.on('user', (message) => {
        if (message.type === 'join') {
          const filteredUsers = usersRef.current.filter((aUser) => (
            -1 === message.user.findIndex((iUser: any) => iUser.user.user_id === aUser.id)
          ));
          const joinUsers : ChatUser[] = message.user.map((item: any) => ({
              id: item.user.user_id,
              nickname: item.user.nickname,
              profile: item.user.profile_url,
              role: 'user',
              deleted_at: null,
              status: 'none',
            })
          );
          setUsers([...filteredUsers, ...joinUsers]);
        }
        else {
          setDeletedAtFromUsers(message.user_id);
        }
      });
    }

    return () => {
      if (chatSocket) {
        chatSocket.off('chat');
        chatSocket.off('error');
        chatSocket.off('kick');
        chatSocket.off('ban');
        chatSocket.off('mute');
        chatSocket.emit('leave-chat', { channel_id: channelId } );
      }
    };
    // channelId가 변할땐 메시지들을 그대로 둠
  }, [chatSocket, channelId]);

  function sendMessage(textContent: string) {
    if (chatSocket && loggedUserId) {
      chatSocket.emit('message-chat', { message: textContent, type: 'message', channel_id: channelIdNumber });
    }
  }

  function sendInvite() {
    setInviteChannelId(channelIdNumber);
  }
  
  // 초대 버튼을 누르는 순간 채널아이디가 세팅됨. 세팅된 이후에 navigate
  useEffect(() => {
    if (inviteChannelId)
      navigate('/game');
  }, [inviteChannelId])

  useEffect(() => {
    function cleanupTimers() {
      for (const timerId in banListRef.current) {
        clearTimeout(banListRef.current[timerId]);
      }
      for (const timerId in muteListRef.current) {
        clearTimeout(muteListRef.current[timerId]);
      }
    };

    async function fetchAdminList() {
      try {
        const [bans] = await Promise.all([
          fetchBanListByChannelId(channelIdNumber),
        ]);
        // console.log("fetchBans: ", bans);
        // console.log("fetchMute: ", mutes);
        setBanList(bans);
      }
      catch {
        setBanList([]);
      }
    }

    async function init() {
      setMyRole(null);
      setInviteChannelId(null);
      setDrawerOpen(false);
      try {
        const [usrs, mutes] = await Promise.all(
        channel.type === 'dm' ?
        [ fetchUsersByChannelIdforDM(channelIdNumber)] :
        [ fetchUsersByChannelId(channelIdNumber),
          fetchMuteListByChannelId(channelIdNumber)]);
        setUsers(usrs);
        setMuteList(mutes || []);
        const currentRole = usrs.find((u) => u.id === loggedUserId)?.role || 'none';
        setMyRole(currentRole);
        if (currentRole) {
          if (['admin', 'owner'].includes(currentRole)) {
            console.log(currentRole);
            await fetchAdminList();
          }
        }
      } catch (error) {
        handleError('Init Fetch', (error as Error).message);
      }
    }
    if (channel.id !== 0 && loggedUserId) {
      init();
    }
    return () => {
      cleanupTimers();
    }
  }, [channel, loggedUserId]);

  useEffect(() => {
    const channel = channels.find((ch) => ch.id === channelIdNumber);
    if (channel)
      setChannel(channel);
    else
      navigate('/channels', { replace: true });
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
        handleBattleButton={sendInvite}
      />
    </div>
  );
};

export default ChatDetail;