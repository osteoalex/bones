import { ItemContent } from '../../../../types/collection-config-data.interface';
import { TAction } from '../../../../types/store.types';
import {
  popFuture,
  popPast,
  pushFuture,
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
  Undo flow (high-level):
  - Temporarily suppress snapshot recording so rehydration doesn't create new history entries.
  - Push the current in-memory layersData into the "future" stack so redo can restore it.
  - Pop candidates from the "past" stack and apply them one-by-one until a candidate
    produces a visible change in the Redux `layersData` (this avoids no-op undos when
    multiple identical snapshots were recorded).
  - If a popped candidate is identical to the current state, move it into the "future"
    and continue searching for a distinct snapshot. If no distinct snapshot is found,
    revert the initial push into "future" and treat undo as a no-op.
  - After a distinct snapshot is applied, rebuild OpenLayers draw/annotation layers and
    selection/draw interactions, restoring which interactions were active prior to undo.
  - Recalculate derived state (areas) without recording another snapshot.
*/
export function undo(): TAction {
  return (dispatch, getState) => {
    const { history, layers } = getState();
    if (!history || !history.past || history.past.length === 0) return;

    const current = layers.layersData;
    // Capture the active/inactive state of map interactions so we can restore
    // user tool selection (e.g. draw, subtract, select) after rehydration.
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
    // Suppress snapshot recording while applying undo. We must suppress
    // history recording so the rehydration step doesn't add new (and
    // incorrect) history entries. Use the history slice actions rather
    // than module-level helpers.
    try {
      dispatch(suppressHistory());

      const currStr = JSON.stringify(current);
      // Push the serialized current state into the future stack exactly once
      // — this gives redo a target to restore if the user later presses redo.
      dispatch(pushFuture(JSON.parse(JSON.stringify(current))));

      // Pop past snapshots and apply candidates until a visible change is observed.
      // This loop avoids applying snapshots that are identical to the current
      // state (which would make undo appear to do nothing and require extra
      // keypresses).
      let applied: ItemContent | null = null;
      while (getState().history?.past?.length > 0) {
        const pastNow = getState().history.past;
        applied = pastNow[pastNow.length - 1];
        // remove it from past
        dispatch(popPast());

        // apply candidate
        dispatch(setLayersData(applied));

        // compare after applying
        try {
          const after = JSON.stringify(getState().layers.layersData);

          if (after === currStr) {
            // Candidate produced no visible difference vs. the pre-undo state.
            // Move it into the future stack so redo still knows about it, and
            // continue searching for an earlier snapshot that yields a visible
            // change.
            dispatch(pushFuture(JSON.parse(JSON.stringify(applied))));

            applied = null;
            continue;
          }
          // visible change observed; stop
          break;
        } catch (e) {
          // if comparison fails, stop here
          break;
        }
      }

      if (!applied) {
        // No distinct past snapshot was found (every past snapshot matched the
        // current state). Revert the initial push into future and treat this
        // undo operation as a no-op.
        dispatch(popFuture());

        return;
      }
    } finally {
      dispatch(unsuppressHistory());
    }

    // Rebuild OpenLayers draw & annotation layers from the restored Redux state.
    // We remove any existing draw/annotation layers, create fresh layers from the
    // restored `layersData`, add them back to the map, and recreate selection
    // / drawing interactions. We then restore each interaction's active state to
    // match what the user had before the undo.
    try {
      const {
        olMapRef,
        layers: existingDrawLayers,
        activeLayerIdx,
      } = getState().layers;
      if (olMapRef) {
        // remove existing draw + annotation layers
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
        // update Redux reference and add layers to map
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
          // recreate selection interactions so tools remain active after undo
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
            if (selectBoneRef && prevBoneActive) selectBoneRef.setActive(true);
          } catch (e) {
            // ignore
          }
          try {
            const addWholeRef = dispatch(setupAddWholeInteraction());
            dispatch(setAddWholeRef(addWholeRef));
            if (addWholeRef && prevAddWholeActive) addWholeRef.setActive(true);
          } catch (e) {
            // ignore
          }
          // restore other interaction actives
          try {
            const addByRectRef = getState().interactions.addByRectangleDrawRef;
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
            if (subtractRef && prevSubtractActive) subtractRef.setActive(true);
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
            const drawAnnotationRef = getState().interactions.drawAnnotationRef;
            if (drawAnnotationRef && prevDrawAnnotationActive)
              drawAnnotationRef.setActive(true);
          } catch (e) {
            // ignore
          }
        }

        olMapRef.render();
        // avoid saving a snapshot while applying an undo
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
      window.electron.logError?.('undo: failed to rebuild map layers', err);
    }
  };
}
