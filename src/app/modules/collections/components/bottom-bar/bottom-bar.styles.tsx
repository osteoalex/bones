import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StyledBottomBar = styled(Box)(({ theme }) => ({
  position: 'fixed',
  left: 0,
  bottom: 0,
  right: 0,
  height: 36,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  zIndex: 1000,
  boxShadow: theme.shadows[3],
}));

export const StyledBottomBarSection = styled(Box)(({ theme }) => ({
  width: '25%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: '3px',
  borderLeft: `1px solid ${theme.palette.divider}`,
  boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.12)', // outer shadow
  '::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '1px',
    background: 'transparent',
    boxShadow: '2px 0 6px 0 rgba(0,0,0,0.08) inset', // inner shadow
    pointerEvents: 'none',
  },
}));
