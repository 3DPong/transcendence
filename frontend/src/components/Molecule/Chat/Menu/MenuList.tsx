import { ChatUser } from "@/types/chat";
import { FC, useState } from "react";
import { ExpandLess, ExpandMore } from '@mui/icons-material/';
import { Box, Collapse, List, ListItemButton, ListItemText, ListSubheader } from "@mui/material";
import UserCard from "./UserCard";

interface MenuListProps {
  title : string;
  users : ChatUser[];
  muteList : number[];
  scrollY : number;
}

const MenuList : FC<MenuListProps> = ({title, users, scrollY, muteList}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{ width: '100%'}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="nested-list-subheader"
          sx={{ bgcolor: 'gray.200', padding: '0px' }}
        >
          <ListItemButton onClick={handleClick} sx={{ paddingTop: '4px', paddingBottom: '4px'}}>
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
              <ListItemText primary={title} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItemButton>
        </ListSubheader>
      }
    >
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ zIndex:0}}>
          {
            users.map((user)=> (
              <UserCard key={user.id} user={user} scrollY={scrollY}
                isMuted={muteList.includes(user.id)}
              />
            ))
          }
        </List>
      </Collapse>
    </List>
  );
}

export default MenuList;