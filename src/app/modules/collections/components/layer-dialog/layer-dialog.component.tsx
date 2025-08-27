import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik';
import React from 'react';
import { SketchPicker } from 'react-color';
import * as yup from 'yup';

import { Layer } from '../../../../../types/collection-config-data.interface';
import SubmitButton from '../fragment-properties-dialog/submit-button.component';

type Props = {
  showDialog: boolean;
  disabledClose: boolean;
  initialValues: Layer;
  closeHandler: () => void;
  submitHandler: (values: Layer) => void;
};

const LayerDialog: React.FC<Props> = ({
  showDialog,
  disabledClose,
  initialValues,
  closeHandler,
  submitHandler,
}) => {
  return (
    <Dialog open={showDialog} maxWidth="lg">
      <IconButton
        aria-label="close"
        disabled={disabledClose}
        onClick={closeHandler}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle>Add new layer</DialogTitle>
      <Formik<Layer>
        initialValues={initialValues}
        onSubmit={submitHandler}
        validationSchema={yup.object().shape({
          name: yup.string().required(),
          fill: yup.string().required(),
          stroke: yup.string().required(),
          strokeWidth: yup.number().required(),
          propertiesConfig: yup.array().of(
            yup.object().shape({
              name: yup.string().required(),
              defaultValue: yup.string(),
            }),
          ),
        })}
      >
        {(formik) => (
          <Form>
            <DialogContent>
              <TextField
                key="name"
                name="name"
                label="Layer name"
                type="text"
                fullWidth
                variant="standard"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={
                  formik.touched.name && Boolean(formik.errors.name)
                    ? (formik.errors.name as string)
                    : ''
                }
              />
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}
              >
                <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
                  fill:{' '}
                </Typography>
                <SketchPicker
                  color={formik.values.fill}
                  onChangeComplete={(color) =>
                    formik.setFieldValue(
                      'fill',
                      `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${
                        color.rgb.a || 1
                      })`,
                    )
                  }
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
                  stroke:{' '}
                </Typography>
                <SketchPicker
                  color={formik.values.stroke}
                  onChangeComplete={(color) =>
                    formik.setFieldValue(
                      'stroke',
                      `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${
                        color.rgb.a || 1
                      })`,
                    )
                  }
                />
              </Box>
              <TextField
                key="width"
                name="width"
                label="Stroke width"
                type="number"
                fullWidth
                variant="standard"
                inputProps={{ min: 0, step: 1 }}
                value={formik.values.strokeWidth}
                onChange={formik.handleChange}
                error={
                  formik.touched.strokeWidth &&
                  Boolean(formik.errors.strokeWidth)
                }
                helperText={
                  formik.touched.strokeWidth &&
                  Boolean(formik.errors.strokeWidth)
                    ? (formik.errors.strokeWidth as string)
                    : ''
                }
              />
              <Box sx={{ mt: 3 }}>
                <FieldArray name="propertiesConfig">
                  {(arrayHelpers: FieldArrayRenderProps) => (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InputLabel>Additional Fields</InputLabel>
                        <IconButton
                          onClick={() => {
                            arrayHelpers.push({ name: '', defaultValue: '' });
                          }}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </Box>
                      <Box>
                        {formik.values.propertiesConfig.map((field, i) => {
                          const getNameError = () => {
                            if (
                              typeof formik.touched.propertiesConfig[i] !==
                              'string'
                            ) {
                              return '';
                            }
                            return formik.touched.propertiesConfig[i].name;
                          };
                          return (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                              }}
                              key={i}
                            >
                              <TextField
                                sx={{ width: '50%' }}
                                id={`propertiesConfig[${i}].name`}
                                name={`propertiesConfig[${i}].name`}
                                label="Field name"
                                margin="normal"
                                value={formik.values.propertiesConfig[i].name}
                                onChange={formik.handleChange}
                                error={
                                  (formik.touched.propertiesConfig
                                    ? formik.touched.propertiesConfig[i]?.name
                                    : false) && Boolean(getNameError())
                                }
                                helperText={
                                  (formik.touched.propertiesConfig
                                    ? formik.touched.propertiesConfig[i]?.name
                                    : false) && Boolean(getNameError())
                                    ? getNameError()
                                    : ''
                                }
                              />
                              <TextField
                                sx={{ width: '50%' }}
                                id={`propertiesConfig[${i}].defaultValue`}
                                name={`propertiesConfig[${i}].defaultValue`}
                                label="Default value"
                                margin="normal"
                                value={
                                  formik.values.propertiesConfig[i].defaultValue
                                }
                                onChange={formik.handleChange}
                              />
                              <IconButton
                                onClick={() => arrayHelpers.remove(i)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </FieldArray>
              </Box>
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

export default LayerDialog;
