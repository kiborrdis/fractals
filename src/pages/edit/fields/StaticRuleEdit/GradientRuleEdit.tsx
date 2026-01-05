import { GradientStop } from "@/features/fractals";
import { EscapeColoringGradient } from "../GradientInput/EscapeColoringGradient";
import { EditorLabel } from "../../ui/EditorLabel";
import { useActions } from "../../stores/editStore/data/useActions";

export const GradientRuleEdit = ({
  value,
  onChange,
  name,
}: {
  value: GradientStop[];
  onChange: (name: "gradient", value: GradientStop[]) => void;
  name: "gradient";
}) => {
  const { staticParamOverride } = useActions();

  return (
    <>
      <EditorLabel docKeys={"iterations-gradient"}>
        Iterations Gradient
      </EditorLabel>
      <EscapeColoringGradient
        stops={value}
        onChange={(newStops) => onChange(name, newStops)}
        onPreview={(newStops) => staticParamOverride(name, newStops)}
      />
    </>
  );
};
