import { createStorageSlot } from "@/shared/hooks/useStorageSlot";
import { ReactNode, useCallback } from "react";

type Settings = {
  version: number,
  data: {
  timelineRange: boolean;
  },
};

const initialSettings: Settings = {
  version: 1,
  data: {
    timelineRange: false,
  },
};

const { useSlot, SlotProvider } = createStorageSlot<Settings>({
  parse: (value) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed.version === initialSettings.version) {
        return parsed;
      } else {
        return initialSettings;
      }
    } catch {
      return initialSettings;
    }
  },
});

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
        data: {
          ...prev.data,
          [key]: value,
        }
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
