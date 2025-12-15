import { Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { updateProps } from '../../actions/update-props.action';
import { setShowPropsDialog } from '../../slices/ui.slice';

const FragmentPropertiesTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { layersData, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );
  const infoDetailsArr = useSelector(
    (state: RootState) => state.selected.infoDetails,
  );
  // Local state for edited rows
  const [tableRows, setTableRows] = useState<Record<string, string>[]>(
    infoDetailsArr.map((f, idx) => ({
      id: f.getId ? f.getId().toString() : idx.toString(),
      ...f.getProperties(),
    })),
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 25 },
    {
      field: 'fill',
      headerName: 'Fill',
      width: 100,
      editable: false,
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: params.value,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        />
      ),
    },
    {
      field: 'stroke',
      headerName: 'Stroke',
      width: 100,
      editable: false,
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: params.value,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        />
      ),
    },
    {
      field: 'strokeWidth',
      headerName: 'Stroke Width (px)',
      width: 100,
    },
    ...layersData[activeLayerIdx].propertiesConfig.map((property) => ({
      field: property.name,
      headerName: property.name,
      width: 150,
      editable: true,
    })),
  ];

  // Save handler
  const handleSave = () => {
    dispatch(updateProps(tableRows));
    dispatch(setShowPropsDialog(false));
  };

  return (
    <div style={{ minWidth: 400, position: 'relative' }}>
      <DataGrid
        columns={columns}
        rows={tableRows}
        disableRowSelectionOnClick
        processRowUpdate={(newRow) => {
          setTableRows((prev) =>
            prev.map((row) => (row.id === newRow.id ? newRow : row)),
          );
          return newRow;
        }}
        onCellEditStop={(params) => {
          if (
            params.reason === 'cellFocusOut' ||
            params.reason === 'enterKeyDown'
          ) {
            setTableRows((prev) =>
              prev.map((row) =>
                row.id === params.id
                  ? { ...row, [params.field]: params.value }
                  : row,
              ),
            );
          }
        }}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSave}
      >
        Save
      </Button>
    </div>
  );
};

export default FragmentPropertiesTable;
