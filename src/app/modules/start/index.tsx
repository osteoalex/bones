import { Box, Button, Chip } from '@mui/material';
import React, { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Outlet, useNavigate } from 'react-router';

const Start: React.FC = () => {
  const navigate = useNavigate();
  const openCollection = async () => {
    const config = await window.electron.openCollection();
    if (config) {
      navigate(`/collections/open/${config.name}`);
    }
  };
  useHotkeys('ctrl+n', () => navigate('/collections/create'));
  useHotkeys('ctrl+o', openCollection);
  useEffect(() => {
    setTimeout(() => {
      window.electron.resetCurrentlyLoadedConfig();
    }, 100);
  }, []);
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          flexDirection: 'column',
        }}
      >
        <Button onClick={() => navigate('/collections/create')}>
          Create new collection <Chip label="Ctrl" sx={{ ml: 2, mr: 2 }} />+
          <Chip sx={{ ml: 2 }} label="N" />
        </Button>
        <Button onClick={openCollection}>
          Open existing collection <Chip label="Ctrl" sx={{ ml: 2, mr: 2 }} />+
          <Chip sx={{ ml: 2 }} label="O" />
        </Button>
      </Box>
      <Outlet />
    </>
  );
};

export default Start;
