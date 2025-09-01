import { createContext, ReactNode, useContext } from "react"
import { createEditStore } from "./editStore"

export const editStoreContext = createContext<
  ReturnType<typeof createEditStore> | null
>(null);

export const EditStoreProvider = ({
  store,
  children,
}: {
  store: ReturnType<typeof createEditStore>,
  children: ReactNode
}) => {
  return (
    <editStoreContext.Provider value={store}>
      {children}
    </editStoreContext.Provider>
  );
}

export const useEditStore = <R,>(
  selector: (
    ...args: Parameters<Parameters<ReturnType<typeof createEditStore>>[0]>
  ) => R,
): R => {
  const useStore = useContext(editStoreContext);

  if (!useStore) {
    throw new Error('useEditStore must be used within a EditStoreProvider');
  }

  return useStore(selector)
}

export const useEditStoreInstance = () => {
  const useStore = useContext(editStoreContext)
  return useStore
}
