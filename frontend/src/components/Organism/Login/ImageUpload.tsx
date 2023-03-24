import { PhotoCamera } from "@mui/icons-material";
import { Avatar, Box, IconButton } from "@mui/material";
import { FC } from "react";

interface ImageUploadProps {
  thumbnail : string;
  setThumbnail : (path: string) => void;
  width? : number;
  height? : number;
}

const ImageUpload : FC<ImageUploadProps> = ({thumbnail, setThumbnail, width, height}) => {

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {

      const file = event.target.files[0];
      const { type } = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        // Validate file extension
        if (type.endsWith('jpeg') || type.endsWith('png') || type.endsWith('jpg'))
        {
          setThumbnail(e.target?.result as string);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: (width ? width : '120px'),
        height: (height ? height :'120px'),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mx: 'auto',
        mb: 2,
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
        id="image-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      <label htmlFor="image-upload">
        <IconButton
          component="span"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'background.paper',
            borderRadius: '50%',
            padding: '5px',
          }}
        >
          <PhotoCamera />
        </IconButton>
      </label>
    </Box>
  );
}

export default ImageUpload;
