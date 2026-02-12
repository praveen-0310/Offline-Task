import React from 'react';
import { Provider } from 'react-redux';
import './config/firebase';
import { store } from './store';
import { RootNavigator } from './navigation/RootNavigator';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};
