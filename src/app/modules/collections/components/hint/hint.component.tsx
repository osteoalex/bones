import { Alert, AlertTitle, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EDIT_MODE_TYPE } from '../../../../../utils/enums';
import { RootState } from '../../../../store';
import { setShowHints } from '../../slices/ui.slice';
import { HintBoxWrapper } from './hint.styles';

const Hint: React.FC = () => {
  const dispatch = useDispatch();

  const mode = useSelector((state: RootState) => state.editor.mode);
  const currentItem = useSelector(
    (state: RootState) => state.editor.currentItem,
  );
  const layers = useSelector((state: RootState) => state.layers.layers);
  const showHints = useSelector((state: RootState) => state.ui.showHints);

  const getHint = useCallback(() => {
    let hint = '';
    /* eslint-disable */
    switch (mode) {
      case EDIT_MODE_TYPE.ADDITION:
        hint =
          'Using points draw outline of fragment to add. Double click to finish drawing.';
        break;
      case EDIT_MODE_TYPE.DELETE:
        hint = 'Click on fragment to delete.';
        break;
      case EDIT_MODE_TYPE.SPLIT:
        hint =
          'Using points draw a line to split by. Double click to finish drawing';
        break;
      case EDIT_MODE_TYPE.SUBTRACTION:
        hint =
          'Using points draw outline of fragment to remove. Double click to finish drawing.';
        break;
      case EDIT_MODE_TYPE.SELECT_RECTANGLE:
        hint =
          'Click to add top left corner of rectangle, move mouse in desired direction and click again to add bottom right corner of the rectangle. All bones fully inside the rectangle will be added.';
        break;
      case EDIT_MODE_TYPE.ADD_WHOLE:
        hint =
          'Click on bones to select or deselect them, after the selection is finished click ✓ icon on the right of the screen to add selected bones or click ✕ icon to cancel the selection.';
        break;
      case EDIT_MODE_TYPE.INFO:
        hint = 'Click on bone or fragment to display information about it.';
        break;
      default:
        hint = '';
    }
    /* eslint-enable */
    return hint;
  }, [mode]);

  return (
    currentItem &&
    !!layers.length &&
    showHints && (
      <HintBoxWrapper>
        <Alert
          severity="info"
          onClose={() => {
            window.electron.toggleHint(false);
            dispatch(setShowHints(false));
          }}
        >
          <AlertTitle>Hint</AlertTitle>
          <Typography>{getHint()}</Typography>
          <Typography sx={{ marginTop: '10px' }}>
            To hide this hint click question mark icon in the right bottom
            corner of the screen or click close icon. You can open it again by
            clicking the question mark icon.
          </Typography>
        </Alert>
      </HintBoxWrapper>
    )
  );
};

export default Hint;
