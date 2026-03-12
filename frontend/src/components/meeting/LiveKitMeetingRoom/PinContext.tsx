import { createContext, useContext } from "react";

interface PinContextValue {
  pinnedIdentity: string | null;
  setPinnedIdentity: (identity: string | null) => void;
}

export const PinContext = createContext<PinContextValue>({
  pinnedIdentity: null,
  setPinnedIdentity: () => {},
});

export const usePinContext = () => useContext(PinContext);
