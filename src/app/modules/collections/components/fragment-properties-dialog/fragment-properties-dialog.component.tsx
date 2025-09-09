import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../../store';
import { setShowPropsDialog } from '../../slices/ui.slice';
import FragmentPropertiesForm from './fragment-properties-form.component';
import FragmentPropertiesTable from './fragment-properties-table.component';

const FragmentPropertiesDialog: React.FC = () => {
  const dispatch = useDispatch();
  const { layersData, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );
  const infoDetailsArr = useSelector(
    (state: RootState) => state.selected.infoDetails,
  );
  const showPropsDialog = useSelector(
    (state: RootState) => state.ui.showPropsDialog,
  );

  if (!layersData || !layersData[activeLayerIdx] || !infoDetailsArr?.length) {
    return null;
  }

  return (
    <Dialog open={showPropsDialog} maxWidth="lg">
      <IconButton
        aria-label="close"
        onClick={() => {
          dispatch(setShowPropsDialog(false));
        }}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle>
        {infoDetailsArr.length === 1
          ? 'Fragment properties'
          : 'Fragments properties'}
      </DialogTitle>
      <DialogContent>
        {infoDetailsArr.length === 1 ? (
          <FragmentPropertiesForm />
        ) : (
          <FragmentPropertiesTable />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FragmentPropertiesDialog;
