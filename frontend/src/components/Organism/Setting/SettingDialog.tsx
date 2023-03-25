/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Setting.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/25 19:36:43 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/25 19:36:43 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useContext, useEffect, useState, useRef, useMemo, useLayoutEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';
import { LoadingButton } from "@mui/lab";

import { alpha, styled } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';

import ImageUpload from "@/components/Molecule/ImageUpload";
import * as Utils from "@/utils/Validator";
import { Assert } from "@/utils/Assert";
import * as API from '@/api/API';
import GlobalContext from "@/context/GlobalContext";
import { RepeatOneSharp } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { Typography } from "@mui/material";

/**
 * 1. [ How to Re-fresh ]
 *    2단계 Auth를 설정하면, 로그인을 처음부터 다시 하도록 요청해야함. 따라서 이 경우 /login 페이지로 초기화할 것 (+ State 초기화 필요!)
 *    단 중간에 refresh 방지용 session storage가 set-up되어 있기에, 페이지 새로고침으로는 초기화가 되지 않을 것
 *    따라서, 이 부분은... userId만 초기화해주고 나머지는 유지하는 방식으로 해야 함...
 *
 *    아니지. 그냥 page refresh를 하고, 세션스토리지에 저장되는 애는 user_id 밖에 없기 때문에,
 *    이것만 상태 지우고 강제 refresh(window.reload())하면 된다.
 */

// https://mui.com/material-ui/react-dialog/

// 프로필 설정, 2단계 auth, 로그아웃하기

export interface TextFieldWrapperProps {
  value: string;
  onChange: (arg: string) => void;
  type?: string; // text or password... etc
  label?: string; // 이건 입력은 아니고, 단순 표시용 제목 (필드 제목)
  placeholder?: string; // 미입력시 기본으로 입력되는 내용 (초기값)
  disabled?: boolean; // Search 버튼 활성화 여부
  disabledHelperText?: string; // 오류시 표기할 내용.
}


function TextFieldWrapper(props: TextFieldWrapperProps) {
  {/* https://mui.com/material-ui/react-text-field/ */}
  return (
      <TextField
          sx={{ flex: 1 }} // 가득 채우기
          id="standard-basic"
          variant="standard"
          type={props.type}
          label={props.label}
          onChange={(event) => {
            props.onChange(event.target.value);
          }}
          placeholder={props.placeholder}
          error={props.disabled}
          helperText={props.disabled ? props.disabledHelperText : ""} // 에러일 때만 표시
        />
  );
}


const CustomSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: pink[600],
    '&:hover': {
      backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: pink[600],
  },
}));


const label = { inputProps: { 'aria-label': 'Color switch demo' } };

interface settingDialogProps {
  open: boolean;
  setOpen: (v:boolean) => void;
}

