import { AlertTitle, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAlert } from '@/context/AlertContext';
import { useNavigate } from 'react-router';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

// https://mui.com/material-ui/react-snackbar/
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function AlertSnackbar() {
  const { alertTitle, alertMessage, redirectUrl, alertType, handleAlert } = useAlert();

  const [open, setOpen] = useState<boolean>(alertTitle !== null);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(alertTitle !== null);
  }, [alertTitle]);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    setOpen(false);
    if (redirectUrl) {
      // action callback 실행 (Re-direct 용)
      navigate(redirectUrl);
    }
    handleAlert(null, null, null, 'error');
  };

  return (
      <Snackbar
          open={open}
          autoHideDuration={4000}
          message={`${alertTitle}: ${alertMessage}`}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert /*onClose={handleClose}*/ severity={alertType} sx={{ width: '100%' }}>
          {/*hi*/}
          <AlertTitle>{alertTitle}</AlertTitle>
          <strong>{alertMessage}</strong>
        </Alert>
      </Snackbar>
  );
}

export default AlertSnackbar;

