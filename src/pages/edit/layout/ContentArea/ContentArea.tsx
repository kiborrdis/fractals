import { DisplayFractal } from "@/features/fractals";
import { FractalGraphOverlay } from "./FractalGraphOverlay";
import { useActions } from "../../stores/editStore/data/useActions";
import { useAnimationData } from "../../stores/editStore/data/useAnimationData";
import { useFractalParamsData } from "../../stores/editStore/data/useFractalParamsData";
import { useInitialLoopState } from "../../stores/editStore/data/useInitialLoopState";
import styles from "./ContentArea.module.css";

export const ContentArea = () => {
  const { play, timeMultiplier } = useAnimationData();
  const fractal = useFractalParamsData();
  const initialLoopState = useInitialLoopState();
  const { updateCurrentTime } = useActions();

  return (
    <div className={styles.contentContainer}>
      <DisplayFractal
        params={fractal}
        play={play}
        timeMultiplier={parseFloat(timeMultiplier)}
        initialLoopState={initialLoopState}
        onRender={updateCurrentTime}
      />
      <FractalGraphOverlay />
    </div>
  );
};
