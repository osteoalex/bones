import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { CollectionConfigData } from '../../../../../types/collection-config-data.interface';
import Drawer from '../../../common/drawer/drawer.component';
import CollectionForm from '../form/collection-form.component';

const EditCollectionDetails: React.FC = () => {
  const [initialValues, setInitialValues] = useState<CollectionConfigData>({
    name: '',
    description: '',
    backgrounds: [],
    items: [],
    showHints: true,
  });
  useEffect(() => {
    const fetchData = async () => {
      const res = await window.electron.readCollection();
      setInitialValues(res);
    };
    fetchData().catch((error) => {
      window.electron.logError?.('Error fetching collection details', error);
      console.error(error);
    });
  }, []);
  return (
    <Drawer>
      <Typography variant="h3">Update collection details</Typography>
      <CollectionForm
        initialValues={initialValues}
        onSubmit={async (val, helpers) => {
          const res = await window.electron.updateCollectionDetails(val);
          setInitialValues(res);
          helpers.resetForm();
          helpers.setSubmitting(false);
        }}
      />
    </Drawer>
  );
};

export default EditCollectionDetails;