export default function SettingDialog({open, setOpen}: settingDialogProps) {

  const WIDTH = 250;
  const HEIGHT = WIDTH;
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  // Preload. 세팅을 누르는 순간 현재 User정보를 서버로부터 load 해야 한다. (input 기본값으로 기존 데이터를 사용하기 위함)
  // ---------------------------------------------------------------------

  const [ prevUserData, setPrevUserData ] = useState<API.GET_UserDataResponseFormat>();

  const [ imageFile, setImageFile ] = useState<string>("");
  const [ isImageFileChanged, setImageFileChanged ] = useState<boolean>(false);

  const [ nickname, setNickname ] = useState<string>("");
  const [ isNicknameOk, setIsNicknameOk ] = useState<boolean>(false);

  // useLayoutEffect(() => { // layout effect를 사용한 이유 = DOM Paint 이전 단계에서 내용이 확정되야 함. 
  const { loggedUserId, setLoggedUserId } = useContext(GlobalContext);

  useEffect(() => { // layout effect를 사용한 이유 = DOM Paint 이전 단계에서 내용이 확정되야 함. 
    // 1. 페이지 첫 렌더링 전에 세션 검증하고 user_id 받아올것.
    // Assert.NonNullish(loggedUserId, "이건 테스트용 코드입니다. 추후 서버에게 받는걸로 바꿀 예정입니다.");
    // 2. 검증된 user_id를 이용해서 user_data 재요청.
    if (!loggedUserId) return;

    (async () => {
      setIsLoading(true);
      const response = await API.getUserDataById(loggedUserId);
      console.log(response.profile_url);

      setIsLoading(false);
      setPrevUserData(response);
      setImageFile(response.profile_url);
      setNickname(response.nickname);
      console.log("here");

    })(/* IIFE */);
  }, [loggedUserId]);
  // ---------------------------------------------------------------------

  const [ twoFactorAuth, setTwoFactorAuth ] = useState<boolean>(false);

  const [ settingChangeDisabled, setSettingChangeDisabled ] = useState<boolean>(false);


  // Image File Change Handle
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!prevUserData) return;
    if (imageFile !== prevUserData?.profile_url) {
      console.log("imageFile changed");
      setImageFileChanged(true);
    }
  }, [imageFile]);
  // ---------------------------------------------------------------------

 
  // Nickname Change handle
  // ---------------------------------------------------------------------
  const _validator = useMemo(() => { 
    console.log("setting validator...");
    return new Utils.Validator();
  }, []) // calculate only on first render.

  useEffect(() => {

    if (!nickname) return;
    console.log("nickname changed");
    if (_validator.isAcceptable("@Nickname", nickname)) {
      setIsNicknameOk(true);
    }
  }, [nickname]);
  // ---------------------------------------------------------------------



  // 2FactorAuto change Handle
  // ---------------------------------------------------------------------
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFactorAuth(event.target.checked);
  };
  // ---------------------------------------------------------------------


  // Submit Button Handle
  // ---------------------------------------------------------------------
  const handleClickSave = () => {
    if (settingChangeDisabled) return;
    (async () => {
      console.log("서버에 변경사항을 전달하였습니다.");
      // 1. 서버에 변경 요청
      // setIsLoading(true);
      // const response = await API.updateUserData( nickname, imageFile, twoFactorAuth );
      // setIsLoading(false);
      // 2. 만약 요청 status가 정상이 아니라면...?
          // ...??
      // 3. Success 201 : 받은 데이터로 전역 state 설정.
      // setLoggedUserId(response.user_id);
    })(/* IIFE */);
  };


  // ---------------------------------------------------------------------

  // Log-out
  const handleClickLogout = () => {};

  // Dialog cloas
  const handleClose = () => {
    setOpen(false);
  }; 

  return (
    <Dialog open={open} onClose={handleClose}>

      <DialogTitle>Settings</DialogTitle>

      {/* 프로필 변경 */}
      <DialogContent sx={{ paddingBottom: 0 }}>

        <DialogContentText>
          Change profile
        </DialogContentText>

          {/* 이미지 변경 */}
          <ImageUpload 
            thumbnail={ imageFile ? imageFile : "" } 
            setThumbnail={ setImageFile } 
            width={WIDTH} height={HEIGHT} 
          />
          {/* 이름 변경 */}
          <TextFieldWrapper
            value={ nickname ? nickname : "" }
            onChange={ setNickname }
            type={ "text" }
            label={ "nickname" }
            placeholder={ nickname ? nickname : "" }
            disabled={ !isNicknameOk }
            disabledHelperText={ _validator.getRuleHint("@Nickname") }
          /> 

      </DialogContent>

      {/* 2차 인증 */}
      <DialogContent sx={{ paddingBottom: 0 }}>
        <DialogContentText>
          2-Factor Auth
        </DialogContentText>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>Off</Typography>
            <CustomSwitch {...label} checked={twoFactorAuth} onChange={handleSwitchChange} />
          <Typography>On</Typography>
        </Stack>
      </DialogContent>

      {/* 설정 저장 버튼 */}
      <DialogActions>
        <Button disabled={settingChangeDisabled} onClick={handleClickSave}>
          Save Settings
        </Button>
      </DialogActions>


     <DialogContent sx={{ paddingBottom: 0 }}>
        <DialogContentText>
        </DialogContentText>
        {/* <DialogActions> */}

          {/* <Button onClick={handleClickLogout}>Logout</Button> */}
          <LoadingButton loading={isLoading} sx={{marginTop: 2}} variant="outlined" onClick={handleClickLogout}>
            Logout
          </LoadingButton>

        {/* </DialogActions> */}
      </DialogContent>
    </Dialog>
  );
}
