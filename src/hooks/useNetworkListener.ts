import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch } from './useAppDispatch';
import { updateNetworkState } from '../store/slices/networkSlice';
import { NetworkState } from '../types';


export const useNetworkListener = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        type: state.type as any,
        isInternetReachable: state.isInternetReachable,
      };

      dispatch(updateNetworkState(networkState));
    });

    NetInfo.fetch().then((state) => {
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        type: state.type as any,
        isInternetReachable: state.isInternetReachable,
      };

      dispatch(updateNetworkState(networkState));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);
};
