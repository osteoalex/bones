import { useHotkeys as useHotkeysHook } from 'react-hotkeys-hook';
import { useDispatch } from 'react-redux';

import { setNewItemNameDialogOpen } from '../slices/ui.slice';

export const useHotkeys = () => {
  const dispatch = useDispatch();
  useHotkeysHook('ctrl+n', () => dispatch(setNewItemNameDialogOpen(true)));
  useHotkeysHook('ctrl+s', () => {
    window.electron.saveItem();
  });
};
