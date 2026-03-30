import {
  Vector2BSplineRule,
  convertRuleOrArrayToResult,
} from "@/shared/libs/numberRule";
import { PointsEdit } from "@/shared/ui/GraphEdit";
import { TrianglePoint } from "@/shared/ui/Points/TrianglePoint";
import { useCurrentTime } from "../../stores/editStore/data/useCurrentTime";

export const GraphSplinePositionIndicator = ({
  rule,
}: {
  rule: Vector2BSplineRule;
}) => {
  const currTime = useCurrentTime();

  const timeToUse = currTime;

  const prevPosition = convertRuleOrArrayToResult(rule, Math.max(timeToUse - 1, 0));
  const currPosition = convertRuleOrArrayToResult(rule, timeToUse);
  const direction = [
    currPosition[0] - prevPosition[0],
    currPosition[1] - prevPosition[1],
  ];

  const angle = Math.atan2(direction[1], direction[0]);

  return (
    <PointsEdit
      points={[currPosition]}
      renderPoint={() => <TrianglePoint angle={angle + Math.PI} />}
    />
  );
};
