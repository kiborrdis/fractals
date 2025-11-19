import { useEditStore } from "../provider";

export const useActions = () => {
  const actions = useEditStore((state) => state.actions);
  
  return actions;
};
