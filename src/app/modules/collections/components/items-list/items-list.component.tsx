import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveIcon from '@mui/icons-material/Save';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { deleteItemAction } from '../../actions/delete-item.action';
import { renameItemAction } from '../../actions/rename-item.action';
import { setCurrentItem } from '../../slices/editor.slice';
import { ListBox } from '../collection-home/collection-home.styles';

const ItemsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector((state: RootState) => state.editor.items);
  const currentItem = useSelector(
    (state: RootState) => state.editor.currentItem,
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [clickedItem, setClickedItem] = React.useState<string>('');
  const [renamingItem, setRenamingItem] = React.useState<string>('');
  const handleClick = (event: React.MouseEvent<HTMLElement>, item: string) => {
    event.stopPropagation();
    setClickedItem(item);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setClickedItem('');
    setAnchorEl(null);
  };

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
            {renamingItem === value ? (
              <Formik
                initialValues={{ itemName: value.replace('.json', '') }}
                onSubmit={async (values) => {
                  await dispatch(
                    renameItemAction(value, `${values.itemName}.json`),
                  );
                }}
                validationSchema={Yup.object({
                  itemName: Yup.string().required('Item name is required'),
                })}
              >
                {(formik) => (
                  <Form>
                    <ListItemButton>
                      <ListItemText>
                        <TextField
                          sx={{ mr: 2 }}
                          autoFocus
                          size="small"
                          id="itemName"
                          name="itemName"
                          label="Item Name"
                          margin="dense"
                          value={formik.values.itemName}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.itemName &&
                            Boolean(formik.errors.itemName)
                          }
                          helperText={
                            formik.touched.itemName &&
                            Boolean(formik.errors.itemName)
                              ? formik.errors.itemName
                              : ''
                          }
                        />
                      </ListItemText>
                      <ListItemIcon title="Controls">
                        <CheckIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            formik.submitForm();
                            setRenamingItem('');
                          }}
                        />
                        <CloseIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingItem('');
                          }}
                        />
                      </ListItemIcon>
                    </ListItemButton>
                  </Form>
                )}
              </Formik>
            ) : (
              <ListItemButton>
                <ListItemText
                  primary={value.replace('.json', '')}
                  secondary={value === currentItem ? 'opened' : ''}
                  primaryTypographyProps={{
                    style: {
                      whiteSpace: 'normal',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    },
                  }}
                />
                <ListItemIcon
                  title="More Options"
                  onClick={(e) => handleClick(e, value)}
                >
                  <MoreVertIcon />
                </ListItemIcon>
              </ListItemButton>
            )}
          </ListItem>
        ))}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={async () => {
              if (clickedItem === currentItem) {
                await window.electron.saveItem();
              } else {
                dispatch(setCurrentItem(clickedItem));
              }
              handleClose();
            }}
          >
            {currentItem ? (
              <>
                <ListItemIcon
                  title="Save"
                  onClick={async () => await window.electron.saveItem()}
                >
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText primary="Save" />
              </>
            ) : (
              <>
                <ListItemIcon title="Open">
                  <FileOpenIcon />
                </ListItemIcon>
                <ListItemText primary="Open" />
              </>
            )}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setRenamingItem(clickedItem);
              handleClose();
            }}
          >
            <ListItemIcon title="Rename">
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Rename" />
          </MenuItem>
          <MenuItem
            onClick={async () => {
              await dispatch(deleteItemAction(clickedItem));
              handleClose();
            }}
          >
            <ListItemIcon title="Delete">
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
      </List>
    </ListBox>
  );
};

export default ItemsList;
