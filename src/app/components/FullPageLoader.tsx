import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store';

const FullPageLoader: React.FC = () => {
  const loading = useSelector((state: RootState) => state.ui.loading);
  return loading ? (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 2000,
      }}
    >
      <CircularProgress size={64} thickness={5} />
    </Box>
  ) : null;
};

export default FullPageLoader;
