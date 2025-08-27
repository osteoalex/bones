import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CollectionHomeWrapper = styled(Box)`
  height: 100vh;
  width: 100vw;
`;

export const ListBox = styled(Box)`
  height: calc(50vh - 66px);
  padding: 10px 5px 0;
  border-top: solid 1px #ccc;
  overflow-y: auto;
`;

export const SelectedBox = styled(Box)`
  position: absolute;
  top: 15%;
  right: 10px;
  background: white;
  border-radius: 5px;
  border: solid 1px #ccc;
  padding: 10px;
  box-shadow: 1px 0 5px 0px #ddd;
`;

export const ToolsBoxWrapper = styled(Box)`
  position: absolute;
  top: 5%;
  right: 10px;
  background: white;
  border-radius: 5px;
  border: solid 1px #ccc;
  padding: 10px;
  box-shadow: 1px 0 5px 0px #ddd;
`;
