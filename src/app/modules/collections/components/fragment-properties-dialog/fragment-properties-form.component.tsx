import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'react-router-dom';

import { AppDispatch } from '../../../../../types/store.types';
import { getValidation } from '../../../../../utils';
import { RootState } from '../../../../store';
import { updateProps } from '../../actions/update-props.action';
import { setShowPropsDialog } from '../../slices/ui.slice';

const FragmentPropertiesForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { layersData, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );
  const infoDetailsArr = useSelector(
    (state: RootState) => state.selected.infoDetails,
  );
  const infoDetails = infoDetailsArr[0];

  return (
    <Formik
      initialValues={infoDetails.getProperties()}
      onSubmit={(val) => {
        dispatch(setShowPropsDialog(false));
        dispatch(updateProps([val]));
      }}
      validationSchema={getValidation(
        layersData[activeLayerIdx].propertiesConfig,
      )}
    >
      {(formik) => (
        <Form>
          <DialogContent sx={{ minWidth: '400px', position: 'relative' }}>
            {layersData[activeLayerIdx].propertiesConfig.map((field) => (
              <TextField
                sx={{ mb: 2 }}
                key={field.name}
                name={field.name}
                label={field.name}
                type="text"
                fullWidth
                variant="standard"
                value={formik.values[field.name]}
                onChange={formik.handleChange}
                error={
                  formik.touched[field.name] &&
                  Boolean(formik.errors[field.name])
                }
                helperText={
                  formik.touched[field.name] &&
                  Boolean(formik.errors[field.name])
                    ? (formik.errors[field.name] as string)
                    : ''
                }
              />
            ))}
            {layersData[activeLayerIdx].propertiesConfig.length === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography>No properties configured.</Typography>
                <Typography variant="body2" color="text.secondary">
                  You can add properties in Layer Settings.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => formik.submitForm()}
              type="submit"
              disabled={!(formik.isValid && formik.dirty)}
            >
              Save
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
};

export default FragmentPropertiesForm;
