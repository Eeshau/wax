import React from 'react';
import { Box, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

type StatusTagProps = {
  status: 'Guarded' | 'Recovered';
};

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const isGuarded = status === 'Guarded';

  const icon = isGuarded ? <SecurityIcon sx={{padding:'4px'}}/> : <MonetizationOnIcon sx={{padding:'4px'}}/>;
  const color = isGuarded ? '#0069E4' : '#FFAC30';
  const backgroundColor = isGuarded ? '#EFF8FF' : '#4E1D09';
  const borderColor = isGuarded ? '#B2DDFF' : '#93370D';

  return (
    <Box
      sx={{
        width:'150px',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 12px 4px 5px',
        gap: '4px',
        borderRadius: '9999px',
        border: `2px solid ${borderColor}`,
        backgroundColor: backgroundColor,
        color: color,
        justifyContent: 'center'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', color: color, paddingX:'5px' }}>
        {icon}
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        {status}
      </Typography>
    </Box>
  );
};

export default StatusTag;
