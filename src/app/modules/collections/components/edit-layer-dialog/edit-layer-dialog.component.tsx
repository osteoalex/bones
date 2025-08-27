import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { updateLayer } from '../../actions/update-layer';
import { setEditedLayer } from '../../slices/editor.slice';
import LayerDialog from '../layer-dialog/layer-dialog.component';

const EditLayerDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const editedLayerIdx = useSelector(
    (state: RootState) => state.editor.editedLayer,
  );
  const layers = useSelector((state: RootState) => state.layers.layersData);
  return (
    <LayerDialog
      showDialog={editedLayerIdx !== null}
      disabledClose={false}
      initialValues={layers[editedLayerIdx]}
      closeHandler={() => {
        dispatch(setEditedLayer(null));
      }}
      submitHandler={(values) => {
        dispatch(updateLayer(values, editedLayerIdx));
        // update layer
        dispatch(setEditedLayer(null));
      }}
    />
  );
};

export default EditLayerDialog;
