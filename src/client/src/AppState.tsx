import React from 'react';

interface IAppState {
  websiteName: string;
  wikiHome: string;
}

const AppContext = React.createContext<IAppState | undefined>(undefined);

const useAppState = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a AppProvider');
  }
  return context;
};

const AppStateProvider: React.FC = ({ children }) => {
  const value: IAppState = {
    websiteName: 'Jingo',
    wikiHome: 'Home'
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppStateProvider, useAppState };
