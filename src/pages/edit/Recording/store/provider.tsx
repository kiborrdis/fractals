import { createContext, ReactNode, useContext, useMemo } from "react";
import { createRecordingStore } from "./recordingStore";

type RecordingStoreInstance = ReturnType<typeof createRecordingStore>;

const recordingStoreContext = createContext<RecordingStoreInstance | null>(
  null,
);

export const RecordingStoreProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const store = useMemo(() => createRecordingStore(), []);

  return (
    <recordingStoreContext.Provider value={store}>
      {children}
    </recordingStoreContext.Provider>
  );
};

export const useRecordingStore = <R,>(
  selector: (...args: Parameters<Parameters<RecordingStoreInstance>[0]>) => R,
): R => {
  const useStore = useContext(recordingStoreContext);

  if (!useStore) {
    throw new Error(
      "useRecordingStore must be used within a RecordingStoreProvider",
    );
  }

  return useStore(selector);
};

export const useRecordingStoreInstance = () => {
  const useStore = useContext(recordingStoreContext);
  return useStore;
};
