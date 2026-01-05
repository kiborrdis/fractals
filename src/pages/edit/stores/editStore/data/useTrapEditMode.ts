import { useEditStore } from "../provider";

export const useTrapEditMode = () => useEditStore((s) => s.trapEditMode);
