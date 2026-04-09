import { SegmentedControl } from "@mantine/core";
import { ColoringMode } from "@/features/fractals";
import { useActions } from "../../stores/editStore/data/useActions";
import { useColoringRules } from "../../stores/editStore/data/useColoringRules";
import { useSetting } from "../../stores/settings";
import { ColoringLayersAccordion } from "./ColoringLayersAccordion";
import { InterationColoringEdit } from "../../fields/IterationColoringEdit/InterationColoringEdit";
import { TrapColoringEdit } from "../../fields/TrapColoringEdit/TrapColoringEdit";
import { BorderColoringEdit } from "../../fields/BorderColoringEdit/BorderColoringEdit";
import { NormalColoringEdit } from "../../fields/NormalColoringEdit/NormalColoringEdit";
import { EditorLabel } from "../../ui/EditorLabel";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { SettingsSection } from "./SettingsSection";

export const ColoringSettings = () => {
  const coloringLayers = useSetting("coloringLayers");
  const normalColoring = useSetting("normalColoring");
  const coloring = useColoringRules();
  const { replaceColoringMode } = useActions();

  if (coloringLayers) {
    return <ColoringLayersAccordion />;
  }

  const activeMode = coloring[0]?.[0] ?? ColoringMode.Iterations;
  const activeTab = String(activeMode);

  const handleTabChange = (value: string) => {
    replaceColoringMode(0, Number(value) as ColoringMode);
  };

  const tabData = [
    { value: String(ColoringMode.Iterations), label: "Gradient" },
    { value: String(ColoringMode.Border), label: "Border" },
    { value: String(ColoringMode.Trap), label: "Trap" },
    ...(normalColoring
      ? [
          { value: String(ColoringMode.Normal), label: "Normal" },
          { value: String(ColoringMode.StripesAverage), label: "Stripes" },
        ]
      : []),
  ];

  return (
    <SettingsSection>
      <EditorLabel docKeys={mergeDocKeys("coloring")}>Coloring</EditorLabel>
      <SegmentedControl
        value={activeTab}
        data={tabData}
        size='xs'
        onChange={handleTabChange}
        fullWidth
      />
      {activeMode === ColoringMode.Iterations && (
        <InterationColoringEdit coloringIndex={0} />
      )}
      {activeMode === ColoringMode.Border && (
        <BorderColoringEdit coloringIndex={0} />
      )}
      {activeMode === ColoringMode.Trap && (
        <TrapColoringEdit coloringIndex={0} />
      )}
      {activeMode === ColoringMode.Normal && (
        <NormalColoringEdit coloringIndex={0} />
      )}
    </SettingsSection>
  );
};
