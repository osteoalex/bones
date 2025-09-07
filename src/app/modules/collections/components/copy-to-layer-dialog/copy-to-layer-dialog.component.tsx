import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { copyToLayer } from '../../actions/copy-to-layer.action';
import { setCopyToLayerDialogOpen } from '../../slices/ui.slice';
import LayerSelectDialog from '../layer-select-dialog/layer-select-dialog.component';

const CopyToLayerDialog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const copyToLayerDialogOpen = useSelector(
    (state: RootState) => state.ui.copyToLayerDialogOpen,
  );
  const { layersData, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );
  return (
    <LayerSelectDialog
      open={copyToLayerDialogOpen}
      onClose={() => dispatch(setCopyToLayerDialogOpen(false))}
      layersData={layersData}
      activeLayerIdx={activeLayerIdx}
      title="Copy to other layer"
      onSubmit={(targetLayer) => dispatch(copyToLayer(targetLayer))}
    />
  );
};

export default CopyToLayerDialog;
