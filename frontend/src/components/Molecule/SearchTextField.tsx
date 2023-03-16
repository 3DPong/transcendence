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
import { styled, alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// import { Users } from './UserListOrganism';

export interface SearchBarProps {
  // users: Users;
  // setUsers: (arg: Users) => void;
  state: string;
  setState: (arg: string) => void;
  onClick?: () => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
  placeholder?: string
}


// SearchTextField는 입력값을 받아서 state 업데이트 시켜주는 하위 컴포넌트.
export default function SearchTextField(props: SearchBarProps) {


    return (
          <div className=" flex">
            <input
                value={props.state}
                onChange={(event) => {props.setState(event.target.value)}}
                onKeyUp={props.onKeyUp}
                placeholder={props.placeholder}
                className=" flex-1 max-w-full
                            form-control
                            px-3
                            py-1.5
                            text-base
                            font-normal
                            text-gray-700
                            bg-white bg-clip-padding
                            border border-solid border-gray-300
                            rounded
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                            "
             />

              { props.onClick ? (
                <IconButton onClick={props.onClick} >
                  <SearchIcon  />
                </IconButton>
              ) : (
                <IconButton disableFocusRipple disableRipple >
                  <SearchIcon  />
                </IconButton>
              ) }
          </div>
    );
}