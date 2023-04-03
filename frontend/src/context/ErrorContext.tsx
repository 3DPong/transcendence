import { createContext, useContext, useState, ReactNode } from 'react';

interface ErrorContextValue {
  errorTitle: string | null;
  errorMessage: string | null;
  action: (() => void) | null;
  handleError: (tilte:string | null, message: string | null, action?: ()=>void) => void;

}

const ErrorContext = createContext<ErrorContextValue | null>(null);

export function useError(): ErrorContextValue {
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
  const [action, setAction] = useState<(()=>void) | null>(null);

  function handleError(title: string | null, message: string | null, action?: ()=>void ) {
    setErrorTitle(title);
    setErrorMessage(message);
    action && setAction(action); // if param exists, set callback state.
  }

  return (
    <ErrorContext.Provider value={{ errorTitle, errorMessage, action, handleError }}>
      {children}
    </ErrorContext.Provider>
  );
}