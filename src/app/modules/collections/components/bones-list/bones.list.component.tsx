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
import { EDIT_MODE_TYPE } from '../../../../../utils/enums';
import { RootState } from '../../../../store';
import { changeEditMode } from '../../actions/mode.action';
import {
  setMultipleAddIds,
  setSelectedBone,
} from '../../slices/selected.splice';
import { ListBox } from '../collection-home/collection-home.styles';

const BonesList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const baseSourceRef = useSelector(
    (state: RootState) => state.layers.baseSourceRef,
  );
  const addMultipleRef = useSelector(
    (state: RootState) => state.interactions.addMultipleRef,
  );

  const resetSelection = () => {
    setSelected([]);
    dispatch(setMultipleAddIds([]));
  };

  const updateSelection = (e: CustomEvent<string[]>) => {
    setSelected(e.detail);
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
              let currentlySelected = selected;
              const currentlySelectedIdx = currentlySelected.findIndex(
                (el) => el === value.getId(),
              );
              if (e.ctrlKey) {
                dispatch(setSelectedBone(null));
                addMultipleRef.getFeatures().clear();
                if (currentlySelectedIdx !== -1) {
                  const featuresToAdd = [
                    ...items.filter(
                      (el) =>
                        currentlySelected.includes(el.getId()) &&
                        el.getId() !== value.getId(),
                    ),
                  ];
                  featuresToAdd.forEach((el) =>
                    addMultipleRef.getFeatures().push(el),
                  );
                  currentlySelected = featuresToAdd.map((feature) =>
                    feature.getId(),
                  );
                } else {
                  const featuresToAdd = [
                    ...items.filter((el) =>
                      currentlySelected.includes(el.getId()),
                    ),
                    value,
                  ];
                  featuresToAdd.forEach((el) =>
                    addMultipleRef.getFeatures().push(el),
                  );
                  currentlySelected = [...currentlySelected, value.getId()];
                }
                setSelected(currentlySelected);
                dispatch(changeEditMode(EDIT_MODE_TYPE.ADD_WHOLE));
                dispatch(setMultipleAddIds(currentlySelected));
              } else if (e.shiftKey) {
                dispatch(setSelectedBone(null));
                addMultipleRef.getFeatures().clear();
                if (!currentlySelected.length) {
                  addMultipleRef.getFeatures().push(value);
                  currentlySelected = [value.getId()];
                } else {
                  if (currentlySelectedIdx !== -1) {
                    const featuresToAdd = [
                      ...items.filter((el) =>
                        currentlySelected.includes(el.getId()),
                      ),
                      value,
                    ];
                    featuresToAdd.splice(currentlySelectedIdx);
                    currentlySelected = featuresToAdd.map((feature) =>
                      feature.getId(),
                    );
                  } else {
                    const previous =
                      currentlySelected[currentlySelected.length - 1];
                    const current = value.getId();
                    const previousIndex = items.findIndex(
                      (feature) => feature.getId() === previous,
                    );
                    const currentIndex = items.findIndex(
                      (feature) => feature.getId() === current,
                    );
                    let elements = [];
                    if (currentIndex > previousIndex) {
                      elements = [
                        ...items.filter((item) =>
                          currentlySelected.includes(item.getId()),
                        ),
                        ...items.slice(previousIndex + 1, currentIndex + 1),
                      ];
                    } else {
                      elements = items.slice(currentIndex, previousIndex + 1);
                    }
                    elements.forEach((el) =>
                      addMultipleRef.getFeatures().push(el),
                    );
                    currentlySelected = [
                      ...new Set([
                        ...currentlySelected,
                        ...elements.map((el) => el.getId()),
                      ]),
                    ];
                  }
                }
                dispatch(changeEditMode(EDIT_MODE_TYPE.ADD_WHOLE));
                setSelected(currentlySelected);
                dispatch(setMultipleAddIds(currentlySelected));
              } else {
                dispatch(setSelectedBone(value));
                dispatch(changeEditMode(EDIT_MODE_TYPE.ADD_WHOLE));
                dispatch(setMultipleAddIds([value.getId().toString()]));
                addMultipleRef.getFeatures().clear();
                addMultipleRef.getFeatures().push(value);
                setSelected([value.getId()]);
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
