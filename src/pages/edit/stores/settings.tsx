import { createStorageSlot } from "@/shared/hooks/useStorageSlot";
import { ReactNode, useCallback } from "react";

type Settings = {
  version: number;
  data: {
    timelineRange: boolean;
    coloringLayers: boolean;
    advancedMirroringSettings: boolean;
    normalColoring: boolean;
    singlePointMap: boolean;
  };
};

const initialSettings: Settings = {
  version: 5,
  data: {
    timelineRange: false,
    coloringLayers: false,
    
    advancedMirroringSettings: false,
    normalColoring: false,

    singlePointMap: false,
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

export const useSetting = (key: keyof Settings["data"]) => {
  const [slot] = useSlot();

  return slot.data[key];
};

export const useSettings = () => {
  const [slot, setSlot] = useSlot();

  const setSetting = useCallback(
    (key: keyof Settings["data"], value: boolean) => {
      setSlot((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [key]: value,
        },
      }));
    },
    [setSlot],
  );

  return { settings: slot.data, setSetting };
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SlotProvider initialValue={initialSettings} storageKey='user'>
      {children}
    </SlotProvider>
  );
};
