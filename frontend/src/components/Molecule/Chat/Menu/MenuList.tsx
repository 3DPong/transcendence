import { ChatUser } from '@/types/chat';
import { FC, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material/';
import { Box, Collapse, List, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import UserCard from './UserCard';

interface MenuListProps {
  title: string;
  titleColor: string;
  users: ChatUser[];
  scrollY: number;
}

const MenuList: FC<MenuListProps> = ({ title, titleColor, users, scrollY }) => {
  const [open, setOpen] = useState(true);
  users.sort((a, b) => {
    switch (a.role) {
      case 'owner':
        return -1;
      case 'admin':
        return b.role === 'owner' ? 1 : -1;
      case 'user':
        return 1;
      default:
        return 1;
    }
  });

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{ width: '100%' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader" sx={{ padding: '0px' }}>
          <ListItemButton
            onClick={handleClick}
            sx={{ paddingTop: '4px', paddingBottom: '4px', border: '1px solid gray' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
              <ListItemText
                primary={title}
                sx={{ backgroundColor: '' }}
                primaryTypographyProps={{ color: titleColor, fontSize: '1rem' /*, fontWeight: 'bold'*/ }}
              />
              {open ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItemButton>
        </ListSubheader>
      }
    >
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ zIndex: 0 }}>
          {users.map((user) => (
            <UserCard key={user.id} user={user} scrollY={scrollY} />
          ))}
        </List>
      </Collapse>
    </List>
  );
};

export default MenuList;
