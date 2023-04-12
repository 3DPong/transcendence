/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useSignal.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/19 22:09:49 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/19 22:12:44 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState } from 'react';

export type SignalStatePair = [boolean, () => void];

export default function useSignal(): SignalStatePair {
  const [signal, setSignal] = useState<boolean>(false);
  function toogleSignal() {
    setSignal(!signal);
  }
  return [signal, toogleSignal];
}
