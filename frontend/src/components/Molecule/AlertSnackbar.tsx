import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { FC } from 'react';
import { useError } from '@/context/ErrorContext';

interface AlertSnackbarProps {
};

const AlertSnackbar: FC<AlertSnackbarProps> = ({}) => {
  const { errorTitle, errorMessage, handleError } = useError();
  const open = errorTitle !== null;
  if (!open)
    return null;
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={()=>{handleError(null, null)}}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="error">
        <AlertTitle>{errorTitle}</AlertTitle>
        <strong>{errorMessage}</strong>
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackbar;