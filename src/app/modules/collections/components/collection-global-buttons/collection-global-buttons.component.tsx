import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setDrawerOpen } from '../../slices/ui.slice';

const CollectionGlobalButtons: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <>
      <Tooltip title="Menu">
        <IconButton
          sx={{ position: 'absolute', top: '10px', left: '30px', zIndex: 1 }}
          onClick={() => {
            dispatch(setDrawerOpen(true));
          }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Close collection">
        <IconButton
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1201,
          }}
          onClick={() => navigate('/')}
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default CollectionGlobalButtons;
