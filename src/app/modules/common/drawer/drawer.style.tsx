import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const DrawerBox = styled(Box)`
  height: 100vh;
  width: 50vw;
  z-index 1;
  position: absolute;
  top: 0;
  background: white;
  box-shadow: 1px 0 10px 1px black;
  padding: 10px;
  overflow-y: auto;
`;
