import { useSelector } from 'react-redux';
import { RootState } from '../store/index';

export const useAppSelector = <T,>(selector: (state: RootState) => T): T => {
  return useSelector<RootState, T>(selector);
};
