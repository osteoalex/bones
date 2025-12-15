import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CollectionConfigData } from '../../../../../types/collection-config-data.interface';
import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { deleteBackgroundAction } from '../../actions/delete-background.action';
import { setManageBackgroundsDialogOpen } from '../../slices/ui.slice';

const ManageBackgroundsDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const open = useSelector(
    (state: RootState) => state.ui.manageBackgroundsDialogOpen,
  );
  const [config, setConfig] = useState<CollectionConfigData>(null);

  useEffect(() => {
    if (open) {
      window.electron.getConfig().then((c) => setConfig(c));
    }
  }, [open]);

  const handleClose = () => dispatch(setManageBackgroundsDialogOpen(false));

  return (
    <Dialog open={Boolean(open)} onClose={handleClose} fullWidth>
      <DialogTitle>Manage backgrounds</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Current backgrounds:</Typography>
        <List>
          {(config?.backgrounds || []).map((bg) => (
            <ListItem key={bg} divider>
              <ListItemText
                primary={bg.replace(/\\$/, '').split('\\').pop()}
                secondary={bg}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={async () => {
                    await dispatch(deleteBackgroundAction(bg));
                    const newConfig = await window.electron.getConfig();
                    setConfig(newConfig);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageBackgroundsDialog;
