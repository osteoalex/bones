import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { CollectionConfigData } from '../../../../../types/collection-config-data.interface';
import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { createNewItem } from '../../actions/create-new-item.action';
import { setNewItemNameDialogOpen } from '../../slices/ui.slice';

const CreateNewItem: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [config, setConfig] = useState<CollectionConfigData>(null);

  const newItemNameDialogOpen = useSelector(
    (state: RootState) => state.ui.newItemNameDialogOpen,
  );

  useEffect(() => {
    window.electron.getConfig().then((config) => {
      setConfig(config);
    });
  }, [newItemNameDialogOpen]);

  const handleCloseNewItemNameDialog = () => {
    dispatch(setNewItemNameDialogOpen(false));
  };

  return (
    <Dialog open={newItemNameDialogOpen} onClose={handleCloseNewItemNameDialog}>
      {!!config?.backgrounds.length && (
        <Formik
          initialValues={{
            name: '',
            background: config.backgrounds[0],
          }}
          enableReinitialize={true}
          validationSchema={yup.object({
            name: yup.string().required(),
            background: yup.string().required(),
          })}
          onSubmit={async (val) => {
            await dispatch(createNewItem(val));
          }}
        >
          {(formik) => (
            <Form>
              <DialogTitle>Item name</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Insert item name or identifier.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="normal"
                  name="name"
                  label="Item name"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={
                    formik.touched.name && Boolean(formik.errors.name)
                      ? formik.errors.name
                      : ''
                  }
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    minWidth: '360px',
                  }}
                >
                  <Select
                    fullWidth
                    name="background"
                    value={formik.values.background}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.background &&
                      Boolean(formik.errors.background)
                    }
                  >
                    {config.backgrounds.map((back) => (
                      <MenuItem key={back} value={back}>
                        {back.replace(/\\$/, '').split('\\').pop()}
                      </MenuItem>
                    ))}
                  </Select>
                  <IconButton
                    type="button"
                    onClick={async () => {
                      await window.electron.addNewBackground();
                    }}
                  >
                    <AddPhotoAlternateIcon />
                  </IconButton>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseNewItemNameDialog}>Cancel</Button>
                <Button type="submit">Create</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      )}
    </Dialog>
  );
};

export default CreateNewItem;
