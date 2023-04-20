import {Socket} from "socket.io-client";
import * as gameType from '@/types/game';


export function attachGameEventToCanvas(
    canvas: HTMLCanvasElement,
    gameSocket: Socket,
    gameId: string,
    playerLocation: gameType.PlayerLocation,
) {

  let isMoveKeyDown = false;
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



  const onMoveKeyDown = (event: KeyboardEvent) => {
    let inputData: gameType.inputData;
    if (isMoveKeyDown) return;

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

    switch (event.key) {
      case 'ArrowLeft': // Move Left
        inputData = {gameId: gameId, key: movePaddleLeft};
        gameSocket.emit('keyInput', inputData);
        console.log("[Dev] : Move Left");
        isMoveKeyDown = true;
        break;
      case 'ArrowRight': // Move Right
        inputData = {gameId: gameId, key: movePaddleRight};
        gameSocket.emit('keyInput', inputData);
        console.log("[Dev] : Move Right");
        isMoveKeyDown = true;
        break;
      default: // no handling
        return;
    }
  }

  const onMoveKeyUp = (event: KeyboardEvent) => {

    let inputData: gameType.inputData;
    let movePaddleLeft, movePaddleRight;

    if (playerLocation === gameType.PlayerLocation.LEFT) {
      // Left Player
      // 왼쪽 플레이어에게 왼쪽 움직임은 위로 움직이는것과 동일.
      movePaddleLeft = gameType.inputEnum.UP_END;
      movePaddleRight = gameType.inputEnum.DOWN_END;
    } else {
      // Right Player
      movePaddleLeft = gameType.inputEnum.DOWN_END;
      movePaddleRight = gameType.inputEnum.UP_END;
    }

    switch (event.key) {
      case 'ArrowLeft': // Move Left
        inputData = {gameId: gameId, key: movePaddleLeft};
        gameSocket.emit('keyInput', inputData);
        console.log("[Dev] : Move Left Stop");
        isMoveKeyDown = false;
        break;
      case 'ArrowRight': // Move Right
        inputData = {gameId: gameId, key: movePaddleRight};
        gameSocket.emit('keyInput', inputData);
        console.log("[Dev] : Move Right Stop");
        isMoveKeyDown = false;
        break;
      default: // no handling
        return;
    }
  }
  canvas.addEventListener('keydown', onMoveKeyDown, false);
  canvas.addEventListener('keydown', onSkillKeyDown, false);
  canvas.addEventListener('keyup', onMoveKeyUp, false);
  canvas.addEventListener('keyup', onSkillKeyUp, false);
}

