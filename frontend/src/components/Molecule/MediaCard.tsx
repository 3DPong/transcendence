/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MediaCard.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/12 22:55:53 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 20:30:16 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

// https://mui-treasury.com/components/card/




export interface mediaCardProps {
  imageUrl: string,
  title?: string,
  body?: string,
}

export default function MediaCard(props: mediaCardProps) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <Box className=" relative">

        <CardMedia
          sx={{ height: 200 }}
          image={ props.imageUrl }
          title={ props.title }
        />

        { props.title && // add gradient only if title exist.
          <CardContent className=' absolute bottom-0 w-full' style={{ background: "linear-gradient(to top, #111111, rgba(0,0,0,0))", /*paddingBottom: 16*/}}>
                <Typography gutterBottom variant="h5" component="div"
                            color="common.white" margin={0}>
                    {props.title}
                </Typography>

                <Typography variant="body2" color="#bfbfbf">
                    {props.body}
                </Typography>

          </CardContent>
        }

      </Box>
    </Card>
  );
}