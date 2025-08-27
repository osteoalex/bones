import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import JoinFullIcon from '@mui/icons-material/JoinFull';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { changeLayer } from '../../actions/change-layer.action';
import { deleteLayer } from '../../actions/delete-layer.action';
import { toggleLayerVisibility } from '../../actions/layer-visiblity.action';
import { setEditedLayer, setLayerDetails } from '../../slices/editor.slice';
import {
  setCombineLayersDialogOpen,
  setNewLayerPopupVisible,
} from '../../slices/ui.slice';
import { ListBox } from '../collection-home/collection-home.styles';

const LayersList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const layers = useSelector((state: RootState) => state.layers.layersData);
  const currentLayerIdx = useSelector(
    (state: RootState) => state.layers.activeLayerIdx,
  );

  return (
    <ListBox>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Combine layers">
          <IconButton
            disabled={layers.length < 2}
            onClick={() => {
              dispatch(setCombineLayersDialogOpen(true));
            }}
          >
            <JoinFullIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add new layer">
          <IconButton
            disabled={!layers.length}
            onClick={() => {
              dispatch(setNewLayerPopupVisible(true));
            }}
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <List>
        {layers.map((value, i) => (
          <ListItem
            key={i}
            disablePadding
            sx={{
              background: i === currentLayerIdx ? '#ebebeb' : '#fff',
            }}
            onClick={() => {
              dispatch(changeLayer(i));
            }}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  onClick={() => {
                    dispatch(toggleLayerVisibility(i, !value.visible));
                  }}
                >
                  {value.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => {
                    dispatch(setLayerDetails(i));
                  }}
                >
                  <InfoIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => {
                    dispatch(setEditedLayer(i));
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  disabled={layers.length === 1}
                  onClick={() => {
                    dispatch(deleteLayer(i));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemButton>
              <ListItemText primary={value.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </ListBox>
  );
};

export default LayersList;
