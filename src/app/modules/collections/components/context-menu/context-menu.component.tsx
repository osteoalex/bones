import AddCommentIcon from '@mui/icons-material/AddComment';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import QueueIcon from '@mui/icons-material/Queue';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { ListItemButton } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../../utils/enums';
import { RootState } from '../../../../store';
import { exportItemHandler } from '../../actions/export.action';
import { changeEditMode } from '../../actions/mode.action';
import { setContextMenu } from '../../slices/ui.slice';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: (dispatch: AppDispatch) => void;
  active?: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: 'Select fragment or bone',
    icon: <PanToolAltIcon fontSize="small" />,
    action: (dispatch) => dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT)),
  },
  {
    label: 'Select with rectangle',
    icon: <PhotoSizeSelectSmallIcon fontSize="small" />,
    action: (dispatch) =>
      dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT_RECTANGLE)),
  },
  {
    label: 'Draw fragments to add',
    icon: <EditIcon fontSize="small" />,
    action: (dispatch) => dispatch(changeEditMode(EDIT_MODE_TYPE.ADDITION)),
  },
  {
    label: 'Draw fragments to subtract',
    icon: <RemoveIcon fontSize="small" />,
    action: (dispatch) => dispatch(changeEditMode(EDIT_MODE_TYPE.SUBTRACTION)),
  },
  {
    label: 'Draw line to split by',
    icon: <ContentCutIcon fontSize="small" />,
    action: (dispatch) => dispatch(changeEditMode(EDIT_MODE_TYPE.SPLIT)),
  },
  {
    label: 'Select fragments to delete',
    icon: <DeleteIcon fontSize="small" />,
    action: (dispatch) => dispatch(changeEditMode(EDIT_MODE_TYPE.DELETE)),
  },
  {
    label: 'Add whole',
    icon: <QueueIcon fontSize="small" />,
    action: (dispatch) => dispatch(changeEditMode(EDIT_MODE_TYPE.ADD_WHOLE)),
  },
  {
    label: 'Save item as svg',
    icon: <SaveAltIcon fontSize="small" />,
    action: (dispatch) => dispatch(exportItemHandler()),
  },
  {
    label: 'Add annotation',
    icon: <AddCommentIcon fontSize="small" />,
    action: (dispatch) => dispatch(changeEditMode(EDIT_MODE_TYPE.ANNOTATION)),
  },
];

export const ContextMenu: React.FC = () => {
  const dispatch = useDispatch();
  const menuRef = useRef<HTMLDivElement>(null);
  const { x, y, visible } = useSelector(
    (state: RootState) => state.ui.contextMenu,
  );

  useEffect(() => {
    if (!visible) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        dispatch(setContextMenu({ x: 0, y: 0, visible: false }));
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [visible, dispatch]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        background: '#fff',
        border: '1px solid #ccc',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: 220,
        padding: 0,
      }}
    >
      <List>
        {menuItems.map((item) => {
          return (
            <ListItem
              key={item.label}
              onClick={() => {
                item.action(dispatch);
                dispatch(setContextMenu({ x: 0, y: 0, visible: false }));
              }}
              disablePadding
            >
              <ListItemButton>
                <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};
