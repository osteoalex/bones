import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Slide } from '@mui/material';
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { DrawerBox } from './drawer.style';

type Props = {
  children: ReactNode;
  direction?: 'down' | 'left' | 'right' | 'up';
};

const Drawer: React.FC<Props> = ({ children, direction = 'right' }) => {
  const navigate = useNavigate();
  return (
    <Slide direction={direction} in={true}>
      <DrawerBox>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: 'absolute', right: 0, top: 0 }}
        >
          <CloseIcon />
        </IconButton>
        {children}
      </DrawerBox>
    </Slide>
  );
};

export default Drawer;
