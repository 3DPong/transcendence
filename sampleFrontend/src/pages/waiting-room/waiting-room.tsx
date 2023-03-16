
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Head, Table } from './waiting-room.styles';
import { socket } from '../../App';


interface CreateRoomResponse {
  success: boolean;
  payload: string;
}


const WaitingRoom = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
    const roomListHandler = (rooms: string[]) => {
      setRooms(rooms);
    };
    const createRoomHandler = (newRoom: string) => {
      setRooms((prevRooms) => [...prevRooms, newRoom]);
    };
    const deleteRoomHandler = (roomName: string) => {
      setRooms((prevRooms) => prevRooms.filter((room) => room !== roomName));
    };


    socket.emit('room-list', roomListHandler);
    socket.on('create-room', createRoomHandler);
    socket.on('delete-room', deleteRoomHandler);


    return () => {
      socket.off('room-list', roomListHandler);
      socket.off('create-room', createRoomHandler);
      socket.off('delete-room', deleteRoomHandler);
    };
  }, []);


  const onCreateRoom = useCallback(() => {
    const roomName = prompt('Title');
    const password = prompt('password');
    if (!roomName) return alert('방 이름은 반드시 입력해야 합니다.');
 

    socket.emit('create-room', roomName, (response: CreateRoomResponse) => {
      if (!response.success) return alert(response.payload);


      navigate(`/room/${response.payload}`);
    });
  }, [navigate]);


  const onJoinRoom = useCallback(
    (roomName: string) => () => {
      socket.emit('join-room', roomName, () => {
        navigate(`/room/${roomName}`);
      });
    },
    [navigate]
  );


  return (
    <>
      <Head>
      <h1>Chat List</h1>
        <button onClick={onCreateRoom}>+Create</button>
      </Head>


      <Table>
        <thead>
          <tr>
            <th>num</th>
            <th>Title</th>
            
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={room}>
              <td>{index + 1}</td>
              <td>{room}</td>
              <td>
                <button onClick={onJoinRoom(room)}>입장하기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};


export default WaitingRoom;
