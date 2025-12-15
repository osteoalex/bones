import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SaveIcon from '@mui/icons-material/Save';
import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { CollectionConfigData } from '../../../../../types/collection-config-data.interface';
import { RootState } from '../../../../store';
import {
  setDrawerOpen,
  setLoading,
  setManageBackgroundsDialogOpen,
  setNewItemNameDialogOpen,
} from '../../slices/ui.slice';

const DrawerToolBox: React.FC = () => {
  const exportMenuAnchorRef = React.useRef<HTMLButtonElement | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [config, setConfig] = useState<CollectionConfigData>(null);
  const currentItem = useSelector(
    (state: RootState) => state.editor.currentItem,
  );

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
      <Tooltip title="Save item">
        <IconButton
          disabled={!currentItem}
          onClick={async () => await window.electron.saveItem()}
        >
          <SaveIcon />
        </IconButton>
      </Tooltip>
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
      <Tooltip title="Manage backgrounds">
        <IconButton
          onClick={async () => {
            dispatch(setManageBackgroundsDialogOpen(true));
          }}
        >
          <AutoAwesomeMotionIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit collection details">
        <IconButton onClick={() => navigate(`/collections/${config.name}`)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export collection">
        <IconButton
          ref={exportMenuAnchorRef}
          onClick={() => setExportMenuOpen(!exportMenuOpen)}
          tabIndex={-1}
        >
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={exportMenuAnchorRef.current}
        open={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
      >
        <MenuItem
          onClick={async () => {
            dispatch(setLoading(true));
            await window.electron.exportCollection();
            dispatch(setLoading(false));
            setExportMenuOpen(false);
          }}
        >
          Export CSV
        </MenuItem>
        <MenuItem
          onClick={async () => {
            dispatch(setLoading(true));
            await window.electron.exportCollectionAsSVG();
            dispatch(setLoading(false));
            setExportMenuOpen(false);
          }}
        >
          Export SVG
        </MenuItem>
      </Menu>
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
