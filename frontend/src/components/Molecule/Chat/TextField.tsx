import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type fieldType = 'text' | 'password' | 'radio' | 'number' | 'month' | 'file' | 'email'; /* and more... */ // * [How to set up optinal props] // https://bobbyhadz.com/blog/react-optional-props-typescript // https://dev.to/fullstackchris/react-with-typescript-optional-props-with-default-values-33nc

interface ITextFieldProps {
  state: string;
  setState: (arg: string) => void;
  type?: fieldType;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export function TextField({
  state,
  setState,
  label = 'Label',
  placeholder = 'Placeholder',
  type = 'text',
  helperText,
}: ITextFieldProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);

  const handleVisibilityClick = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-group flex flex-col">
      <label className="text-gray-700 form-label mb-2">{label}</label>
      <div className="relative flex">
        <input
          type={showPassword ? 'text' : type}
          value={state}
          onChange={(event) => {
            setState(event.target.value);
          }}
          placeholder={placeholder}
          className="form-control flex-1 px-3 py-1.5 text-base
                      font-normal text-gray-700 bg-white bg-clip-padding
                      border border-solid border-gray-300 rounded
                      transition ease-in-out focus:text-gray-700
                      focus:bg-white focus:border-blue-600 focus:outline-none"
        />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          {type === 'password' && (
            <IconButton onClick={handleVisibilityClick}>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton>
          )}
        </div>
      </div>
      <span className="text-red-500 text-sm">{helperText}</span>
    </div>
  );
}
