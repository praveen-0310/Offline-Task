import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkState } from '../../types';

const initialState: NetworkState = {
  isConnected: true,
  type: 'unknown',
  isInternetReachable: null,
};

export const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    updateNetworkState: (state, action: PayloadAction<NetworkState>) => {
      return action.payload;
    },

    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    setInternetReachable: (state, action: PayloadAction<boolean | null>) => {
      state.isInternetReachable = action.payload;
    },
  },
});

export const { updateNetworkState, setConnected, setInternetReachable } = networkSlice.actions;

export default networkSlice.reducer;
