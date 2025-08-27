import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../types/store.types';
import { RootState } from '../../../store';
import { getAndSetupItem } from '../actions/setup-item.action';
import { setInfoDetails, setMultipleAddIds } from '../slices/selected.splice';

export const useCurrentItem = () => {
  const dispatch = useDispatch<AppDispatch>();

  const currentItem = useSelector(
    (state: RootState) => state.editor.currentItem,
  );

  const olMapRef = useSelector((state: RootState) => state.layers.olMapRef);

  useEffect(() => {
    if (!currentItem) {
      return;
    }
    dispatch(getAndSetupItem(currentItem));
    return () => {
      async function cleanup() {
        await window.electron.saveAndCloseItem();
        dispatch(setMultipleAddIds([]));
        dispatch(setInfoDetails(null));
        olMapRef.setLayers([]);
      }
      cleanup();
    };
  }, [currentItem]);
};
