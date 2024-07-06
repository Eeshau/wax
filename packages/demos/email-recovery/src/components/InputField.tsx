import React from 'react';
import TextField from '@mui/material/TextField';

interface InputFieldProps {
    type: string;
    value: string;
    label?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ type, value, label, onChange }) => {
    return (
        <TextField
            variant="outlined"
            type={type}
            value={value}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            label={label}
            sx={{border: '1px solid #DDDDDD', outline: 'none', boxShadow: 'none', backgroundColor:'white'}}
        />
    );
};

export default InputField;
