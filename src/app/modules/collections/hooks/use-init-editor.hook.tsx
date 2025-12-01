/* eslint-disable */
import { Map, View } from 'ol';
import { DragPan, DragRotateAndZoom, defaults } from 'ol/interaction';
import type DragPanType from 'ol/interaction/DragPan';
import type Interaction from 'ol/interaction/Interaction';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import { createMiddleMouseDragPan } from '../utils/middle-mouse-drag-pan';
import { Projection } from 'ol/proj';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../types/store.types';
import { RootState } from '../../../store';
import { resetBaseFeatureStyle } from '../actions/reset.action';
import { onResizeHandler } from '../actions/resize.action';
import { setCurrentItem } from '../slices/editor.slice';
import { setOlMapRef } from '../slices/layers.slice';
import { setInfoDetails, setMultipleAddIds } from '../slices/selected.slice';
import { setShowPropsDialog } from '../slices/ui.slice';
import { map } from 'leaflet';
import { handleRightClick } from '../actions/right-click.action';
import { setupClearBoneSelectionOnMapClick, setupClearFragmentSelectionOnMapClick } from '../actions/clear-selection-on-map-click';
/* eslint-enable */

export const useInitEditor = (
  mapRef: React.MutableRefObject<HTMLDivElement>,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const drawFragmentRef = useSelector(
    (state: RootState) => state.interactions.drawFragmentRef,
  );
  const splitFragmentRef = useSelector(
    (state: RootState) => state.interactions.splitFragmentRef,
  );
  const subtractFragmentRef = useSelector(
    (state: RootState) => state.interactions.subtractFragmentRef,
  );
  const multipleAddIds = useSelector(
    (state: RootState) => state.selected.multipleAddIds,
  );
  const baseSourceRef = useSelector(
    (state: RootState) => state.layers.baseSourceRef,
  );
  const olMapRef = useSelector((state: RootState) => state.layers.olMapRef);
  const altHotkey = useSelector((state: RootState) => state.hotkeys.alt);
  const pHotkey = useSelector((state: RootState) => state.hotkeys.p);

  useEffect(() => {
    const abortDrawing = () => {
      if (drawFragmentRef) {
        drawFragmentRef.abortDrawing();
      }
      if (splitFragmentRef) {
        splitFragmentRef.abortDrawing();
      }
      if (subtractFragmentRef) {
        subtractFragmentRef.abortDrawing();
      }
      if (multipleAddIds) {
        dispatch(setMultipleAddIds([]));
      }
      if (baseSourceRef) {
        baseSourceRef.forEachFeature((feature) =>
          resetBaseFeatureStyle(feature),
        );
      }
      dispatch(setShowPropsDialog(false));
    };
    async function getInitialData() {
      await window.electron.onCollectionPageEnter();
      await window.electron.collectionPageEscHandler(async () => {
        abortDrawing();
      });
      dispatch(setInfoDetails(null));
    }

    getInitialData();
    const onResize = () => {
      dispatch(onResizeHandler());
    };
    if (mapRef.current && !olMapRef) {
      const m = new Map({
        target: mapRef.current || undefined,
        interactions: defaults({ dragPan: false }).extend([
          new DragRotateAndZoom(),
          createMiddleMouseDragPan(),
        ]),
        layers: [],
        view: new View({
          center: [0, 0],
          zoom: 7,
          projection: new Projection({
            code: 'EPSG:3395',
            units: 'm',
          }),
        }),
      });
      dispatch(setOlMapRef(m));

      dispatch(setupClearFragmentSelectionOnMapClick());
      dispatch(setupClearBoneSelectionOnMapClick());
    }
    window.addEventListener('resize', onResize);
    const handleRightClickListener = (e: MouseEvent) => {
      e.preventDefault();
      dispatch(handleRightClick(e));
    };
    window.addEventListener('contextmenu', handleRightClickListener);
    return () => {
      async function saveConfig() {
        window.electron.collectionPageEscHandler(async () => undefined);
        await window.electron.onCollectionPageLeave();
        await window.electron.updateCollectionDetails(
          await window.electron.getConfig(),
          true,
        );
        await window.electron.saveAndCloseItem();
        dispatch(setCurrentItem(''));
        dispatch(setInfoDetails(null));
      }
      window.removeEventListener('resize', onResize);
      window.removeEventListener('contextmenu', handleRightClickListener);
      saveConfig();
      dispatch(setOlMapRef());
    };
  }, []);

  // Alt+LMB pan interaction that checks Redux state
  useEffect(() => {
    if (!olMapRef) return;
    // Remove any previous custom Alt+LMB pan interaction
    let prevAltPan: DragPanType | null = null;
    olMapRef.getInteractions().forEach((interaction: Interaction) => {
      if (
        interaction &&
        typeof interaction.get === 'function' &&
        interaction.get('isAltLmbPan')
      ) {
        olMapRef.removeInteraction(interaction);
      }
    });
    // Only add if Alt is toggled in state
    if (altHotkey) {
      const altLmbPan = new DragPan({
        condition: (event: MapBrowserEvent<MouseEvent>) => {
          const originalEvent = event.originalEvent;
          return originalEvent && originalEvent.button === 0 && altHotkey;
        },
      });
      altLmbPan.set('isAltLmbPan', true);
      olMapRef.addInteraction(altLmbPan);
      prevAltPan = altLmbPan;
    }
    // Cleanup
    return () => {
      if (prevAltPan) {
        olMapRef.removeInteraction(prevAltPan);
      }
    };
  }, [olMapRef, altHotkey]);

  // P key interaction that checks Redux state
  useEffect(() => {
    if (!olMapRef) return;
    // Remove any previous custom p+LMB pan interaction
    let prevPPan: DragPanType | null = null;
    olMapRef.getInteractions().forEach((interaction: Interaction) => {
      if (
        interaction &&
        typeof interaction.get === 'function' &&
        interaction.get('isPPan')
      ) {
        olMapRef.removeInteraction(interaction);
      }
    });
    // Only add if P is toggled in state
    if (pHotkey) {
      const pLmbPan = new DragPan({
        condition: (event: MapBrowserEvent<MouseEvent>) => {
          const originalEvent = event.originalEvent;
          return originalEvent && originalEvent.button === 0 && pHotkey;
        },
      });
      pLmbPan.set('isPPan', true);
      olMapRef.addInteraction(pLmbPan);
      prevPPan = pLmbPan;
    }
    // Cleanup
    return () => {
      if (prevPPan) {
        olMapRef.removeInteraction(prevPPan);
      }
    };
  }, [olMapRef, pHotkey]);
};
