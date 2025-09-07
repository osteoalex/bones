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
import * as yup from 'yup';

import { ItemContent } from '../../../../../types/collection-config-data.interface';
import SubmitButton from '../fragment-properties-dialog/submit-button.component';

interface LayerSelectDialogProps {
  open: boolean;
  onClose: () => void;
  layersData: ItemContent;
  activeLayerIdx: number;
  title: string;
  onSubmit: (targetLayer: string) => void;
}

const LayerSelectDialog: React.FC<LayerSelectDialogProps> = ({
  open,
  onClose,
  layersData,
  activeLayerIdx,
  title,
  onSubmit,
}) => {
  return (
    <Dialog open={open} maxWidth="lg">
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle sx={{ minWidth: '400px' }}>{title}</DialogTitle>
      <Formik
        initialValues={{ targetLayer: '' }}
        onSubmit={(values) => {
          onSubmit(values.targetLayer);
          onClose();
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

export default LayerSelectDialog;
