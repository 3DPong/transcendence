/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   L0Template.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 23:12:14 by minkyeki          #+#    #+#             */
/*   Updated: 2023/05/16 15:10:11 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Outlet } from 'react-router-dom';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { useContext, useLayoutEffect } from 'react';
import GlobalContext from '@/context/GlobalContext';
import { useNavigate } from 'react-router';
import { useAlert } from '@/context/AlertContext';
import * as API from '@/api/API';

export interface templateProps {
  organism: ReactJSXElement;
}

export default function L0Template({ organism }: templateProps) {
  const {loggedUserId, setLoggedUserId} = useContext(GlobalContext);
  const navigate = useNavigate();
  const {handleAlert} = useAlert();

  useLayoutEffect(() => {
    (async () => {
      const loadedSettings = await API.getMySettings(handleAlert, navigate);
      if (loadedSettings) {
        setLoggedUserId(loadedSettings.user_id);
      }
    })(/* IIFE */)
  }, []);

  if (loggedUserId) {
    return (
      <div>
        {organism}
        < Outlet />
      </div>
    )
  } else {
    return (<div></div>);
  }
}
