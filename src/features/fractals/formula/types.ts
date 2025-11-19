import { CalcNode } from "@/shared/libs/parseFormula";

export type CalcNodeResultType = "number" | "vector2" | "error";
export type CalcNodeResultTypeMap = Map<CalcNode, CalcNodeResultType>;
