import { Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import { EDIT_MODE_TYPE } from '../../../../../utils/enums';
import { RootState } from '../../../../store';
import { StyledBottomBar, StyledBottomBarSection } from './bottom-bar.styles';

const MODE_LABELS: Record<string, string> = {
  [EDIT_MODE_TYPE.SELECT_RECTANGLE]: 'Select with rectangle',
  [EDIT_MODE_TYPE.ADDITION]: 'Draw fragments to add',
  [EDIT_MODE_TYPE.SUBTRACTION]: 'Draw fragments to subtract',
  [EDIT_MODE_TYPE.SPLIT]: 'Draw line to split by',
  [EDIT_MODE_TYPE.DELETE]: 'Select fragments to delete',
  [EDIT_MODE_TYPE.ADD_WHOLE]: 'Add whole',
  [EDIT_MODE_TYPE.SELECT]: 'Select',
  [EDIT_MODE_TYPE.ANNOTATION]: 'Add annotation',
};

const BottomBar: React.FC = () => {
  const mode = useSelector((state: RootState) => state.editor.mode);
  const modeLabel = MODE_LABELS[mode] || mode || 'None';
  return (
    <StyledBottomBar>
      <StyledBottomBarSection>
        <Typography
          variant="body2"
          color="text.secondary"
          component="span"
          sx={{ lineHeight: 1 }}
        >
          Selected: 0 items
        </Typography>
      </StyledBottomBarSection>
      <StyledBottomBarSection>
        <Typography
          variant="body2"
          color="text.secondary"
          component="span"
          sx={{ lineHeight: 1 }}
        >
          Current tool: {modeLabel}
        </Typography>
      </StyledBottomBarSection>
    </StyledBottomBar>
  );
};

export default BottomBar;
