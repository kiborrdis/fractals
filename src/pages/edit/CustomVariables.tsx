import { Button, Chip, Group, Stack, TextInput, Select } from "@mantine/core";
import { memo, useCallback, useState } from "react";
import { useActions } from "./store/data/useActions";
import { useFractalRules } from "./store/data/useFractalParamsData";
import { NumberRuleEdit } from "./NumberRuleEdit";
import { Vector2RuleEdit } from "./Vector2RuleEdit";
import { NumberBuildRule } from "@/shared/libs/numberRule";

type VariableType = "number" | "vector2";

const isNumberRule = (
  value: NumberBuildRule | [NumberBuildRule, NumberBuildRule]
): value is NumberBuildRule => {
  return !Array.isArray(value);
};

const isVector2Rule = (
  value: NumberBuildRule | [NumberBuildRule, NumberBuildRule]
): value is [NumberBuildRule, NumberBuildRule] => {
  return Array.isArray(value);
};

const CreateVariableForm = memo(
  ({
    onComplete,
    existingNames,
  }: {
    onComplete: (name: string, type: VariableType) => void;
    existingNames: string[];
  }) => {
    const [newVarName, setNewVarName] = useState("");
    const [newVarType, setNewVarType] = useState<VariableType>("number");

    const handleCreate = useCallback(() => {
      if (!newVarName.trim()) {
        return;
      }

      if (existingNames.includes(newVarName)) {
        alert("Variable with this name already exists");
        return;
      }

      onComplete(newVarName, newVarType);
      setNewVarName("");
      setNewVarType("number");
    }, [newVarName, newVarType, onComplete, existingNames]);

    return (
      <Stack gap="sm">
        <TextInput
          label="Variable Name"
          placeholder="Enter variable name"
          value={newVarName}
          onChange={(e) => setNewVarName(e.currentTarget.value)}
        />
        <Select
          label="Variable Type"
          value={newVarType}
          onChange={(value) => setNewVarType(value as VariableType)}
          data={[
            { value: "number", label: "Number" },
            { value: "vector2", label: "Vector2" },
          ]}
        />
        <Button onClick={handleCreate} size="sm">
          Create Variable
        </Button>
      </Stack>
    );
  }
);
CreateVariableForm.displayName = "CreateVariableForm";

export const CustomVariables = memo(() => {
  const { customVariableCreate, customVariableDelete, customRuleChange } =
    useActions();
  const fractal = useFractalRules();
  const customVars = fractal.custom;

  const [selectedVar, setSelectedVar] = useState<string | null>(null);

  const variableNames = Object.keys(customVars);
  const isCreatingNew = selectedVar === "__create_new__";

  const handleChipChange = useCallback((value: string | string[]) => {
    if (typeof value === "string") {
      setSelectedVar(value);
    }
  }, []);

  const handleCreateVariable = useCallback(
    (name: string, type: VariableType) => {
      console.log("Creating variable:", name, type);
      customVariableCreate(name, type);
      setSelectedVar(name);
    },
    [customVariableCreate]
  );

  const handleDeleteVariable = useCallback(() => {
    if (selectedVar && selectedVar !== "__create_new__") {
      customVariableDelete(selectedVar);
      setSelectedVar(null);
    }
  }, [selectedVar, customVariableDelete]);

  const handleNumberRuleChange = useCallback(
    (_name: string, value: NumberBuildRule) => {
      if (selectedVar && selectedVar !== "__create_new__") {
        customRuleChange([selectedVar], value);
      }
    },
    [selectedVar, customRuleChange]
  );

  const handleVector2RuleChange = useCallback(
    (_name: string, value: [NumberBuildRule, NumberBuildRule]) => {
      if (selectedVar && selectedVar !== "__create_new__") {
        customRuleChange([selectedVar], value);
      }
    },
    [selectedVar, customRuleChange]
  );

  const selectedValue = selectedVar && customVars[selectedVar];

  return (
    <Stack gap="md">
      <Chip.Group value={selectedVar || undefined} onChange={handleChipChange}>
        <Group gap="xs">
          {variableNames.map((varName) => (
            <Chip key={varName} value={varName}>
              {varName}
            </Chip>
          ))}
          <Chip value="__create_new__">+</Chip>
        </Group>
      </Chip.Group>

      {isCreatingNew && (
        <CreateVariableForm
          onComplete={handleCreateVariable}
          existingNames={variableNames}
        />
      )}

      {selectedVar && selectedVar !== "__create_new__" && selectedValue && (
        <Stack gap="sm">
          {isNumberRule(selectedValue) ? (
            <NumberRuleEdit
              name={selectedVar}
              label={selectedVar}
              min={-100}
              max={100}
              step={0.1}
              minRange={1}
              value={selectedValue}
              onChange={handleNumberRuleChange}
            />
          ) : isVector2Rule(selectedValue) ? (
            <Vector2RuleEdit
              name={selectedVar}
              sublabels={["X", "Y"]}
              min={-100}
              max={100}
              step={0.1}
              minRange={1}
              value={selectedValue}
              onChange={handleVector2RuleChange}
            />
          ) : null}

          <Button color="red" onClick={handleDeleteVariable} size="sm">
            Delete Variable
          </Button>
        </Stack>
      )}
    </Stack>
  );
});
CustomVariables.displayName = "CustomVariables";
