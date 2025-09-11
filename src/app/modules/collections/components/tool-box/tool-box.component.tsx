import AddCommentIcon from '@mui/icons-material/AddComment';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import QueueIcon from '@mui/icons-material/Queue';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../../utils/enums';
import { RootState } from '../../../../store';
import { addMultipleCommitHandler } from '../../actions/add-multiple.action';
import { exportItemHandler } from '../../actions/export.action';
import { changeEditMode } from '../../actions/mode.action';
import { ToolsBoxWrapper } from '../collection-home/collection-home.styles';

const ToolBox: React.FC = () => {
  const mode = useSelector((state: RootState) => state.editor.mode);
  const selectedBones = useSelector(
    (state: RootState) => state.selected.selectedBone,
  );
  const dispatch = useDispatch<AppDispatch>();
  // Helper to handle deselect logic
  const handleToolClick = (toolMode: EDIT_MODE_TYPE) => {
    if (mode === toolMode) {
      dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT)); // Deselect: revert to default
    } else {
      dispatch(changeEditMode(toolMode));
    }
  };
  return (
    <ToolsBoxWrapper>
      {/* select many */}
      <Tooltip title="Select with rectangle">
        <IconButton
          onClick={() => handleToolClick(EDIT_MODE_TYPE.SELECT_RECTANGLE)}
        >
          <PhotoSizeSelectSmallIcon
            color={
              mode === EDIT_MODE_TYPE.SELECT_RECTANGLE ? 'success' : 'inherit'
            }
          />
        </IconButton>
      </Tooltip>
      {/* addition */}
      <Tooltip title="Draw fragments to add">
        <IconButton onClick={() => handleToolClick(EDIT_MODE_TYPE.ADDITION)}>
          <EditIcon
            color={mode === EDIT_MODE_TYPE.ADDITION ? 'success' : 'inherit'}
          />
        </IconButton>
      </Tooltip>
      {/* subtraction */}
      <Tooltip title="Draw fragments to subtract">
        <IconButton onClick={() => handleToolClick(EDIT_MODE_TYPE.SUBTRACTION)}>
          <RemoveIcon
            color={mode === EDIT_MODE_TYPE.SUBTRACTION ? 'success' : 'inherit'}
          />
        </IconButton>
      </Tooltip>
      {/* split */}
      <Tooltip title="Draw line to split by">
        <IconButton onClick={() => handleToolClick(EDIT_MODE_TYPE.SPLIT)}>
          <ContentCutIcon
            color={mode === EDIT_MODE_TYPE.SPLIT ? 'success' : 'inherit'}
          />
        </IconButton>
      </Tooltip>
      {/* delete */}
      <Tooltip title="Select fragments to delete">
        <IconButton onClick={() => handleToolClick(EDIT_MODE_TYPE.DELETE)}>
          <DeleteIcon
            color={mode === EDIT_MODE_TYPE.DELETE ? 'success' : 'inherit'}
          />
        </IconButton>
      </Tooltip>
      {/* add whole + multiselect */}
      <Tooltip title="Add whole">
        <IconButton
          onClick={() => dispatch(addMultipleCommitHandler())}
          disabled={!selectedBones?.length}
        >
          <QueueIcon />
        </IconButton>
      </Tooltip>
      {/* save svg */}
      <Tooltip title="Save item as svg">
        <IconButton onClick={() => dispatch(exportItemHandler())}>
          <SaveAltIcon />
        </IconButton>
      </Tooltip>
      {/* annotation */}
      <Tooltip title="Add annotation">
        <IconButton onClick={() => handleToolClick(EDIT_MODE_TYPE.ANNOTATION)}>
          <AddCommentIcon
            color={mode === EDIT_MODE_TYPE.ANNOTATION ? 'success' : 'inherit'}
          />
        </IconButton>
      </Tooltip>
    </ToolsBoxWrapper>
  );
};

export default ToolBox;
