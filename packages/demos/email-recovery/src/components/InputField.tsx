import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';

const CustomTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px', // Adjust the border radius to match the design
        border: '0.5px solid #DDDDDD', // Adjust the border color and thickness to match the design
        backgroundColor: 'white',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#DDDDDD', // Adjust the border color
    },
    '& .MuiInputBase-input': {
        padding: '10px 12px', // Adjust padding for the input text
        color: '#667085', // Adjust the input text color
    },
});

interface InputFieldProps {
    type: string;
    value: string;
    label?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ type, value, label, onChange }) => {
    return (
        <Box mb={2}>
            {label && (
                <Typography
                    variant="body2"
                    color="textPrimary"
                    mb={1}
                    sx={{ fontWeight: 500, color: '#454545'}}
                >
                    {label}
                </Typography>
            )}
            <CustomTextField
                variant="outlined"
                type={type}
                value={value}
                onChange={onChange}
                fullWidth
            />
        </Box>
    );
};

export default InputField;
