import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { addMultipleCommitHandler } from '../../actions/add-multiple.action';
import { setMultipleAddIds } from '../../slices/selected.splice';
import { SelectedBox } from '../collection-home/collection-home.styles';

const AddMultipleControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <SelectedBox>
      <Tooltip title="Commit">
        <IconButton onClick={() => dispatch(addMultipleCommitHandler())}>
          <CheckIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Clear">
        <IconButton
          onClick={() => {
            dispatch(setMultipleAddIds([]));
          }}
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </SelectedBox>
  );
};

export default AddMultipleControls;
