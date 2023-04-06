/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ProfileCard.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/14 20:20:49 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/14 21:17:13 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
// import type { user_t } from '@/types/user';
import "react-lazy-load-image-component/src/effects/blur.css";
import * as API from "@/api/API";
import React from "react";

interface profileProps {
  userData?: API.GET_UserDataResponseFormat;
}

/**
 *  주의사항! 모든 사진은 1:1 비율되어야 한다.
 */
const ProfileMedia = React.memo(({ userData }: profileProps) => {
  return (
    <div className=" max-w-full h-72 p-5">
      {userData ? (
        <LazyLoadImage
          src={userData.profile_url}
          alt={userData.nickname}
          placeholderSrc={userData.profile_url}
          effect="blur"
        />
      ) : (
        <Skeleton variant="rectangular" animation="wave" width="100%" height="100%" />
      )}
    </div>
  );
});

function ProfileInfo({ userData }: profileProps) {
  return (
    <div className=" max-w-full h-14 pl-5">
      {userData ? (
        <Typography display="block" variant="h5" color="text.primary">
          {userData.nickname}
        </Typography>
      ) : (
        <Box sx={{ pt: 0.5 }}>
          <Skeleton width="60%" />
        </Box>
      )}
    </div>
  );
}

export default function ProfileCard({ userData }: profileProps) {
  return (
    <div className=" bg-slate-100">
      <ProfileMedia userData={userData} />
      <ProfileInfo userData={userData} />
    </div>
  );
}
