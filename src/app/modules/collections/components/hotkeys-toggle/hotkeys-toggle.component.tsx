import { Switch } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { redo } from '../../actions/redo.action';
import { undo } from '../../actions/undo.action';
import { setCtrl, setPanToggle, setShift } from '../../slices/hotkeys.slice';
import Ctrl from './ctrl.svg';
import {
  HotKeysToggleImg,
  HotKeysToggleRow,
  HotKeysToggleWrapper,
} from './hotkeys-toggle.styles';
import P from './p.svg';
import Shift from './shift.svg';

const HotkeysToggle: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { ctrl, panToggle, shift } = useSelector(
    (state: RootState) => state.hotkeys,
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') dispatch(setCtrl(true));
      // Toggle the 'p' hotkey state when the user presses the 'p' key.
      // We keep the Redux flag name (`panToggle`) for compatibility but change the
      // physical shortcut to 'p'. Use lowercase compare for robustness.
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        dispatch(setPanToggle(true));
      }
      if (e.key === 'Shift') dispatch(setShift(true));
      // handle undo/redo when ctrl/meta is held
      if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch(undo());
      }
      if (e.key.toLowerCase() === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch(redo());
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') dispatch(setCtrl(false));
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        dispatch(setPanToggle(false));
      }
      if (e.key === 'Shift') dispatch(setShift(false));
    };
    const handleBlur = () => {
      dispatch(setCtrl(false));
      dispatch(setPanToggle(false));
      dispatch(setShift(false));
    };
    // attach to document in capture phase so we receive keys before other handlers
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
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
        <HotKeysToggleImg src={Shift} alt="Shift" />
        <Switch
          checked={shift}
          onChange={(_, checked) => dispatch(setShift(checked))}
        />
      </HotKeysToggleRow>
      <HotKeysToggleRow>
        <HotKeysToggleImg src={P} alt="Pan" />
        <Switch
          checked={panToggle}
          onChange={(_, checked) => dispatch(setPanToggle(checked))}
        />
      </HotKeysToggleRow>
    </HotKeysToggleWrapper>
  );
};

export default HotkeysToggle;
