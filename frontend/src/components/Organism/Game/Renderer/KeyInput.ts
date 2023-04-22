import {Socket} from "socket.io-client";
import * as gameType from '@/types/game';


export function attachGameEventToCanvas(
    canvas: HTMLCanvasElement,
    gameSocket: Socket,
    gameId: string,
    playerLocation: gameType.PlayerLocation,
) {

  // let isMoveKeyDown = false;
  let isMoveLeftKeyDown = false;
  let isMoveRightKeyDown = false;
  let isSkillKeyDown = false;

  if (playerLocation === gameType.PlayerLocation.LEFT) {
    console.log("[DEV] you are LEFT-PLAYER.");
  } else {
    console.log("[DEV] you are RIGHT-PLAYER.");
  }

  const onSkillKeyDown = (event: KeyboardEvent) => {
    if (isSkillKeyDown) return;
    let inputData: gameType.inputData;
    let keyType = gameType.inputEnum.SKILL;
    if (event.key === 'Shift') {
      inputData = {gameId: gameId, key: keyType};
      gameSocket.emit('keyInput', inputData);
      console.log("[Dev] : Skill Used");
      isSkillKeyDown = true;
    }
  }

  const onSkillKeyUp = (event: KeyboardEvent) => {
    console.log(event.key);
    if (event.key === 'Shift') {
      isSkillKeyDown = false;
    }
  }

  const onMoveLeftKeyDown = (event: KeyboardEvent) => {
    let inputData: gameType.inputData;
    if (isMoveLeftKeyDown) return;

    let movePaddleLeft, movePaddleRight;
    if (playerLocation === gameType.PlayerLocation.LEFT) {
      // Left Player
      movePaddleLeft = gameType.inputEnum.UP_START;
      movePaddleRight = gameType.inputEnum.DOWN_START;
    } else {
      // Right Player
      movePaddleLeft = gameType.inputEnum.DOWN_START;
      movePaddleRight = gameType.inputEnum.UP_START;
    }
    if (event.key === 'ArrowLeft') {
      if (isMoveRightKeyDown) {
        inputData = {gameId: gameId, key: movePaddleRight};
        gameSocket.emit('keyInput', inputData);
      }
      inputData = {gameId: gameId, key: movePaddleLeft};
      gameSocket.emit('keyInput', inputData);
      isMoveLeftKeyDown = true;
    }
  }

  const onMoveRightKeyDown = (event: KeyboardEvent) => {
    let inputData: gameType.inputData;
    if (isMoveRightKeyDown) return;

    let movePaddleLeft, movePaddleRight;
    if (playerLocation === gameType.PlayerLocation.LEFT) {
      // Left Player
      movePaddleLeft = gameType.inputEnum.UP_START;
      movePaddleRight = gameType.inputEnum.DOWN_START;
    } else {
      // Right Player
      movePaddleLeft = gameType.inputEnum.DOWN_START;
      movePaddleRight = gameType.inputEnum.UP_START;
    }
    if (event.key === 'ArrowRight') {
      if (isMoveLeftKeyDown) {
        inputData = {gameId: gameId, key: movePaddleLeft};
        gameSocket.emit('keyInput', inputData);
      }
      inputData = {gameId: gameId, key: movePaddleRight};
      gameSocket.emit('keyInput', inputData);
      isMoveRightKeyDown = true;
    }
  }


  const onMoveLeftKeyUp = (event: KeyboardEvent) => {
    let inputData: gameType.inputData;
    let movePaddleLeft, movePaddleRight;

    if (playerLocation === gameType.PlayerLocation.LEFT) {
      // Left Player
      // 왼쪽 플레이어에게 왼쪽 움직임은 위로 움직이는것과 동일.
      movePaddleLeft = gameType.inputEnum.UP_END;
      movePaddleRight = gameType.inputEnum.DOWN_START;
    } else {
      // Right Player
      movePaddleLeft = gameType.inputEnum.DOWN_END;
      movePaddleRight = gameType.inputEnum.UP_START;
    }
    if (event.key === 'ArrowLeft') {
      inputData = {gameId: gameId, key: movePaddleLeft};
      gameSocket.emit('keyInput', inputData);
      isMoveLeftKeyDown = false;
      if (isMoveRightKeyDown) {
        inputData = {gameId: gameId, key: movePaddleRight};
        gameSocket.emit('keyInput', inputData);
      }
    }
  }


  const onMoveRightKeyUp = (event: KeyboardEvent) => {
    let inputData: gameType.inputData;
    let movePaddleLeft, movePaddleRight;

    if (playerLocation === gameType.PlayerLocation.LEFT) {
      // Left Player
      // 왼쪽 플레이어에게 왼쪽 움직임은 위로 움직이는것과 동일.
      movePaddleLeft = gameType.inputEnum.UP_START;
      movePaddleRight = gameType.inputEnum.DOWN_END;
    } else {
      // Right Player
      movePaddleLeft = gameType.inputEnum.DOWN_START;
      movePaddleRight = gameType.inputEnum.UP_END;
    }
    if (event.key === 'ArrowRight') {
      inputData = {gameId: gameId, key: movePaddleRight};
      gameSocket.emit('keyInput', inputData);
      isMoveRightKeyDown = false;
      if (isMoveLeftKeyDown) {
        inputData = {gameId: gameId, key: movePaddleLeft};
        gameSocket.emit('keyInput', inputData);
      }
    }
  }

  canvas.addEventListener('keydown', onMoveLeftKeyDown, false);
  canvas.addEventListener('keydown', onMoveRightKeyDown, false);

  canvas.addEventListener('keyup', onMoveLeftKeyUp, false);
  canvas.addEventListener('keyup', onMoveRightKeyUp, false);

  canvas.addEventListener('keydown', onSkillKeyDown, false);
  canvas.addEventListener('keyup', onSkillKeyUp, false);
}

