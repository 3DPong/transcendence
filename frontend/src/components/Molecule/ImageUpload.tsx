import { PhotoCamera } from '@mui/icons-material';
import { Avatar, Box, IconButton } from '@mui/material';
import { FC, useEffect, useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import AvatarEditor from 'react-avatar-editor';
import CloseIcon from '@mui/icons-material/Close';

/** [ Avater editor library ]
 * --------------------------------------------------------
 * @link1  https://github.com/mosch/react-avatar-editor
 * @link2  https://github.com/react-dropzone/react-dropzone
 * @link3  https://velog.io/@mjhyp88/ReactTypscript-%ED%8C%8C%EC%9D%BC%EC%97%85%EB%A1%9C%EB%93%9C-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84With.-Springboot
 * --------------------------------------------------------
 */

const ALLOWED_FILE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_FORMAT = ['jpg', 'jpeg', 'png'];

interface ImageUploadProps {
  thumbnail: string;
  setThumbnail: (path: string) => void;
  width?: number;
  height?: number;
  // 아래 props를 추가한 이유는, 이미 설정된 프로필이 있을 때 그 데이터를 보여줌 + 이미지 Editor를 띄우지 않기 위함.
  initialThumbnail?: string; // 이 값은 처음에 세팅될 이미지. (editor open 관계없는 이미지)
}

const ImageUpload: FC<ImageUploadProps> = ({ thumbnail, setThumbnail, initialThumbnail, width, height }) => {
  const editor = useRef<AvatarEditor>(null);
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [isEditDone, setIsEditDone] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  // const [ isInputBtnClicked, setIsInputBtnClicked ]

  const handleClickSave = () => {
    if (editor.current) {
      // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
      // drawn on another canvas, or added to the DOM.
      const canvas = editor.current.getImage();
      const localFileUrl = canvas.toDataURL();
      // If you want the image resized to the canvas size (also a HTMLCanvasElement)
      // const canvasScaled = editor.current.getImageScaledToCanvas();

      setIsEditDone(true);
      // close editor
      handleEditorClose();
      setThumbnail(localFileUrl);
    }
  };

  const onWheelMove = (event: React.WheelEvent) => {
    const delta = Math.sign(event.deltaY);
    if (delta > 0) {
      setScale(scale + 0.1);
    } else {
      setScale(scale - 0.1);
    }
  };

  const isValidFormat = (file: File) => {
    return ALLOWED_FILE_FORMAT.some((format) => file.type.endsWith(format));
  };

  const isValidSize = (file: File) => {
    return file.size <= ALLOWED_FILE_MAX_SIZE;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageChange');
    if (event.target.files && event.target.files[0]) {
      setIsEditDone(false);
      const file = event.target.files[0];
      // Validate file size
      if (!isValidSize(file)) {
        alert('Image file is larger than 5MB');
        event.target.value = '';
        return;
      }
      // Validate file format
      if (!isValidFormat(file)) {
        alert('Only jpeg, jpg, png format is allowed.');
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      setOpenEditor(true); // 업로드 후 editor 열기
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const handleEditorClose = () => {
    setOpenEditor(false);
    setIsEditDone(true);
  };

  // if thumnail data set, then open modal (이미지 편집)
  /*
  useEffect(() => {
    if (thumbnail && !isEditDone) { // if editor is closed + thumnail exist (need edit)
      console.log("Open editor");
    }
  }, [thumbnail, isEditDone]);
  */

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: 250,
          height: 250,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mx: 'auto',
          mb: 2,
          maxWidth: '250px',
          maxHeight: '250px',
        }}
      >
        <Avatar
          alt="썸네일"
          src={thumbnail}
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            bgcolor: thumbnail ? 'transparent' : 'grey.300',
          }}
        />
        <input
          accept="image/*"
          // value={ thumbnail }
          // accept=".jpg, .jpeg, .png"
          id="image-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <label htmlFor="image-upload">
          <IconButton
            // onClick={}
            component="span"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'background.paper',
              borderRadius: '50%',
              padding: '5px',
              // width: "50%",
              // height: "50%"
            }}
          >
            <PhotoCamera fontSize="medium" />
          </IconButton>
        </label>
      </Box>

      {/* Image Editor */}
      <Dialog open={openEditor} onClose={handleEditorClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <DialogContentText>
            You can zoom and move with mouse. <br />
            Click 'Done' to apply change.
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          {thumbnail && (
            <div onWheel={onWheelMove}>
              {/* https://github.com/mosch/react-avatar-editor */}
              <AvatarEditor
                borderRadius={100000} // ROUND
                ref={editor}
                image={thumbnail}
                // width={}
                // height={}
                border={50} // ?
                scale={scale}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickSave}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageUpload;
