import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { getLayerDefaultName, randomRGB } from '../../../../../utils';
import { RootState } from '../../../../store';
import { cancelNewItemIfNoLayers } from '../../actions/cancel-new-item-if-empty.action';
import { createNewLayer } from '../../actions/create-new-layer.action';
import { setNewLayerPopupVisible } from '../../slices/ui.slice';
import LayerDialog from '../layer-dialog/layer-dialog.component';

const NewLayerDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const newLayerPopupVisible = useSelector(
    (state: RootState) => state.ui.newLayerPopupVisible,
  );

  const layers = useSelector((state: RootState) => state.layers.layers);

  return (
    <LayerDialog
      showDialog={newLayerPopupVisible}
      disabledClose={false}
      initialValues={{
        name: getLayerDefaultName(layers.length),
        fill: randomRGB(0.3),
        stroke: randomRGB(),
        strokeWidth: 2,
        propertiesConfig: [],
        fragments: { type: 'FeatureCollection', features: [] },
        annotations: { type: 'FeatureCollection', features: [] },
        visible: true,
      }}
      closeHandler={async () => {
        if (Array.isArray(layers) && layers.length === 0) {
          const result = await dispatch(cancelNewItemIfNoLayers());
          if (result) dispatch(setNewLayerPopupVisible(false));
        } else {
          dispatch(setNewLayerPopupVisible(false));
        }
      }}
      submitHandler={(values) => {
        dispatch(createNewLayer(values));
      }}
    />
  );
};

export default NewLayerDialog;
