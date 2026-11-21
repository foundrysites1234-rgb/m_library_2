import { createContext, useContext } from 'react';

export const SheetStateContext = createContext({
  detailOpen: false,
  setDetailOpen: () => {},
});

export function useSheetState() {
  return useContext(SheetStateContext);
}
