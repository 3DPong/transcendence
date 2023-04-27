/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SettingDialog.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/25 19:36:43 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/31 17:52:22 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useContext, useEffect, useState, useMemo } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { MuiOtpInput } from 'mui-one-time-password-input'
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { LoadingButton } from '@mui/lab';
import CardMedia from '@mui/material/CardMedia';
import { alpha, styled, SxProps } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

import ImageUpload from '@/components/Molecule/ImageUpload';
import * as Utils from '@/utils/Validator';
import * as API from '@/api/API';
import GlobalContext from '@/context/GlobalContext';
import { Container, Stack } from '@mui/material';
import { Typography } from '@mui/material';
import { useAlert } from '@/context/AlertContext';
import {useNavigate} from "react-router";

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
  fontSize?: number; // font size of input text
  labelSize?: number; // font size of input label
  type?: string; // text or password... etc
  label?: string; // 이건 입력은 아니고, 단순 표시용 제목 (필드 제목)
  placeholder?: string; // 미입력시 기본으로 입력되는 내용 (초기값)
  disabled?: boolean; // Search 버튼 활성화 여부
  disabledHelperText?: string; // 오류시 표기할 내용.
  sx?: SxProps;
}

function TextFieldWrapper(props: TextFieldWrapperProps) {
  {
    /* https://mui.com/material-ui/react-text-field/ */
  }
  return (
      <TextField
          sx={props.sx}
          value={props.value}
          id="standard-basic"
          variant="standard"
          type={props.type}
          label={props.label}
          onChange={(event) => {
            props.onChange(event.target.value);
          }}
          inputProps={{ style: { fontSize: props.fontSize } }} // font size of input text
          InputLabelProps={{ style: { fontSize: props.labelSize } }} // font size of input label
          placeholder={props.placeholder}
          error={props.disabled}
          helperText={props.disabled ? props.disabledHelperText : ''} // 에러일 때만 표시
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


export default function SettingDialog() {

  const [openSetting, setOpenSetting] = useState<boolean>(true);

  const { setLoggedUserId } = useContext(GlobalContext);
  const { handleAlert } = useAlert();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [nickname, setNickname] = useState<string>('');
  const [isNicknameOk, setIsNicknameOk] = useState<boolean>(false);
  const [originalNickname, setOriginalNickname] = useState<string>('');

  const [imageFile, setImageFile] = useState<string>('');
  const [isImageChanged, setIsImageChanged] = useState<boolean>(false);

  const [disableSaveButton, setDisableSaveButton] = useState<boolean>(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);

  // 첫 렌더시 서버에서 기존 사용자 데이터를 받아오는 과정
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      console.log('[DEV] 사용자의 세팅을 불러오는 중입니다.');
      // TODO: 아래 코드는 테스트 코드이며, SessionStorage 부분은 지워야 한다.
      const loadedSettings = await API.getMySettings(handleAlert, navigate);
      if (loadedSettings) {
        setLoggedUserId(loadedSettings.user_id);
        setImageFile(loadedSettings.profile_url);
        setNickname(loadedSettings.nickname);
        setOriginalNickname(loadedSettings.nickname);
        setTwoFactorAuth(loadedSettings.two_factor);
        setIsLoading(false);
      }
    })(/* IIFE */)
  }, []);

  // Nickname Change handle
  // ---------------------------------------------------------------------
  const _validator = useMemo(() => {
    console.log('setting validator...');
    return new Utils.Validator();
  }, []); // calculate only on first render.

  useEffect(() => {
    if (!nickname) return;
    if (_validator.isAcceptable('@Nickname', nickname)) {
      setIsNicknameOk(true);
      if (isImageChanged || (originalNickname !== nickname)) {
        setDisableSaveButton(false)
      } else {
        setDisableSaveButton(true);
      }
    } else {
      setIsNicknameOk(false);
      setDisableSaveButton(true);
    }
  }, [nickname]);
  // ---------------------------------------------------------------------

  useEffect(() => {
    if (!isImageChanged) return;
    if (isNicknameOk) {
      setDisableSaveButton(false);
    }
  }, [isImageChanged]);

  // Profile Change Submit Button Handle
  // ---------------------------------------------------------------------
  const handleClickSave = () => {
    (async () => {
      // 1. 서버에 변경 요청
      setIsLoading(true);
      // 만약 이미지가 변경되지 않았다면, 굳이 이미지는 제출하지 말기
      let response;
      if (isImageChanged && (originalNickname === nickname)) { // 이미지는 바뀌었으나 닉네임은 그대로인 경우
        console.log('이미지만 바뀌었습니다.');
        response = await API.updateUserData(handleAlert, null, imageFile);
      } else if (!isImageChanged && (originalNickname !== nickname)) { // 이미지는 안바뀌고 닉네님이 바뀐 경우
        console.log(originalNickname, nickname);
        console.log('닉네임만 바뀌었습니다.');
        response = await API.updateUserData(handleAlert, nickname, null);
      } else if (isImageChanged && (originalNickname !== nickname)) { // 둘 다 바뀐 경우
        console.log('이미지와 닉네임이 모두 바뀌었습니다.');
        response = await API.updateUserData(handleAlert, nickname, imageFile);
      }

      if (response) {
        setLoggedUserId(response.user_id);
        handleAlert("Change Profile", "설정 변경이 완료되었습니다", null, 'success');
      }
      setIsLoading(false);
      handleSettingDialogClose();
    })(/* IIFE */);
  };


  // ---------------------------------
  // 2FactorAuth 확인용 모달.
  // ----------------------------------
  const [authWarningDialogOpen, setAuthWarningDialogOpen] = useState(false);

  // 취소 버튼을 누른 경우 // 혹은 그냥 닫기만 한 경우
  const handleAuthWarningDialogClose = (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason && reason === 'backdropClick') return; // 외곽 영역 클릭시 꺼지지 않도록 설정.
    setTwoFactorAuth((prevState) => !prevState); // 다시 취소.
    setAuthWarningDialogOpen(false);
  };

  // Auth 변경 버튼을 누른 경우
  const handleAgree = () => {
    setAuthWarningDialogOpen(false);
    setAuthDialogOpen(true);
  }

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFactorAuth(event.target.checked); // 체크 반영.
    setAuthWarningDialogOpen(true);
  };

  // ---------------------------------
  // 2FactorAuth 실제 설정 모달.
  // ---------------------------------
  const [ qrCodeUrl, setQrCodeUrl ] = useState<string>('');
  const [ token, setToken ] = useState<string>('');
  const [ authDialogOpen, setAuthDialogOpen ] = useState(false);

  const handleAuthDialogClose = (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason && reason === 'backdropClick') return; // 외곽 영역 클릭시 꺼지지 않도록 설정.
    setAuthDialogOpen(false);
  };

  useEffect(() => {
    if (!authDialogOpen) return;
    if (!twoFactorAuth) return; // 2차 인증 비활성화일 경우는 qr코드가 필요 없음.
    // load qr code here
    (async () => {
      const qrCodeUrlFromServer = await API.getQrCodeBefore2FaActivation(handleAlert);
      if (qrCodeUrlFromServer) {
        setQrCodeUrl(qrCodeUrlFromServer);
        console.log("[DEV] QR코드 이미지를 서버로부터 전달받았습니다.");
      }
    })(/* IIFE */);
  }, [authDialogOpen]);

  const handleTokenSubmit = () => {
    (async () => {
      // 1. 서버에 토큰 전송
      let response: Response | undefined;
      if (twoFactorAuth) { // if off --> on
        console.log(`[DEV] Trying 2FA Auth On... | token:[${token}]`);
        response = await API.activate2FA_SubmitOtpTokenToServer(handleAlert, token);
      } else { // if on --> off
        console.log(`[DEV] Trying 2FA Auth Off... | token:[${token}]`);
        response = await API.deactivate2FA_SubmitOtpTokenToServer(handleAlert, token);
      }
      if (response) {
        console.log('[DEV] 2FA Auth Setting Change Success!');
        console.log('[DEV] SignOut...'); // 서버에서 로그아웃 처리
        navigate('/signin'); // 로그아웃되었으니 로그인페이지로 이동.
      } else {  // error
        handleAuthDialogClose(); // close Dialog
        setToken(""); // 초기화.
        setTwoFactorAuth((prevState) => !prevState);
      }
    })(/* IIFE */);
  };

  const handleTokenChange = (newVal: string) => {
    setToken(newVal);
  }

  // Log-out
  // ---------------------------------------------------------------------
  const handleLogout = async () => {
    setOpenSetting(false); // close dialog
    const res = await API.requestLogOut(handleAlert);
    if (res) {
      navigate('/signin');
    }
  };

  // Dialog close
  // ---------------------------------------------------------------------
  const handleSettingDialogClose = () => {
    // if (reason && reason === 'backdropClick') return; // 외곽 영역 클릭시 꺼지지 않도록 설정.
    setOpenSetting(false); // close dialog
    navigate('/');
  };

  return (
      // https://mui.com/material-ui/api/container/
      <Container maxWidth="lg">
        <Dialog open={openSetting} onClose={handleSettingDialogClose}>
          {/* 제목 */}
          <DialogTitle>Settings</DialogTitle>
          {/* X 버튼 */}
          <IconButton
              sx={{ position: 'absolute', right: 0, paddingRight: '24px', paddingTop: '16px' }}
              onClick={handleSettingDialogClose}
          >
            <CloseIcon fontSize="medium" />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            {/* 프로필 변경 */}
            <Card sx={{ display: 'flex', flexDirection: 'column', padding: 2 }}>
              {/*<DialogContent sx={{ paddingBottom: 2 }}>*/}
              <DialogContent>
                {/* 이미지 변경 */}
                <ImageUpload thumbnail={imageFile} setThumbnail={setImageFile} setIsImageChanged={setIsImageChanged} />
                {/* 이름 변경 */}
                <TextFieldWrapper
                    sx={{ maxWidth: '300px' }}
                    fontSize={24}
                    value={nickname}
                    onChange={setNickname}
                    type={'text'}
                    label={'Nickname'}
                    labelSize={18}
                    disabled={!isNicknameOk}
                    disabledHelperText={_validator.getRuleHint('@Nickname')}
                />
              </DialogContent>
              {/*<DialogContent sx={{ paddingBottom: 4, display: 'flex', justifyContent: 'space-between' }}>*/}
              <DialogContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* 설정 저장 버튼 */}
                <LoadingButton
                    color="info"
                    variant="outlined"
                    loading={isLoading}
                    disabled={disableSaveButton}
                    onClick={handleClickSave}
                >
                  Save Profile
                </LoadingButton>
              </DialogContent>
            </Card>

            <Card sx={{ display: 'flex', flexDirection: 'column', padding: 2 }}>
              {/* 2차 인증 */}
              {/*<DialogContent sx={{ paddingBottom: 2 }}>*/}
              <DialogContent>
                <DialogContentText>2-Factor Auth</DialogContentText>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>Off</Typography>
                  <CustomSwitch {...label} checked={twoFactorAuth} onChange={handleSwitchChange} />
                  <Typography>On</Typography>
                </Stack>
              </DialogContent>
              {/* 로그아웃 버튼 */}
              <DialogContent>
              <Button color="error" variant="contained" onClick={handleLogout} endIcon={<LogoutIcon />}>
                Logout
              </Button>
              </DialogContent>
            </Card>
          </Box>
        </Dialog>


        {/* 2차 인증 활성화/비활성화 확인용 모달. */}
        <Dialog
            open={authWarningDialogOpen}
            onClose={handleAuthWarningDialogClose}
            aria-labelledby="2FactorAuth Warning"
            aria-describedby="2FactorAuth Warning"
        >
          <DialogTitle id="2FactorAuth">
            { twoFactorAuth ? "2차 인증을 활성화하시겠습니까?" : "2차 인증을 비활성화하시겠습니까?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              { twoFactorAuth ? (
                  "활성화시, 앞으로의 로그인은 모바일을 통한 Google Auth 인증과정을 거칩니다\n" +
                  "또한, 2차 인증을 활성화하면 자동으로 로그아웃됩니다."
              ) : (
                  "2차 인증을 비활성화하면 자동으로 로그아웃됩니다."
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAuthWarningDialogClose}>아니요, 원치 않습니다.</Button>
            <Button onClick={handleAgree} autoFocus>
              { twoFactorAuth ? "네 활성화 하겠습니다." : "네 비활성화하겠습니다."}
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR코드 및 2차인증 활성화/비활성화 모달 */}
        <Dialog open={authDialogOpen} onClose={handleAuthDialogClose}>
          <DialogTitle>{ twoFactorAuth ? "2FA Activation" : "2FA Deactivation" }</DialogTitle>
          <DialogContent>
            <DialogContentText>
              아래 구글 2차 인증 앱으로 QR코드를 스캔한 후
              화면에 보이는 6자리 OTP코드를 입력해주세요.
            </DialogContentText>
            {/* 만약 off -> on 일 경우, QR 이미지를 보여주기 */}
            <Card sx={{ display: 'flex', padding: 2 }}>
              { authDialogOpen && twoFactorAuth && // if off --> on
                  <CardMedia
                      component="img"
                      sx={{ width: 150, height: 150, textAlign: 'center', mr: 1 }}
                      image={ qrCodeUrl }
                      title="2FA QrCode"
                  />
              }
              {/* OTP 입력창 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <MuiOtpInput length={6} value={token} onChange={handleTokenChange} />
                <Button variant="outlined" size="medium" onClick={handleTokenSubmit}>Submit</Button>
              </Box>
            </Card>
          </DialogContent>
        </Dialog>
      </Container>
  );
}
