import { createContext, useContext, useState, ReactNode } from 'react';

type AlertType = 'error' | 'warning' | 'info' | 'success';
export type handleAlertFunction = (title: string | null, message: string | null, redirectUrl?: string | null, type?: AlertType) => void;

interface AlertContextValue {
  alertTitle: string | null;
  alertMessage: string | null;
  // action: (() => void) | null;
  redirectUrl: string | null;
  alertType: AlertType;
  handleAlert: handleAlertFunction;
}

const AlertContext = createContext<AlertContextValue | null>(null);

// Custom Hook
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useError must be used within an AlertProvider');
  }
  return context;
}

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps): JSX.Element {
  const [alertTitle, setAlertTitle] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<AlertType>('error');

  function handleAlert(title: string | null, message: string | null, redirectUrl?: string | null, type?: AlertType) {
    setAlertTitle(title);
    setAlertMessage(message);
    redirectUrl && setRedirectUrl(redirectUrl); // if param exists, set callback state.
    type && setAlertType(type); // if param exists, set alert type.
  }

  return (
    <AlertContext.Provider value={{ alertTitle, alertMessage, redirectUrl, alertType, handleAlert }}>
      {children}
    </AlertContext.Provider>
  );
}
