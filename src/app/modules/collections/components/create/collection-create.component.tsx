import { Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';

import Drawer from '../../../common/drawer/drawer.component';
import CollectionForm from '../form/collection-form.component';

const CollectionCreate = () => {
  const navigate = useNavigate();
  return (
    <Drawer>
      <Typography variant="h3">Create new collection</Typography>
      <CollectionForm
        initialValues={{
          name: '',
          description: '',
          backgrounds: [],
          items: [],
          showHints: true,
        }}
        onSubmit={async (val, helpers) => {
          try {
            const res = await window.electron.createCollection(val);
            if (!res) {
              return;
            }
            helpers.resetForm();
            helpers.setSubmitting(false);
            navigate(`/collections/open/${val.name}`);
          } catch (error) {
            // ignore
          }
        }}
      />
    </Drawer>
  );
};

export default CollectionCreate;
