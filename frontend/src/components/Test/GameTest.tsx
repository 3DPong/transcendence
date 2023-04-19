/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 14:33:43 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/31 18:01:01 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Renderer3D } from "@/components/Organism/Game/Renderer/Renderer";
import * as gameType from "@/types/game";

export function GameTest() {

  const playerData: gameType.PlayerData = {
    myNickName: "Left",
    myImage: "",
    enemyNickName: "Right",
    enemyImage: "",
  }

  return (
      <div className=" absolute -z-50 w-0 h-0">
        <Renderer3D playerData={playerData} width={window.innerWidth} height={window.innerHeight} />
      </div>
  );
}
