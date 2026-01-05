import { createStorageSlot } from "@/shared/hooks/useStorageSlot";
import { ReactNode, useCallback } from "react";

type Settings = {
  timelineRange: boolean;
};

const initialSettings: Settings = {
  timelineRange: false,
};

const { useSlot, SlotProvider } = createStorageSlot<Settings>();

export const useSetting = (key: keyof Settings) => {
  const [slot] = useSlot();

  return slot[key];
};

export const useSettings = () => {
  const [slot, setSlot] = useSlot();

  const setSetting = useCallback(
    (key: keyof Settings, value: boolean) => {
      setSlot((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setSlot],
  );

  return [slot, setSetting];
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SlotProvider initialValue={initialSettings} storageKey='user'>
      {children}
    </SlotProvider>
  );
};
