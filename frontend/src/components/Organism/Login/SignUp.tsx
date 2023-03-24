/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SignUp.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/23 18:55:41 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/24 22:21:22 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



/** [ Avater editor library ]
 * --------------------------------------------------------
 * @link1  https://github.com/mosch/react-avatar-editor
 * @link2  https://github.com/react-dropzone/react-dropzone
 * @link3  https://velog.io/@mjhyp88/ReactTypscript-%ED%8C%8C%EC%9D%BC%EC%97%85%EB%A1%9C%EB%93%9C-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84With.-Springboot
 * --------------------------------------------------------
 */

import AvatarEditor from 'react-avatar-editor';
import ImageUpload from "./ImageUpload";
import { useState, useRef, useEffect } from "react";
import { height } from '@mui/system';
import { Box } from '@mui/material';

export function SignUp() {
  const [imageFile, setImageFile] = useState<string>("");
  const editor = useRef<AvatarEditor>(null);
  const [scale, setScale] = useState<number>(1);

  const onClickSave = () => {
    if (editor.current) {
      // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
      // drawn on another canvas, or added to the DOM.
      const canvas = editor.current.getImage();
      const url = canvas.toDataURL();
      setImageFile(url);
      // If you want the image resized to the canvas size (also a HTMLCanvasElement)
      // const canvasScaled = editor.current.getImageScaledToCanvas();
    }
  };

  const onWheelMove = (event: React.WheelEvent) => {
    const delta = Math.sign(event.deltaY);
    console.log(delta);
    if (delta > 0) {
      setScale(scale + 0.1);
    } else {
      setScale(scale - 0.1);
    }
  }

  const WIDTH = 250;
  const HEIGHT = WIDTH;


  return (
    <div>
     <Box
      sx={{
        position: 'relative',
        width: (WIDTH),
        height: (HEIGHT),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mx: 'auto',
        mb: 2,
      }}
    >
      {imageFile && (
        // <div onWheel={onWheelMove}>
        <div onWheel={onWheelMove}>
          <AvatarEditor
            borderRadius={WIDTH / 2} // ROUND
            ref={editor}
            image={imageFile}
            width={WIDTH}
            height={HEIGHT}
            border={50}
            scale={scale}
          />
          <button onClick={onClickSave}>Save</button>
        </div>
      )}
    </Box>
    <ImageUpload thumbnail={imageFile} setThumbnail={setImageFile}/>
    </div>
  );
}