/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ProfileEditor.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/24 20:02:09 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/24 21:21:01 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import { useState, useRef } from "react";


/** [ Avater editor library ]
 * --------------------------------------------------------
 * @link1  https://github.com/mosch/react-avatar-editor
 * @link2  https://github.com/react-dropzone/react-dropzone
 * @link3  https://velog.io/@mjhyp88/ReactTypscript-%ED%8C%8C%EC%9D%BC%EC%97%85%EB%A1%9C%EB%93%9C-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84With.-Springboot
 * --------------------------------------------------------
 */
import { Assert } from '@/utils/Assert';


const ALLOW_FILE_EXTENSION = "jpg,jpeg,png"; // ALLOWED EXTENSION
const FILE_SIZE_MAX_LIMIT = 5 * 1024 * 1024; // 5MB

export default function ProfileEditor() {
  const [ imageFile, setImageFile ] = useState<File>();
  const editor = useRef<AvatarEditor>(null);

  const validateImageFormat = () => {
    console.log(imageFile?.name);
  }

  const onClickSave = () => {
    if (editor.current) {
      // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
      // drawn on another canvas, or added to the DOM.
      const canvas = editor.current.getImage();

      // If you want the image resized to the canvas size (also a HTMLCanvasElement)
      const canvasScaled = editor.current.getImageScaledToCanvas();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    Assert.NonNullish(fileList, "input fileList is null");
    const file = fileList.item(0);
    Assert.NonNullish(file, "input file is null");

    // change image state
    setImageFile(file);
  }

  return (
    <div>
      {imageFile && 
        <div>
          <AvatarEditor ref={editor} image={imageFile} width={250} height={250} border={50} scale={1.2} />
          <button onClick={ onClickSave }>Save</button>
        </div>
      }
      <form>
        +
        <input type='file' 
          accept='image/jpg,impge/png,image/jpeg' 
          name='profile_img' 
          onChange={ handleChange }>
        </input>
      </form>
    </div>
  );
}