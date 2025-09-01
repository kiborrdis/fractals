import { useEditStore } from "../provider";

export const useSelectAreaActive = () => {
  const selectAreaActive = useEditStore((state) => state.selectAreaActive);

  return selectAreaActive;
};
