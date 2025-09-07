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
    <>
      {!isAnnotation && (
        <>
          <IconButton
            sx={{ position: 'absolute', right: '150px', top: '5px' }}
            onClick={onExportClick}
          >
            <FileDownloadIcon />
          </IconButton>
          <Tooltip title="Move to different layer">
            <IconButton
              sx={{ position: 'absolute', right: '115px', top: '5px' }}
              onClick={onMoveClick}
            >
              <MoveUpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy to different layer">
            <IconButton
              sx={{ position: 'absolute', right: '80px', top: '5px' }}
              onClick={onCopyClick}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <IconButton
        edge="end"
        onClick={onDeleteClick}
        sx={{ position: 'absolute', right: '55px', top: '5px' }}
      >
        <DeleteIcon />
      </IconButton>
      <IconButton
        id="updateButton"
        sx={{ position: 'absolute', right: '5px', top: '5px' }}
        onClick={onEditClick}
      >
        <EditIcon />
      </IconButton>
    </>
  );
};

export default DetailsButtons;
