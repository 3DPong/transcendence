import { createContext, useContext, useState, ReactNode } from 'react';

export type handleErrorFunction = (title: string | null, message: string | null, redirectUrl?: string | null) => void;

interface ErrorContextValue {
  errorTitle: string | null;
  errorMessage: string | null;
  // action: (() => void) | null;
  redirectUrl: string | null;

  handleError: handleErrorFunction;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

// Custom Hook
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps): JSX.Element {
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  function handleError(title: string | null, message: string | null, redirectUrl?: string | null) {
    setErrorTitle(title);
    setErrorMessage(message);
    redirectUrl && setRedirectUrl(redirectUrl); // if param exists, set callback state.
  }

  return (
    <ErrorContext.Provider value={{ errorTitle, errorMessage, redirectUrl, handleError }}>
      {children}
    </ErrorContext.Provider>
  );
}
