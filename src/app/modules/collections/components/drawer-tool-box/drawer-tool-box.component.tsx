import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Box, IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { CollectionConfigData } from '../../../../../types/collection-config-data.interface';
import { setDrawerOpen, setNewItemNameDialogOpen } from '../../slices/ui.slice';

const DrawerToolBox: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [config, setConfig] = useState<CollectionConfigData>(null);

  useEffect(() => {
    window.electron.getConfig().then((config) => {
      setConfig(config);
    });
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      <Tooltip title="New item">
        <IconButton
          disabled={!config?.backgrounds.length}
          onClick={() => {
            dispatch(setNewItemNameDialogOpen(true));
          }}
        >
          <NoteAddIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add background">
        <IconButton
          onClick={async () => {
            await window.electron.addNewBackground();
            const newConfig = await window.electron.getConfig();
            await window.electron.setConfig(newConfig);
            setConfig(newConfig);
          }}
        >
          <AddPhotoAlternateIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit collection details">
        <IconButton onClick={() => navigate(`/collections/${config.name}`)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export collection">
        <IconButton
          onClick={async () => await window.electron.exportCollection()}
        >
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Hide menu">
        <IconButton
          onClick={() => {
            dispatch(setDrawerOpen(false));
          }}
        >
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DrawerToolBox;
