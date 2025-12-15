import { Box, Typography } from '@mui/material';
import { SelectEvent } from 'ol/interaction/Select';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { deleteSelectHandler } from '../../actions/delete.action';
import { exportFragmentHandler } from '../../actions/export.action';
import {
  setCopyToLayerDialogOpen,
  setMoveToLayerDialogOpen,
  setShowPropsDialog,
} from '../../slices/ui.slice';
import { SelectedBox } from '../collection-home/collection-home.styles';
import DetailsButtons from './details-buttons.component';
import FragmentDetails from './fragment-details.component';

const DetailsBox: React.FC = () => {
  const [detailsText, setDetailsText] = useState('Details:');
  const dispatch = useDispatch<AppDispatch>();

  const { infoDetails } = useSelector((state: RootState) => state.selected);
  const fragmentsArea = useSelector(
    (state: RootState) => state.selected.fragmentsArea,
  );
  const fullArea = useSelector((state: RootState) => state.selected.fullArea);

  React.useEffect(() => {
    if (infoDetails && infoDetails.length > 1) {
      setDetailsText(`${infoDetails.length} items selected`);
    } else {
      setDetailsText('Details:');
    }
  }, [infoDetails?.length]);

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
      <Typography variant="h6">{detailsText}</Typography>
      <Box sx={{ overflowY: 'auto', maxHeight: 325, mb: 1 }}>
        {infoDetails && infoDetails.length > 0 ? (
          <>
            {infoDetails.map((feature) => (
              <FragmentDetails key={feature.getId()} feature={feature} />
            ))}
          </>
        ) : null}
        {infoDetails && infoDetails.length === 0 ? (
          <Typography>Nothing is selected.</Typography>
        ) : null}
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
