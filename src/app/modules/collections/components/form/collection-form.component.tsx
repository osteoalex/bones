import { Box, Button, TextField } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import * as yup from 'yup';

import { CollectionConfigData } from '../../../../../types/collection-config-data.interface';

type Props = {
  initialValues: CollectionConfigData;
  onSubmit: (
    values: CollectionConfigData,
    helpers: FormikHelpers<CollectionConfigData>,
  ) => void;
};

const CollectionForm: React.FC<Props> = ({ initialValues, onSubmit }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnMount={true}
      enableReinitialize={true}
      validationSchema={yup.object({
        name: yup.string().required('Required!'),
        description: yup.string(),
      })}
    >
      {(formik) => (
        <Form>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            margin="normal"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={
              formik.touched.name && Boolean(formik.errors.name)
                ? formik.errors.name
                : ''
            }
          />
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            margin="normal"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={
              formik.touched.description && Boolean(formik.errors.description)
                ? formik.errors.description
                : ''
            }
          />

          <Box
            sx={{
              position: 'sticky',
              zIndex: 1,
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '10px',
              background: 'white',
              borderTop: 'solid 1px #ccc',
            }}
          >
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              variant="contained"
            >
              Save
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default CollectionForm;
