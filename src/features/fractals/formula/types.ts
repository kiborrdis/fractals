import { CalcNode } from "@/shared/libs/calcGraph";

export type CalcNodeResultType = "number" | "vector2" | "error";
export type CalcNodeResultTypeMap = Map<CalcNode, CalcNodeResultType>;
