import { Box, Typography } from '@mui/material';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import React from 'react';

interface FragmentDetailsProps {
  feature: Feature<Geometry>;
}

const FragmentDetails: React.FC<FragmentDetailsProps> = ({ feature }) => {
  const props = feature.getProperties();
  return (
    <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ pr: 3, fontWeight: 'bold' }}>Id: </Typography>
        <Typography>{feature.getId()}</Typography>
      </Box>
      {props.targetId && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ pr: 3, fontWeight: 'bold' }}>Bone: </Typography>
          <Typography>{props.targetId}</Typography>
        </Box>
      )}
      {Object.entries(props)
        .filter(
          ([key]) =>
            !['geometry', 'fill', 'stroke', 'strokeWidth', 'targetId'].includes(
              key,
            ),
        )
        .map(([key, value]) => (
          <Box
            key={key}
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Typography sx={{ pr: 3, fontWeight: 'bold' }}>{key}: </Typography>
            <Typography
              sx={{ maxWidth: '200px', maxHeight: '200px', overflow: 'auto' }}
            >
              {String(value) || '-'}
            </Typography>
          </Box>
        ))}
      {(props.fill || props.stroke) && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          {props.fill && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ pr: 1, fontWeight: 'bold' }}>Fill:</Typography>
              <Box
                sx={{
                  height: 20,
                  width: 20,
                  background: props.fill,
                  border: '1px solid #ccc',
                }}
              />
            </Box>
          )}
          {props.stroke && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ pr: 1, fontWeight: 'bold' }}>
                Stroke:
              </Typography>
              <Box
                sx={{
                  height: 20,
                  width: 20,
                  background: props.stroke,
                  border: '1px solid #ccc',
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FragmentDetails;
