const socket = io('http://localhost:3000/game');

const onKeyUp = (event) => {
  console.log(`key ${event.key} up`);
  switch (event.key) {
    case 'q':
      //socket.emit('broadcast', { test: 'test'});
      socket.emit('broadcast', socket.id);
      break;
    case 'a':
      //...
      break;
    case 'ArrowUp':
      //...
      break;
    case 'ArrowDown':
      //...
      break;
    case 'Enter':
      //...
      break;
    case 'Escape':
      socket.emit('test', { test: 'test' });
      socket.emit('test', socket.id);
      break;
    default:
      //...
      return;
  }
};

//window.addEventListener("keydown", onKeyDown);
window.addEventListener('keyup', onKeyUp);

let root = document.querySelector('.root');

// Button A
const buttonA = document.createElement('button');
buttonA.innerHTML = 'game room join';
root.appendChild(buttonA);
buttonA.addEventListener('click', (event) => {
  console.log('ButtonA Clicked!');
  socket.emit('MatchJoin', {
    gameRoomType: 1,
    gameMod: 0,
  });
  // ...
});

// Button B
const buttonB = document.createElement('button');
buttonB.innerHTML = 'game room exit';
root.appendChild(buttonB);
buttonB.addEventListener('click', (event) => {
  console.log('ButtonB Clicked!');
  socket.emit('exit');
  // ...
});

// Button C
const buttonC = document.createElement('button');
buttonC.innerHTML = 'dbTest';
root.appendChild(buttonC);
buttonC.addEventListener('click', (event) => {
  console.log('Make Match end database');
  socket.emit('dbTest');
  // ...
});

socket.on('gameCreate', (data) => {
  console.log('gameCreate', data);
});
socket.on('gameStart', (data) => {
  console.log('game is start!', data);
});
socket.on('gameExit', (data) => {
  console.log('player is exit game!', data);
});
socket.on('broadcast', (data) => {
  console.log('socket receive other data : ', data);
});
socket.on('InGameData', (data) => {
  console.log('receive InGameData', data);
});
