import CloseIcon from '@mui/icons-material/Close';
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
} from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { combineLayers } from '../../actions/combine-layers.action';
import { setCombineLayersDialogOpen } from '../../slices/ui.slice';
import SubmitButton from '../fragment-properties-dialog/submit-button.component';

const CombineLayersDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const combineLayersDialogOpen = useSelector(
    (state: RootState) => state.ui.combineLayersDialogOpen,
  );
  const layersData = useSelector((state: RootState) => state.layers.layersData);
  return (
    <Dialog open={combineLayersDialogOpen} maxWidth="lg">
      <IconButton
        aria-label="close"
        onClick={() => {
          dispatch(setCombineLayersDialogOpen(false));
        }}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle sx={{ minWidth: '400px' }}>Combine layers</DialogTitle>
      <Formik
        initialValues={{ layers: [] }}
        onSubmit={(values) => {
          dispatch(combineLayers(values.layers));
        }}
        validationSchema={yup.object().shape({
          layers: yup.array(),
        })}
      >
        {(formik) => (
          <Form>
            <DialogContent>
              <FormGroup>
                {layersData.map((layer) => (
                  <FormControlLabel
                    key={layer.name}
                    value={layer.name}
                    control={
                      <Checkbox
                        checked={formik.values.layers.includes(layer.name)}
                      />
                    }
                    label={layer.name}
                    name="layers"
                    onChange={formik.handleChange}
                  />
                ))}
              </FormGroup>
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

export default CombineLayersDialog;
