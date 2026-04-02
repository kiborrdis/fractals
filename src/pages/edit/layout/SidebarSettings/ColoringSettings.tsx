import { SegmentedControl } from "@mantine/core";
import { BlendMode, ColoringMode } from "@/features/fractals";
import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";
import { useActions } from "../../stores/editStore/data/useActions";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useSetting } from "../../stores/settings";
import { ColoringLayersAccordion } from "./ColoringLayersAccordion";
import { InterationColoringSettings } from "./InterationColoringSettings";
import { TrapColoringSettings } from "./TrapColoringSettings";
import { EditorLabel } from "../../ui/EditorLabel";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { SettingsSection } from "./SettingsSection";

const defaultTab = String(ColoringMode.Iterations);

export const ColoringSettings = () => {
  const coloringLayers = useSetting("coloringLayers");
  const normalColoring = useSetting("normalColoring");
  const [coloring] = useStaticRule("coloring");
  const { staticRuleChange } = useActions();

  if (coloringLayers) {
    return <ColoringLayersAccordion />;
  }

  const activeTab = coloring?.[0] ? String(coloring[0].type) : defaultTab;

  const handleTabChange = (value: string) => {
    staticRuleChange("coloring", [
      { type: Number(value) as ColoringMode, blend: BlendMode.Normal },
    ]);
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
      <EditorLabel docKeys={mergeDocKeys("coloring")}>
        Coloring
      </EditorLabel>
      <SegmentedControl
        value={activeTab}
        data={tabData}
        size='xs'
        onChange={handleTabChange}
        fullWidth
      />
      {activeTab === String(ColoringMode.Iterations) && <InterationColoringSettings />}
      {activeTab === String(ColoringMode.Border) && (
        <>
          <StaticRuleEdit name='borderColor' />
          <StaticRuleEdit name='borderIntensity' />
        </>
      )}
      {activeTab === String(ColoringMode.Trap) && <TrapColoringSettings />}
    </SettingsSection>
  );
};
