import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { moveToLayer } from '../../actions/move-to-layer.action';
import { setMoveToLayerDialogOpen } from '../../slices/ui.slice';
import LayerSelectDialog from '../layer-select-dialog/layer-select-dialog.component';

const MoveToLayerDialog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const moveToLayerDialogOpen = useSelector(
    (state: RootState) => state.ui.moveToLayerDialogOpen,
  );
  const { layersData, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );
  return (
    <LayerSelectDialog
      open={moveToLayerDialogOpen}
      onClose={() => dispatch(setMoveToLayerDialogOpen(false))}
      layersData={layersData}
      activeLayerIdx={activeLayerIdx}
      title="Move to other layer"
      onSubmit={(targetLayer) => dispatch(moveToLayer(targetLayer))}
    />
  );
};

export default MoveToLayerDialog;
