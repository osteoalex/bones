import { Box, Drawer } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../../store';

type Props = {
  children: ReactNode;
};

const EditorDrawer: React.FC<Props> = ({ children }) => {
  const [size, setSize] = useState(300);

  const drawerOpen = useSelector((state: RootState) => state.ui.drawerOpen);

  useEffect(() => {
    async function getInitialData() {
      const width = await window.electron.getDrawerWidth();
      setSize(width || 300);
    }
    getInitialData();
  }, []);

  const handler = (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
    const startSize = size;
    const startPosition = mouseDownEvent.pageX;
    function onMouseMove(mouseMoveEvent: MouseEvent) {
      const pos = startSize - startPosition + mouseMoveEvent.pageX;
      setSize(pos);
      window.electron.setDrawerWidth(pos);
    }
    function onMouseUp() {
      document.body.removeEventListener('mousemove', onMouseMove);
    }

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp, { once: true });
  };

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      hideBackdrop={true}
      ModalProps={{
        slots: { backdrop: 'div' },
        slotProps: {
          root: {
            style: {
              position: 'absolute',
              top: 'unset',
              bottom: 'unset',
              left: 'unset',
              right: 'unset',
            },
          },
        },
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ width: `${size - 4}px` }}>{children}</Box>
        <Box
          sx={{
            height: '100%',
            width: '4px',
            background: '#ccc',
            cursor: 'col-resize',
          }}
          onMouseDown={handler}
        ></Box>
      </Box>
    </Drawer>
  );
};

export default EditorDrawer;
