import { Switch } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../../store';
import { setAlt, setCtrl, setShift } from '../../slices/hotkeys.slice';
import Alt from './alt.svg';
import Ctrl from './ctrl.svg';
import {
  HotKeysToggleImg,
  HotKeysToggleRow,
  HotKeysToggleWrapper,
} from './hotkeys-toggle.styles';
import Shift from './shift.svg';

const HotkeysToggle: React.FC = () => {
  const dispatch = useDispatch();
  const { ctrl, alt, shift } = useSelector((state: RootState) => state.hotkeys);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') dispatch(setCtrl(true));
      if (e.key === 'Alt') {
        e.preventDefault();
        dispatch(setAlt(true));
      }
      if (e.key === 'Shift') dispatch(setShift(true));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') dispatch(setCtrl(false));
      if (e.key === 'Alt') dispatch(setAlt(false));
      if (e.key === 'Shift') dispatch(setShift(false));
    };
    const handleBlur = () => {
      dispatch(setCtrl(false));
      dispatch(setAlt(false));
      dispatch(setShift(false));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [dispatch]);

  return (
    <HotKeysToggleWrapper>
      <HotKeysToggleRow>
        <HotKeysToggleImg src={Ctrl} alt="Ctrl" />
        <Switch
          checked={ctrl}
          onChange={(_, checked) => dispatch(setCtrl(checked))}
        />
      </HotKeysToggleRow>
      <HotKeysToggleRow>
        <HotKeysToggleImg src={Alt} alt="Alt" />
        <Switch
          checked={alt}
          onChange={(_, checked) => dispatch(setAlt(checked))}
        />
      </HotKeysToggleRow>
      <HotKeysToggleRow>
        <HotKeysToggleImg src={Shift} alt="Shift" />
        <Switch
          checked={shift}
          onChange={(_, checked) => dispatch(setShift(checked))}
        />
      </HotKeysToggleRow>
    </HotKeysToggleWrapper>
  );
};

export default HotkeysToggle;
