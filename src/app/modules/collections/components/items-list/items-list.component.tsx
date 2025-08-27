import FileOpenIcon from '@mui/icons-material/FileOpen';
import SaveIcon from '@mui/icons-material/Save';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../../store';
import { setCurrentItem } from '../../slices/editor.slice';
import { ListBox } from '../collection-home/collection-home.styles';

const ItemsList: React.FC = () => {
  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.editor.items);
  const currentItem = useSelector(
    (state: RootState) => state.editor.currentItem,
  );

  return (
    <ListBox>
      <Typography variant="h6">Items</Typography>
      <List>
        {items.map((value) => (
          <ListItem
            key={value}
            disablePadding
            sx={{
              background: value === currentItem ? '#ebebeb' : '#fff',
            }}
            onClick={() => {
              dispatch(setCurrentItem(value));
            }}
          >
            <ListItemButton>
              <ListItemText
                primary={value}
                secondary={value === currentItem ? 'opened' : ''}
                primaryTypographyProps={{
                  style: {
                    whiteSpace: 'normal',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  },
                }}
              />
              {value !== currentItem ? (
                <ListItemIcon title="Open">
                  <FileOpenIcon />
                </ListItemIcon>
              ) : (
                <ListItemIcon
                  title="Save"
                  onClick={async () => await window.electron.saveItem()}
                >
                  <SaveIcon />
                </ListItemIcon>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </ListBox>
  );
};

export default ItemsList;
