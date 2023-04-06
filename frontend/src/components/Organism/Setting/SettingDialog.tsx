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

import { useContext, useEffect, useState, useRef, useMemo, useLayoutEffect, useInsertionEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { LoadingButton } from "@mui/lab";

import { alpha, styled, SxProps } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import ImageUpload from "@/components/Molecule/ImageUpload";
import * as Utils from "@/utils/Validator";
import { Assert } from "@/utils/Assert";
import * as API from "@/api/API";
import GlobalContext from "@/context/GlobalContext";
import { RepeatOneSharp } from "@mui/icons-material";
import { Container, Stack } from "@mui/material";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useError } from "@/context/ErrorContext";

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
      helperText={props.disabled ? props.disabledHelperText : ""} // 에러일 때만 표시
    />
  );
}

const CustomSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: pink[600],
    "&:hover": {
      backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: pink[600],
  },
}));

const label = { inputProps: { "aria-label": "Color switch demo" } };

interface settingDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function SettingDialog({ open, setOpen }: settingDialogProps) {
  const { handleError } = useError();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isNicknameOk, setIsNicknameOk] = useState<boolean>(false);

  let initialTwoFactorAuth: boolean; // 기존 사용자 설정

  // 첫 렌더시 서버에서 기존 사용자 데이터를 받아오는 과정
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      console.log("[DEV] 사용자의 세팅을 불러오는 중입니다.");
      const loadedSettings = await API.getMySettings(handleError);
      if (loadedSettings) {
        console.log(loadedSettings);
        setImageFile(loadedSettings.profile_url);
        setNickname(loadedSettings.nickname);
        setTwoFactorAuth(loadedSettings.two_factor);
      }
      setIsLoading(false);
    })(/* IIFE */);
  }, []);
  // ---------------------------------------------------------------------

  // Nickname Change handle
  // ---------------------------------------------------------------------
  const _validator = useMemo(() => {
    console.log("setting validator...");
    return new Utils.Validator();
  }, []); // calculate only on first render.

  useEffect(() => {
    if (!nickname) return;
    if (_validator.isAcceptable("@Nickname", nickname)) {
      setIsNicknameOk(true);
    } else {
      setIsNicknameOk(false);
    }
  }, [nickname]);
  // ---------------------------------------------------------------------

  // 2FactorAuto change Handle
  // ---------------------------------------------------------------------
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFactorAuth(event.target.checked);
  };

  // off 에서 on이 된 경우 "로그아웃 됩니다. 정말 활성화 하시겠습니끼? 경고모달 띄우고 no하면 false로 하기"
  useEffect(() => {
    if (!twoFactorAuth) return;
    if (!initialTwoFactorAuth && twoFactorAuth) {
      console.log("2차 인증이 off 에서 on으로 변경됨.");
      alert("");
      // ... 경고 모달 활성화
    }
  }, [twoFactorAuth]);
  // ---------------------------------------------------------------------

  // Submit Button Handle
  // ---------------------------------------------------------------------
  const handleClickSave = () => {
    (async () => {
      // 1. 서버에 변경 요청
      // setIsLoading(true);
      // const response = await API.updateUserData(loggedUserId, nickname, imageFile, twoFactorAuth );
      // setIsLoading(false);

      // 2. 만약 요청 status가 정상이 아니라면, 경고 문구 날리기. (서버에서 정상적으로 처리되지 않았음. {DEV})
      // ...??

      // 3. Success 201 : 받은 데이터로 전역 state 설정.
      // setLoggedUserId(response.user_id);
      // console.log("서버에 변경사항을 전달하였습니다.");

      // 4. 2차 인증이 off였던 사용자가 on으로 켰다면, 로그아웃 시켜버리기.
      handleLogout();
      // ...
    })(/* IIFE */);
  };

  // Log-out
  // ---------------------------------------------------------------------
  const handleLogout = async () => {
    setOpen(false); // close dialog
    await API.requestLogOut(handleError);
  };

  // Dialog close
  const handleClose = () => {
    setOpen(false); // close dialog
  };

  return (
    // https://mui.com/material-ui/api/container/
    <Container maxWidth="sm">
      <Dialog open={open} onClose={handleClose}>
        {/* 제목 */}
        <DialogTitle>Settings</DialogTitle>
        {/* X 버튼 */}
        <IconButton
          sx={{ position: "absolute", right: 0, paddingRight: "24px", paddingTop: "16px" }}
          onClick={handleClose}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>

        {/* 프로필 변경 */}
        <DialogContent sx={{ paddingBottom: 2 }}>
          {/* 이미지 변경 */}
          <ImageUpload thumbnail={imageFile} setThumbnail={setImageFile} />
          {/* 이름 변경 */}
          <TextFieldWrapper
            sx={{ maxWidth: "300px" }}
            fontSize={24}
            value={nickname}
            onChange={setNickname}
            type={"text"}
            label={"Nickname"}
            labelSize={18}
            disabled={!isNicknameOk}
            disabledHelperText={_validator.getRuleHint("@Nickname")}
          />
        </DialogContent>

        <DialogContent sx={{ paddingBottom: 4, display: "flex", justifyContent: "space-between" }}>
          {/* 설정 저장 버튼 */}
          <LoadingButton
            color="info"
            variant="outlined"
            loading={isLoading}
            disabled={!isNicknameOk}
            onClick={handleClickSave}
          >
            Save Settings
          </LoadingButton>
        </DialogContent>

        {/* 2차 인증 */}
        <DialogContent sx={{ paddingBottom: 2 }}>
          <DialogContentText>2-Factor Auth</DialogContentText>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Off</Typography>
            <CustomSwitch {...label} checked={twoFactorAuth} onChange={handleSwitchChange} />
            <Typography>On</Typography>
          </Stack>
        </DialogContent>

        {/* 로그아웃 버튼 */}
        <Button color="error" variant="contained" onClick={handleLogout}>
          Logout
        </Button>
      </Dialog>
    </Container>
  );
}
