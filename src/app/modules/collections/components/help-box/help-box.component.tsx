import HelpIcon from '@mui/icons-material/Help';
import { IconButton } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../../store';
import { setShowHints } from '../../slices/ui.slice';
import { HelpBoxWrapper } from './help-box.styles';

const HelpBox: React.FC = () => {
  const dispatch = useDispatch();

  const showHints = useSelector((state: RootState) => state.ui.showHints);

  return (
    <HelpBoxWrapper>
      <IconButton
        onClick={() => {
          window.electron.toggleHint(!showHints);
          dispatch(setShowHints(!showHints));
        }}
      >
        <HelpIcon />
      </IconButton>
    </HelpBoxWrapper>
  );
};

export default HelpBox;
