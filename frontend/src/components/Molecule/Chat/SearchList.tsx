import { useAlert } from '@/context/AlertContext';
import { User } from '@/types/chat';
import {
  Avatar,
  Checkbox,
  ClickAwayListener,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { API_URL } from '@/../config/backend';
import { FC, useEffect, useRef, useState } from 'react';
import SearchTextField from '../SearchTextField';

interface SearchListProps {
  inviteUsers: User[];
  setInviteUsers: (user: User[]) => void;
}

const SearchList: FC<SearchListProps> = ({ inviteUsers, setInviteUsers }) => {
  const searchMin = 1;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [searchString, setSearchString] = useState('');
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false)
  const { handleAlert } = useAlert();


  function searchButtonClick() {
    if (submitDisabled) return;
    async function searchUser() {
      const response = await fetch(API_URL + '/user/search/' + searchString);
      if (!response.ok) {
        const error = await response.json();
        handleAlert('Search User', error.message);
        return;
      }
      const fetchUsers = await response.json();

      setSearchUsers(
        fetchUsers.users.map((u: any) => ({
          id: u.user_id,
          nickname: u.nickname,
          profile: u.profile_url,
        }))
      );
    }
    searchUser();
    setIsOpen(true);
  }

  function searchButtonKeyup(event: React.KeyboardEvent) {
    if (event.key === 'Enter') searchButtonClick();
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleToggle = (user: User) => () => {
    const selectedIndex = inviteUsers.findIndex((inviteUser) => inviteUser.id === user.id);
    let newInviteUsers: User[] = [];

    if (selectedIndex === -1) {
      newInviteUsers = newInviteUsers.concat(user, inviteUsers);
    } else if (selectedIndex === 0) {
      newInviteUsers = newInviteUsers.concat(inviteUsers.slice(1));
    } else if (selectedIndex === inviteUsers.length - 1) {
      newInviteUsers = newInviteUsers.concat(inviteUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newInviteUsers = newInviteUsers.concat(inviteUsers.slice(0, selectedIndex), inviteUsers.slice(selectedIndex + 1));
    }

    setInviteUsers(newInviteUsers);
  };

  useEffect(() => {
    if (searchString.length < searchMin) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  }, [searchString]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <SearchTextField
        placeholder={'초대할 유저 검색'}
        state={searchString}
        setState={setSearchString}
        onClick={searchButtonClick}
        onKeyUp={searchButtonKeyup}
        disabled={submitDisabled}
        disabledHelperText={searchMin + '글자 이상 입력하세요'}
      />
      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <List
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 1,
              width: '100%',
              border: '1px solid grey',
              backgroundColor: 'white',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
            className="scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200"
          >
            {searchUsers.map((user) => {
              const labelId = `checkbox-list-label-${user.id}`;
              const isSelected = inviteUsers.findIndex((selectedUser) => selectedUser.id === user.id) !== -1;

              return (
                <ListItemButton key={user.id} role={undefined} dense onClick={handleToggle(user)}>
                  <ListItemAvatar>
                    <Avatar
                      alt={user.nickname}
                      src={user.profile}
                      sx={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '2px solid gray',
                        margin: '0 10px',
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    id={labelId}
                    primary={user.nickname}
                    primaryTypographyProps={{
                      noWrap: true,
                      style: { overflow: 'hidden', textOverflow: 'ellipsis' },
                    }}
                  />
                  <ListItemIcon>
                    <Checkbox
                      edge="end"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                </ListItemButton>
              );
            })}
          </List>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default SearchList;
