/* eslint-disable */
import { Box, Typography } from '@mui/material';
import { SelectEvent } from 'ol/interaction/Select';
import { Fill, Stroke, Style } from 'ol/style';
import { Polygon, MultiPolygon } from 'ol/geom';
import FragmentDetails from './fragment-details.component';
import React, { useEffect, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { deleteAnnotation } from '../../actions/delete-annotation.action';
import { deleteSelectHandler } from '../../actions/delete.action';
import { exportFragmentHandler } from '../../actions/export.action';
import { setLayersData } from '../../slices/layers.slice';
import {
  setAnnotationDialog,
  setCopyToLayerDialogOpen,
  setMoveToLayerDialogOpen,
  setShowPropsDialog,
} from '../../slices/ui.slice';
import { SelectedBox } from '../collection-home/collection-home.styles';
import DetailsButtons from './details-buttons.component';
import { set } from 'ol/transform';
/* eslint-enable */

const DetailsBox: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { infoDetails } = useSelector((state: RootState) => state.selected);
  const fragmentsArea = useSelector(
    (state: RootState) => state.selected.fragmentsArea,
  );
  const fullArea = useSelector((state: RootState) => state.selected.fullArea);

  // Removed showFill, showStroke, and isAnnotation state related to inline FragmentDetails

  return (
    <SelectedBox>
      {infoDetails && infoDetails.length > 0 && (
        <DetailsButtons
          isAnnotation={false}
          onMoveClick={() => dispatch(setMoveToLayerDialogOpen(true))}
          onCopyClick={() => dispatch(setCopyToLayerDialogOpen(true))}
          onExportClick={() => dispatch(exportFragmentHandler())}
          onEditClick={() => dispatch(setShowPropsDialog(true))}
          onDeleteClick={() => {
            dispatch(
              deleteSelectHandler({
                selected: infoDetails,
              } as SelectEvent),
            );
          }}
        />
      )}
      <Typography variant="h6">
        {infoDetails && infoDetails.length > 1
          ? `${infoDetails.length} items selected`
          : infoDetails && infoDetails.length === 1
            ? 'Details:'
            : 'Details:'}
      </Typography>
      <Box>
        {infoDetails && infoDetails.length > 0 ? (
          <>
            {infoDetails.map((feature) => (
              <FragmentDetails key={feature.getId()} feature={feature} />
            ))}
          </>
        ) : (
          <Typography>Nothing is selected.</Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
          Preservation of skeleton:{' '}
        </Typography>
        <Typography>{`${((fragmentsArea * 100) / fullArea).toFixed(
          2,
        )}%`}</Typography>
      </Box>
    </SelectedBox>
  );
};

export default DetailsBox;
