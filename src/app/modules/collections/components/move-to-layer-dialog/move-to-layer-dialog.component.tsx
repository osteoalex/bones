import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { moveToLayer } from '../../actions/move-to-layer.action';
import { setMoveToLayerDialogOpen } from '../../slices/ui.slice';
import SubmitButton from '../fragment-properties-dialog/submit-button.component';

const MoveToLayerDialog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const moveToLayerDialogOpen = useSelector(
    (state: RootState) => state.ui.moveToLayerDialogOpen,
  );
  const { layersData, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );
  return (
    <Dialog open={moveToLayerDialogOpen} maxWidth="lg">
      <IconButton
        aria-label="close"
        onClick={() => {
          dispatch(setMoveToLayerDialogOpen(false));
        }}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle sx={{ minWidth: '400px' }}>Move to other layer</DialogTitle>
      <Formik
        initialValues={{ targetLayer: '' }}
        onSubmit={(values) => {
          dispatch(moveToLayer(values.targetLayer));
        }}
        validationSchema={yup
          .object()
          .shape({ targetLayer: yup.string().required('Required') })}
      >
        {(formik) => (
          <Form>
            <DialogContent>
              <FormControl fullWidth>
                <InputLabel id="targetLayer-label" htmlFor="targetLayer">
                  Target Layer
                </InputLabel>
                <Select
                  id="targetLayer"
                  name="targetLayer"
                  value={formik.values.targetLayer}
                  label="Target Layer"
                  placeholder="Select target layer"
                  onChange={formik.handleChange}
                >
                  {layersData
                    .filter((_layer, i) => i !== activeLayerIdx)
                    .map((layer) => (
                      <MenuItem key={layer.name} value={layer.name}>
                        {layer.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <SubmitButton />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default MoveToLayerDialog;
