import { Button, Chip, Group, Stack, TextInput, Select } from "@mantine/core";
import { memo, useCallback, useMemo, useState } from "react";
import { useActions } from "../../stores/editStore/data/useActions";
import { useFractalCustomRules } from "../../stores/editStore/data/useFractalParamsData";
import { NumberRuleEdit } from "../NumberRuleEdit/NumberRuleEdit";
import {
  isNumberRule,
  isVector2Rule,
  NumberBuildRule,
  Vector2BulidRule,
} from "@/shared/libs/numberRule";
import { EditorLabel } from "../../ui/EditorLabel";
import { Vector2RuleEdit } from "../Vector2RuleEdit/Vector2RuleEdit";
import {
  CalcNodeType,
  forEachNodeChild,
  parseFormula,
} from "@/shared/libs/complexVariableFormula";
import { formulaVars, funcNameToSignature } from "@/features/fractals";
import { useFractalFormula } from "../../stores/editStore/data/useFractalFormula";

type VariableType = "number" | "vector2";

const docKeys = "custom-variables";

export const CustomVariables = memo(() => {
  const { customVariableCreate, customVariableDelete, customRuleChange } =
    useActions();
  const customVars = useFractalCustomRules();
  const formula = useFractalFormula();

  const varsInFormula = useMemo(() => {
    const varNames = new Set<string>();
    const node = formula ? parseFormula(formula) : null;
    if (!node) {
      return varNames;
    }

    forEachNodeChild(node, (child) => {
      if (child.t === CalcNodeType.Variable) {
        varNames.add(child.v);
      }
    });

    return varNames;
  }, [formula]);
  const [selectedVar, setSelectedVar] = useState<string | null>(null);

  const variableNames = Object.keys(customVars);
  const isCreatingNew = selectedVar === "__create_new__";

  const handleNumberRuleChange = useCallback(
    (_name: string, value: NumberBuildRule) => {
      if (selectedVar && selectedVar !== "__create_new__") {
        customRuleChange([selectedVar], value);
      }
    },
    [selectedVar, customRuleChange],
  );

  const handleVector2RuleChange = useCallback(
    (_name: string, value: Vector2BulidRule) => {
      if (selectedVar && selectedVar !== "__create_new__") {
        customRuleChange([selectedVar], value);
      }
    },
    [selectedVar, customRuleChange],
  );

  const selectedValue = selectedVar && customVars[selectedVar];

  return (
    <Stack gap='md'>
      <EditorLabel docKeys={docKeys}>Custom Variables</EditorLabel>
      <Chip.Group
        value={selectedVar || undefined}
        onChange={(value: string | string[]) => {
          if (typeof value === "string") {
            setSelectedVar(value);
          }
        }}
      >
        <Group gap='xs'>
          {variableNames.map((varName) => (
            <Chip key={varName} value={varName}>
              {varName}
            </Chip>
          ))}
          <Chip value='__create_new__'>+</Chip>
        </Group>
      </Chip.Group>

      {isCreatingNew && (
        <CreateVariableForm
          existingNames={variableNames}
          onComplete={(name: string, type: VariableType) => {
            customVariableCreate(name, type);
            setSelectedVar(name);
          }}
        />
      )}

      {selectedVar && selectedVar !== "__create_new__" && selectedValue && (
        <Stack gap='sm'>
          {isNumberRule(selectedValue) ? (
            <NumberRuleEdit
              name={selectedVar}
              label={selectedVar}
              min={-100000000000000000000000000}
              max={100000000000000000000000000}
              step={0.01}
              minRange={1}
              value={selectedValue}
              onChange={handleNumberRuleChange}
            />
          ) : isVector2Rule(selectedValue) ? (
            <Vector2RuleEdit
              label={selectedVar}
              name={selectedVar}
              sublabels={["X", "Y"]}
              min={-100}
              max={100}
              minRange={1}
              value={selectedValue}
              onChange={handleVector2RuleChange}
            />
          ) : (
            <div>ha</div>
          )}

          <Button
            color='red'
            disabled={varsInFormula.has(selectedVar)}
            onClick={() => {
              if (selectedVar && selectedVar !== "__create_new__") {
                customVariableDelete(selectedVar);
                setSelectedVar(null);
              }
            }}
          >
            Delete Variable
          </Button>
        </Stack>
      )}
    </Stack>
  );
});
CustomVariables.displayName = "CustomVariables";

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
    const [err, setErr] = useState<string | null>(null);
    const handleCreate = useCallback(() => {
      if (!newVarName.trim() || err) {
        return;
      }

      onComplete(newVarName, newVarType);
      setNewVarName("");
      setNewVarType("number");
    }, [newVarName, err, onComplete, newVarType]);

    return (
      <Stack gap='sm'>
        <Group align='flex-start'>
          <TextInput
            flex={2}
            label='Variable Name'
            placeholder='Enter variable name'
            value={newVarName}
            error={err}
            onChange={(e) => {
              const newVarName = e.currentTarget.value;
              setErr(null);
              if (formulaVars[newVarName] || funcNameToSignature[newVarName]) {
                setErr(
                  "Variable name conflicts with existing formula variable or function",
                );
              }

              if (existingNames.includes(newVarName)) {
                setErr("Variable with this name already exists");
              }

              setNewVarName(newVarName);
            }}
          />
          <Select
            flex={1}
            label='Variable Type'
            value={newVarType}
            onChange={(value) => setNewVarType(value as VariableType)}
            data={[
              { value: "number", label: "Number" },
              { value: "vector2", label: "Vector2" },
            ]}
          />
        </Group>
        <Button onClick={handleCreate} variant='outline'>
          Create Variable
        </Button>
      </Stack>
    );
  },
);
CreateVariableForm.displayName = "CreateVariableForm";
