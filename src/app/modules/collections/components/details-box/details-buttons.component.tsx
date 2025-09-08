import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

type Props = {
  onMoveClick: () => void;
  onCopyClick: () => void;
  onExportClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  isAnnotation?: boolean;
};

const DetailsButtons: React.FC<Props> = ({
  onMoveClick,
  onCopyClick,
  onExportClick,
  onEditClick,
  onDeleteClick,
  isAnnotation,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      {!isAnnotation && (
        <>
          <IconButton onClick={onExportClick}>
            <FileDownloadIcon />
          </IconButton>
          <Tooltip title="Move to different layer">
            <IconButton onClick={onMoveClick}>
              <MoveUpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy to different layer">
            <IconButton onClick={onCopyClick}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <IconButton edge="end" onClick={onDeleteClick}>
        <DeleteIcon />
      </IconButton>
      <IconButton id="updateButton" onClick={onEditClick}>
        <EditIcon />
      </IconButton>
    </div>
  );
};

export default DetailsButtons;
