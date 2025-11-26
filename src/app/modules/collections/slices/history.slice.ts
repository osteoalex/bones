import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ItemContent } from '../../../../types/collection-config-data.interface';

export interface HistoryState {
  past: ItemContent[];
  future: ItemContent[];
  suppressed?: boolean;
}

const initialState: HistoryState = {
  past: [],
  future: [],
  suppressed: false,
};

/*
  History slice overview:

  - `past` stores an ordered stack of ItemContent snapshots representing
    previous states. The most recent past snapshot is at the end of the array.
  - `future` stores snapshots that can be reapplied by redo. When a new
    snapshot is recorded (normal editing), `future` is cleared.
  - `suppressed` is a runtime flag used to temporarily disable recording
    snapshots (used during undo/redo rehydration to avoid creating history
    entries while we programmatically set state).

  Coalescing and deduplication:
  - Many editing operations (for example, the subtract tool) perform multiple
    internal updates in quick succession. To avoid creating noisy history and
    forcing users to press undo several times for a single logical action,
    we coalesce rapid successive pushes within a short window and deduplicate
    consecutive identical snapshots.
*/
// simple debounce/coalesce guard: if multiple snapshots are pushed within
// this window, ignore the later ones. This helps when complex operations
// (e.g. subtract) trigger several internal updates quickly.
const COALESCE_WINDOW_MS = 350;
let _lastPushAt = 0;

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushSnapshot: (state, action: PayloadAction<ItemContent>) => {
      // If history recording is suppressed we are in the middle of a
      // programmatic state change (for example undo/redo rehydration). In
      // that case we must not record a snapshot because it would create a
      // spurious history entry.
      if (state.suppressed) {
        return;
      }

      // push current snapshot onto past and clear future
      try {
        const last = state.past.length
          ? state.past[state.past.length - 1]
          : null;
        const now = Date.now();
        const incoming = JSON.stringify(action.payload);

        // Coalescing: ignore snapshots that occur within a short time window
        // after the previous push. Many user actions trigger multiple internal
        // updates (e.g. the subtract tool) — coalescing avoids creating a
        // separate history entry for each internal update.
        if (now - _lastPushAt < COALESCE_WINDOW_MS) {
          return;
        }
        _lastPushAt = now;

        const lastStr = last ? JSON.stringify(last) : null;
        // Deduplication: avoid pushing a snapshot that is identical to the
        // most-recent past snapshot. This prevents adjacent duplicate
        // entries that would make undo appear to do nothing.
        if (lastStr !== incoming) {
          state.past.push(action.payload);
        }

        // always clear future when a new snapshot is recorded
        state.future = [];
      } catch (e) {
        // if comparison fails for any reason, fall back to pushing
        state.past.push(action.payload);
        state.future = [];
      }
    },
    suppressHistory: (state) => {
      state.suppressed = true;
    },
    unsuppressHistory: (state) => {
      state.suppressed = false;
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
    },
    // push into future without clearing (used when undoing)
    pushFuture: (state, action: PayloadAction<ItemContent>) => {
      state.future.push(action.payload);
    },
    // push into past without clearing (used when redoing)
    pushPast: (state, action: PayloadAction<ItemContent>) => {
      state.past.push(action.payload);
    },
    popPast: (state) => {
      state.past.pop();
    },
    popFuture: (state) => {
      state.future.pop();
    },
  },
});

export const {
  pushSnapshot,
  clearHistory,
  pushFuture,
  pushPast,
  popPast,
  popFuture,
  suppressHistory,
  unsuppressHistory,
} = historySlice.actions;

export default historySlice.reducer;
