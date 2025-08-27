import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  TextField,
} from '@mui/material';
import { Form, Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { submitAnnotation } from '../../actions/add-annotation.action';
import { deleteAnnotation } from '../../actions/delete-annotation.action';
import { setAnnotationDialog } from '../../slices/ui.slice';
import SubmitButton from '../fragment-properties-dialog/submit-button.component';

const AnnotationDialog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { annotationDialog } = useSelector((state: RootState) => state.ui);
  const { infoDetails } = useSelector((state: RootState) => state.selected);
  return (
    <Dialog open={!!annotationDialog} maxWidth="lg">
      <IconButton
        aria-label="close"
        onClick={() => {
          if (!infoDetails?.getProperties().annotation) {
            dispatch(deleteAnnotation(annotationDialog));
          }
          dispatch(setAnnotationDialog(null));
        }}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle sx={{ minWidth: '400px' }}>Add annotation</DialogTitle>
      <Formik
        initialValues={{
          content: infoDetails ? infoDetails.getProperties().annotation : '',
          targetId: annotationDialog || '',
        }}
        onSubmit={(values) => {
          dispatch(submitAnnotation(values.content, values.targetId));
        }}
        validationSchema={yup.object().shape({
          content: yup.string().required('Required'),
          targetId: yup.string().required(),
        })}
      >
        {(formik) => (
          <Form>
            <DialogContent>
              <FormControl
                fullWidth
                error={formik.touched.content && Boolean(formik.errors.content)}
              >
                <TextField
                  id="content"
                  name="content"
                  label="Annotation"
                  multiline
                  rows={4}
                  placeholder="Add annotation..."
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.content && Boolean(formik.errors.content)
                  }
                />
                {formik.touched.content && formik.errors.content && (
                  <FormHelperText id="content-error-text">
                    {typeof formik.errors.content === 'string'
                      ? formik.errors.content
                      : ''}
                  </FormHelperText>
                )}
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

export default AnnotationDialog;
