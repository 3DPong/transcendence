import { User } from "@/types/chat";
import { FC, useState } from "react";
import { ExpandLess, ExpandMore, StarBorder} from '@mui/icons-material/';
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import UserCard from "./UserCard";

interface MenuListProps {
  title : string;
  users : User[];
  scrollY : number;
}

const MenuList : FC<MenuListProps> = ({title, users, scrollY}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{ width: '100%', bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader" sx={{ padding: '0px' }}>
          <ListItemButton onClick={handleClick} sx={{ paddingTop: '4px', paddingBottom: '4px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
              <ListItemText primary={title} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItemButton>
        </ListSubheader>
      }
      
    >
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {
            users.map((user)=> (
              <UserCard key={user.userId} user={user} scrollY={scrollY}/>
            ))
          }
        </List>
      </Collapse>
    </List>
  );
}

export default MenuList;