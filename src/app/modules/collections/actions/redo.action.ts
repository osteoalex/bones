import { ItemContent } from '../../../../types/collection-config-data.interface';
import { TAction } from '../../../../types/store.types';
import {
  popFuture,
  pushPast,
  suppressHistory,
  unsuppressHistory,
} from '../slices/history.slice';
import {
  setAddWholeRef,
  setBoneSelectRef,
  setDeleteSelectRef,
  setDrawFragmentRef,
  setInfoSelectRef,
  setSnapFragmentRef,
  setSubtractFragmentRef,
} from '../slices/interactions.slice';
import {
  setActiveLayerIdx,
  setLayers,
  setLayersData,
} from '../slices/layers.slice';
import { setSelectedBone } from '../slices/selected.slice';
import { setupAddWholeInteraction } from './add-whole.action';
import { setupBoneSelectInteraction } from './bone-select.action';
import { recalculateAreas } from './calculate-area.action';
import { setupFragmentSelectInteraction } from './fragment-select.action';
import { setupDrawLayers } from './setup-layers-and-sources.action';

/*
  Redo flow (high-level):
  - Locate the next distinct snapshot in the `future` stack (skip any entries
    that are identical to the current state — these are no-op entries left
    behind by prior undos).
  - Suppress snapshot recording while applying the redo so the programmatic
    state set does not create new history entries.
  - Apply the chosen future snapshot to `layersData`, push it into `past`
    so it becomes the most-recent undo target, then rebuild OpenLayers layers
    and interactions to reflect the restored state.
  - Finally remove the applied snapshot from `future` so the redo stack moves
    forward. Any derived-state recalculation (areas) is performed without
    recording another snapshot.
*/
export function redo(): TAction {
  return (dispatch, getState) => {
    const { history } = getState();
    if (!history || !history.future || history.future.length === 0) {
      return;
    }

    // Find the next distinct future snapshot (skip duplicates equal to current).
    const currentState = getState().layers.layersData;
    const currStateStr = JSON.stringify(currentState);
    let candidateF: ItemContent | null = null;
    while (getState().history?.future?.length > 0) {
      const futureNow = getState().history.future;
      const lastFIdx = futureNow.length - 1;
      const lastF = futureNow[lastFIdx];
      if (JSON.stringify(lastF) === currStateStr) {
        dispatch(popFuture());
        continue;
      }
      candidateF = lastF;
      break;
    }
    if (!candidateF) return;

    // Capture current interaction active states and suppress snapshot
    // recording while applying the redo so rehydration doesn't create new
    // history entries. We must push the current state into `past` so the
    // redo becomes undoable.
    const {
      infoSelectRef: prevInfoRef,
      boneSelectRef: prevBoneRef,
      addWholeRef: prevAddWholeRef,
      addByRectangleDrawRef: prevAddByRectRef,
      drawFragmentRef: prevDrawRef,
      subtractFragmentRef: prevSubtractRef,
      splitFragmentRef: prevSplitRef,
      deleteSelectRef: prevDeleteRef,
      snapFragmentRef: prevSnapRef,
      drawAnnotationRef: prevDrawAnnotationRef,
    } = getState().interactions;
    const prevInfoActive = prevInfoRef ? prevInfoRef.getActive() : false;
    const prevBoneActive = prevBoneRef ? prevBoneRef.getActive() : false;
    const prevAddWholeActive = prevAddWholeRef
      ? prevAddWholeRef.getActive()
      : false;
    const prevAddByRectActive = prevAddByRectRef
      ? prevAddByRectRef.getActive()
      : false;
    const prevDrawActive = prevDrawRef ? prevDrawRef.getActive() : false;
    const prevSubtractActive = prevSubtractRef
      ? prevSubtractRef.getActive()
      : false;
    const prevSplitActive = prevSplitRef ? prevSplitRef.getActive() : false;
    const prevDeleteActive = prevDeleteRef ? prevDeleteRef.getActive() : false;
    const prevSnapActive = prevSnapRef ? prevSnapRef.getActive() : false;
    const prevDrawAnnotationActive = prevDrawAnnotationRef
      ? prevDrawAnnotationRef.getActive()
      : false;

    try {
      dispatch(suppressHistory());
      // Push the pre-redo current state into past so undo can restore it.
      dispatch(pushPast(JSON.parse(JSON.stringify(currentState))));
      // Apply the redo snapshot
      dispatch(setLayersData(candidateF));

      // rebuild map from restored state (same logic as undo)
      try {
        const {
          olMapRef,
          layers: existingDrawLayers,
          activeLayerIdx,
        } = getState().layers;
        if (olMapRef) {
          if (Array.isArray(existingDrawLayers)) {
            existingDrawLayers.forEach((l) => {
              try {
                olMapRef.removeLayer(l.base);
                olMapRef.removeLayer(l.annotationLayer);
              } catch (e) {
                // ignore per-layer removal errors
              }
            });
          }

          const restored = getState().layers.layersData;
          const newDrawLayers = dispatch(setupDrawLayers(restored));
          dispatch(setLayers(newDrawLayers));
          newDrawLayers.forEach((l) => {
            olMapRef.addLayer(l.base);
            olMapRef.addLayer(l.annotationLayer);
          });

          const newActive = Math.max(
            0,
            Math.min(activeLayerIdx || 0, newDrawLayers.length - 1),
          );
          dispatch(setActiveLayerIdx(newActive));

          if (newDrawLayers.length > 0) {
            const drawLayer = newDrawLayers[newActive];
            dispatch(setSnapFragmentRef(drawLayer.snap));
            dispatch(setDeleteSelectRef(drawLayer.delete));
            dispatch(setDrawFragmentRef(drawLayer.draw));
            dispatch(setSubtractFragmentRef(drawLayer.subtract));
            // recreate selection interactions so tools remain active after redo
            try {
              const infoClickRef = dispatch(setupFragmentSelectInteraction());
              dispatch(setInfoSelectRef(infoClickRef));
              if (infoClickRef && prevInfoActive) infoClickRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const selectBoneRef = dispatch(setupBoneSelectInteraction());
              dispatch(setBoneSelectRef(selectBoneRef));
              if (selectBoneRef && prevBoneActive)
                selectBoneRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const addWholeRef = dispatch(setupAddWholeInteraction());
              dispatch(setAddWholeRef(addWholeRef));
              if (addWholeRef && prevAddWholeActive)
                addWholeRef.setActive(true);
            } catch (e) {
              // ignore
            }
            // restore other interaction actives
            try {
              const addByRectRef =
                getState().interactions.addByRectangleDrawRef;
              if (addByRectRef && prevAddByRectActive)
                addByRectRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const drawRef = getState().interactions.drawFragmentRef;
              if (drawRef && prevDrawActive) drawRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const subtractRef = getState().interactions.subtractFragmentRef;
              if (subtractRef && prevSubtractActive)
                subtractRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const splitRef = getState().interactions.splitFragmentRef;
              if (splitRef && prevSplitActive) splitRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const deleteRef = getState().interactions.deleteSelectRef;
              if (deleteRef && prevDeleteActive) deleteRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const snapRef = getState().interactions.snapFragmentRef;
              if (snapRef && prevSnapActive) snapRef.setActive(true);
            } catch (e) {
              // ignore
            }
            try {
              const drawAnnotationRef =
                getState().interactions.drawAnnotationRef;
              if (drawAnnotationRef && prevDrawAnnotationActive)
                drawAnnotationRef.setActive(true);
            } catch (e) {
              // ignore
            }
          }

          olMapRef.render();
          // avoid saving a snapshot while applying a redo
          dispatch(recalculateAreas({ saveSnapshot: false }));
          dispatch(setSelectedBone([]));
          try {
            document.dispatchEvent(new CustomEvent('resetSelection'));
          } catch (e) {
            // ignore
          }
          try {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            const toSave = getState().layers.layersData;
            window.electron.saveFeaturesToTempFile(toSave);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        window.electron.logError?.('redo: failed to rebuild map layers', err);
      }

      // remove the applied future snapshot
      dispatch(popFuture());
    } finally {
      dispatch(unsuppressHistory());
    }
  };
}
