import SearchIcon from '@mui/icons-material/Search';
import {
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { setSelectedBone } from '../../slices/selected.slice';
import { ListBox } from '../collection-home/collection-home.styles';
import { baseStyle, selectedBoneStyle } from '../collection-home/editor-styles';

const BonesList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const baseSourceRef = useSelector(
    (state: RootState) => state.layers.baseSourceRef,
  );
  const selectedBones = useSelector(
    (state: RootState) => state.selected.selectedBone,
  );

  const resetSelection = () => {
    setSelected([]);
    dispatch(setSelectedBone([]));
  };

  const updateSelection = (e: CustomEvent<string[]>) => {
    setSelected(e.detail);
    if (baseSourceRef) {
      const selectedFeatures = baseSourceRef
        .getFeatures()
        .filter((f) => e.detail.includes(f.getId().toString()));
      dispatch(setSelectedBone(selectedFeatures));
    }
  };

  useEffect(() => {
    document.addEventListener('resetSelection', resetSelection);
    document.addEventListener('updateSelection', updateSelection);
    return () => {
      document.removeEventListener('resetSelection', resetSelection);
      document.removeEventListener('updateSelection', updateSelection);
    };
  }, []);

  const [search, setSearch] = useState('');
  const [items, setItems] = useState(
    baseSourceRef ? baseSourceRef.getFeatures() : [],
  );
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (
      selectedBones &&
      Array.isArray(selectedBones) &&
      selectedBones.length > 0
    ) {
      setSelected(
        selectedBones.map((f) =>
          typeof f === 'object' && f.getId ? f.getId() : f,
        ),
      );
    } else if (selected.length > 0) {
      setSelected([]);
    }
  }, [selectedBones]);
  // Update styles for selected bones
  if (baseSourceRef) {
    const selectedIds = selectedBones.map((f) =>
      typeof f === 'object' && f.getId ? f.getId() : f,
    );
    baseSourceRef.getFeatures().forEach((f) => {
      if (selectedIds.includes(f.getId())) {
        f.setStyle(selectedBoneStyle);
      } else {
        f.setStyle(baseStyle);
      }
    });
  }

  useEffect(() => {
    if (baseSourceRef) {
      if (!search || search.length < 3) {
        setItems(
          baseSourceRef
            .getFeatures()
            .sort((a, b) => (a.getId() < b.getId() ? 1 : -1)),
        );
      } else {
        setItems(
          baseSourceRef
            .getFeatures()
            .filter((feature) =>
              feature.getId().toString().includes(search.toLowerCase()),
            )
            .sort((a, b) => (a.getId() < b.getId() ? 1 : -1)),
        );
      }
    }
  }, [search]);

  return (
    <ListBox>
      <TextField
        label="Search"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <List>
        {items.map((value) => (
          <ListItem
            key={value.getId()}
            disablePadding
            sx={{
              background: selected.includes(value.getId()) ? '#ebebeb' : '#fff',
            }}
            onClick={(e) => {
              if (!baseSourceRef) return;
              let currentlySelected = selected.slice();
              const valueId = value.getId();
              const currentlySelectedIdx = currentlySelected.findIndex(
                (el) => el === valueId,
              );
              if (e.ctrlKey) {
                if (currentlySelectedIdx !== -1) {
                  currentlySelected = currentlySelected.filter(
                    (id) => id !== valueId,
                  );
                } else {
                  currentlySelected = [...currentlySelected, valueId];
                }
                setSelected(currentlySelected);
                const selectedFeatures = baseSourceRef
                  .getFeatures()
                  .filter((f) => currentlySelected.includes(f.getId()));
                dispatch(setSelectedBone(selectedFeatures));
                // Update styles
                baseSourceRef.getFeatures().forEach((f) => {
                  if (currentlySelected.includes(f.getId())) {
                    f.setStyle(selectedBoneStyle);
                  } else {
                    f.setStyle(baseStyle);
                  }
                });
              } else if (e.shiftKey) {
                if (!currentlySelected.length) {
                  currentlySelected = [valueId];
                } else {
                  if (currentlySelectedIdx !== -1) {
                    currentlySelected = currentlySelected.filter(
                      (id) => id !== valueId,
                    );
                  } else {
                    const previous =
                      currentlySelected[currentlySelected.length - 1];
                    const current = valueId;
                    const previousIndex = items.findIndex(
                      (feature) => feature.getId() === previous,
                    );
                    const currentIndex = items.findIndex(
                      (feature) => feature.getId() === current,
                    );
                    let elements = [];
                    if (currentIndex > previousIndex) {
                      elements = items.slice(previousIndex, currentIndex + 1);
                    } else {
                      elements = items.slice(currentIndex, previousIndex + 1);
                    }
                    currentlySelected = Array.from(
                      new Set([
                        ...currentlySelected,
                        ...elements.map((el) => el.getId()),
                      ]),
                    );
                  }
                }
                setSelected(currentlySelected);
                const selectedFeatures = baseSourceRef
                  .getFeatures()
                  .filter((f) => currentlySelected.includes(f.getId()));
                dispatch(setSelectedBone(selectedFeatures));
                // Update styles
                baseSourceRef.getFeatures().forEach((f) => {
                  if (currentlySelected.includes(f.getId())) {
                    f.setStyle(selectedBoneStyle);
                  } else {
                    f.setStyle(baseStyle);
                  }
                });
              } else {
                setSelected([valueId]);
                const selectedFeatures = baseSourceRef
                  .getFeatures()
                  .filter((f) => f.getId() === valueId);
                dispatch(setSelectedBone(selectedFeatures));
                // Update styles
                baseSourceRef.getFeatures().forEach((f) => {
                  if (f.getId() === valueId) {
                    f.setStyle(selectedBoneStyle);
                  } else {
                    f.setStyle(baseStyle);
                  }
                });
              }
            }}
          >
            <ListItemButton>
              <ListItemText primary={value.getId()} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </ListBox>
  );
};

export default BonesList;
