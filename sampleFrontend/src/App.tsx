
import { Route, Routes } from 'react-router-dom';
import Chatroom from './pages/chatroom/chatroom';
import WaitingRoom from './pages/waiting-room/waiting-room';
import { io } from 'socket.io-client';

// 웹소켓 연결 및 소켓 인스턴스 생성 backend 포트 번호 입력
export const socket = io('http://localhost:3000/chat');

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WaitingRoom />} />
      <Route path="/room/:roomName" element={<Chatroom />} />
    </Routes>
  );
};


export default App;