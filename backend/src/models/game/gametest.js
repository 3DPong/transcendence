
const socket = io('http://localhost:4242/game');
/*
const onKeyDown = (event) => {
  console.log(`key ${event.key} down`);
  switch(event.key)
  {
  case "q":
      //...
      break;
  case "a":
      //...
      break;
  case "ArrowUp":
      //...
      break;
  case "ArrowDown":
      //...
      break;
  case "Enter":
      //...
      break;
  default:
      //...
      return;
  }
}*/

const onKeyUp = (event) => {
  console.log(`key ${event.key} up`);
  switch(event.key)
  {
  case "q":
      socket.emit('test', { test: 'test'});  
      socket.emit('test', socket.id);
      break;
  case "a":
      //...
      break;
  case "ArrowUp":
      //...
      break;
  case "ArrowDown":
      //...
      break;
  case "Enter":
      //...
      break;
  case "Escape":
    socket.emit('test', { test: 'test'});  
    socket.emit('test', socket.id);
      break;
  default:
      //...
      return;
  } 
}

//window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

let root = document.querySelector(".root");

// Button A
const buttonA = document.createElement("button");
buttonA.innerHTML = "game room join";
root.appendChild(buttonA);
buttonA.addEventListener("click", (event) => {
  console.log("ButtonA Clicked!");
  socket.emit('randomMatch',{
    gameRoomType : 'RANDOM',
    gameMod : 0,
  })
  // ...
})


// Button B
const buttonB = document.createElement("button");
buttonB.innerHTML = "game room exit";
root.appendChild(buttonB);
buttonB.addEventListener("click", (event) => {
  console.log("ButtonB Clicked!");
  socket.emit('exit');
  // ...
})

// Button C
const buttonC = document.createElement("button");
buttonC.innerHTML = "Button C";
root.appendChild(buttonC);
buttonC.addEventListener("click", (event) => {
  console.log("ButtonC Clicked!");
  socket.emit('makeSimul');
  // ...
})

socket.on('gameCreate', (data)=>{
    console.log('gameCreate',data);
})
socket.on('gameStart', (data)=>{
    console.log('game is start!',data);
})
socket.on('gameExit', (data)=>{
    console.log('player is exit game!',data);
})