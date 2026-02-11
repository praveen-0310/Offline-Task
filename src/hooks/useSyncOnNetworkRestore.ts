import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { processSyncQueue } from '../store/thunks/syncThunks';


export const useSyncOnNetworkRestore = (): void => {
  const dispatch = useAppDispatch();
  const { isConnected, isInternetReachable } = useAppSelector((state) => state.network);
  const prevConnectionRef = useRef<boolean>(false);

  useEffect(() => {
    const isCurrentlyConnected = isConnected && isInternetReachable !== false;

    // Detect transition from offline → online
    if (isCurrentlyConnected && !prevConnectionRef.current) {
      dispatch(processSyncQueue());
    }

    prevConnectionRef.current = isCurrentlyConnected;
  }, [isConnected, isInternetReachable, dispatch]);
};
