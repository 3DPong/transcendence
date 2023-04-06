/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SearchTextField.tsx                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/11 15:41:42 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 20:30:47 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';

export interface SearchBarProps {
  state: string;
  setState: (arg: string) => void;

  onClick?: () => void; // Search Button Click 콜백
  onKeyUp?: (event: React.KeyboardEvent) => void; // enter key 처리용
  type?: string; // text or password... etc
  label?: string; // 이건 입력은 아니고, 단순 표시용 제목 (필드 제목)
  placeholder?: string; // 미입력시 기본으로 입력되는 내용 (초기값)

  disabled?: boolean; // Search 버튼 활성화 여부
  disabledHelperText?: string; // 오류시 표기할 내용.
}


// SearchTextField는 입력값을 받아서 state 업데이트 시켜주는 하위 컴포넌트.
export default function SearchTextField(props: SearchBarProps) {
    return (
      <div className=" flex">
        {/* https://mui.com/material-ui/react-text-field/ */}
        <TextField
          sx={{ flex: 1 }} // 가득 채우기
          id="standard-basic"
          variant="standard"
          type={props.type}
          label={props.label}
          onChange={(event) => {
            props.setState(event.target.value);
          }}
          onKeyUp={props.onKeyUp}
          placeholder={props.placeholder}
          error={props.disabled}
          helperText={props.disabled ? props.disabledHelperText : ""} // 에러일 때만 표시
          // required={true}
        />

        {/* onClick 콜백이 있을 경우에만 검색 버튼을 보여주기 */}
        <div className=" items-center flex">
          {props.onClick ? (
            <IconButton
              onClick={props.onClick}
              disabled={props.disabled}
              sx={{alignItems: "center", padding: 0}}
            >
              <SearchIcon />
            </IconButton>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
}