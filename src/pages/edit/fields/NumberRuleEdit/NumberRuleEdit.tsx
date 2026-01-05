import { Stack, Group, ActionIcon, Tooltip } from "@mantine/core";
import { memo, ReactNode, useCallback, useId } from "react";
import { EditorNumberInput } from "@/shared/ui/EditorNumberInput";
import { TbMathMaxMin, TbLine } from "react-icons/tb";
import {
  changeRulePeriod,
  NumberBuildRule,
  RangeNumberRule,
  RuleType,
  StaticNumberRule,
  StepNumberRule,
} from "@/shared/libs/numberRule";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { EditorLabel } from "../../ui/EditorLabel";
import styles from "./NumberRuleEdit.module.css";

const RuleLabel = ({
  htmlFor,
  tooltipLabel,
  icon,
  labelText,
  docKeys,
  onClick,
  canSwitchType = true,
}: {
  htmlFor?: string;
  tooltipLabel: string | undefined;
  icon?: ReactNode;
  labelText: string | undefined;
  docKeys?: string | undefined;
  onClick?: () => void;
  canSwitchType?: boolean;
}) => (
  <EditorLabel
    htmlFor={htmlFor}
    size='xs'
    docKeys={docKeys}
    leftSection={
      canSwitchType && icon ? (
        <div className={styles.iconWrapper}>
          <Tooltip label={tooltipLabel} openDelay={750}>
            <ActionIcon size={12} variant='transparent' onClick={onClick}>
              {icon}
            </ActionIcon>
          </Tooltip>
        </div>
      ) : undefined
    }
  >
    {labelText}
  </EditorLabel>
);

export const NumberRuleEdit = memo(
  (props: {
    name: string;
    label?: string;
    docKey?: string;
    max: number;
    min: number;
    minRange: number;
    step: number;
    value: NumberBuildRule;
    decimalScale?: number;
    staticOrientation?: "horizontal" | "vertical";
    canSwitchType?: boolean;
    onChange: (name: string, value: NumberBuildRule) => void;
  }) => {
    let content: ReactNode = null;
    const {
      value,
      staticOrientation = "vertical",
      canSwitchType = true,
    } = props;

    if (value.t === RuleType.StaticNumber) {
      content = (
        <StaticNumberRuleEdit
          {...props}
          orientation={staticOrientation}
          canSwitchType={canSwitchType}
          value={value}
        />
      );
    }

    if (value.t === RuleType.StepNumber) {
      content = (
        <StepNumberRuleEdit
          {...props}
          canSwitchType={canSwitchType}
          value={value}
        />
      );
    }

    if (value.t === RuleType.RangeNumber) {
      content = (
        <RangeNumberRuleEdit
          {...props}
          canSwitchType={canSwitchType}
          value={value}
        />
      );
    }

    return <Stack gap='xs'>{content}</Stack>;
  },
);
NumberRuleEdit.displayName = "NumberRuleEdit";

const StaticNumberRuleEdit = ({
  name,
  label,
  docKey,
  value,
  min,
  max,
  step,
  minRange,
  orientation,
  canSwitchType = true,
  onChange,
  decimalScale = 7,
}: {
  name: string;
  label?: string;
  docKey?: string;
  max: number;
  min: number;
  minRange: number;
  step: number;
  value: StaticNumberRule;
  decimalScale?: number;
  orientation?: "horizontal" | "vertical";
  canSwitchType?: boolean;
  onChange: (name: string, value: NumberBuildRule) => void;
}) => {
  const onChangeStaticValue = useCallback(
    (newValue: number) => {
      onChange(name, {
        t: RuleType.StaticNumber,
        value: Number(newValue),
      });
    },
    [name, onChange],
  );
  const id = useId();
  const labelNode = (
    <RuleLabel
      htmlFor={id}
      tooltipLabel='Const'
      icon={<TbLine />}
      labelText={label}
      docKeys={mergeDocKeys(docKey, "static-rule")}
      canSwitchType={canSwitchType}
      onClick={() => {
        onChange(name, {
          t: RuleType.RangeNumber,
          range: [
            Math.max(value.value - 10 * minRange, min),
            Math.min(value.value + 10 * minRange, max),
          ],
          period: 1,
          phase: 0,
        });
      }}
    />
  );
  const inputNode = (
    <EditorNumberInput
      id={id}
      label={orientation === "vertical" ? labelNode : undefined}
      decimalScale={decimalScale}
      value={value.value}
      onChange={onChangeStaticValue}
      min={min}
      max={max}
      step={step}
    />
  );

  if (orientation === "vertical") {
    return inputNode;
  }

  return <LabelContainer label={labelNode}>{inputNode}</LabelContainer>;
};

const StepNumberRuleEdit = ({
  name,
  label,
  docKey,
  value,
  min,
  max,
  step,
  canSwitchType = true,
  onChange,
  decimalScale = 7,
}: {
  name: string;
  label?: string;
  docKey?: string;
  max: number;
  min: number;
  minRange: number;
  step: number;
  value: StepNumberRule;
  decimalScale?: number;
  canSwitchType?: boolean;
  onChange: (name: string, value: NumberBuildRule) => void;
}) => {
  return (
    <Stack>
      <LabelContainer
        label={
          <RuleLabel
            tooltipLabel='Step'
            icon={<TbMathMaxMin />}
            labelText={label ? `${label} From-To` : "From-To"}
            docKeys={mergeDocKeys(docKey, "step-rule")}
            canSwitchType={canSwitchType}
            onClick={() => {
              onChange(name, {
                t: RuleType.StaticNumber,
                value: (value.range[0] + value.range[1]) / 2,
              } satisfies StaticNumberRule);
            }}
          />
        }
      >
        <EditorNumberInput
          decimalScale={decimalScale}
          value={value.range[0]}
          onChange={(newValue) => {
            onChange(name, {
              ...value,
              range: [Number(newValue), value.range[1]],
            } satisfies StepNumberRule);
          }}
          min={min}
          max={max}
          step={step}
        />
        <EditorNumberInput
          decimalScale={decimalScale}
          value={value.range[1]}
          onChange={(newValue) => {
            onChange(name, {
              ...value,
              range: [value.range[0], Number(newValue)],
            } satisfies StepNumberRule);
          }}
          min={min}
          max={max}
          step={step}
        />
      </LabelContainer>

      <LabelContainer
        label={<RuleLabel tooltipLabel='Step' labelText={`Period (s)`} />}
      >
        <EditorNumberInput
          decimalScale={decimalScale}
          value={value.transitions.reduce((a, b) => a + b.len, 0)}
          onChange={(newValue) => {
            if (newValue === 0) {
              return;
            }

            onChange(name, changeRulePeriod(value, Number(newValue)));
          }}
          min={1}
          max={10000}
          step={1}
        />
      </LabelContainer>
    </Stack>
  );
};

const RangeNumberRuleEdit = ({
  name,
  label,
  max,
  min,
  step,
  docKey,
  value,
  canSwitchType = true,
  onChange,
  decimalScale = 7,
}: {
  name: string;
  label?: string;
  docKey?: string;
  max: number;
  min: number;
  minRange: number;
  step: number;
  value: RangeNumberRule;
  decimalScale?: number;
  canSwitchType?: boolean;
  onChange: (name: string, value: NumberBuildRule) => void;
}) => {
  return (
    <Stack gap='xs'>
      <LabelContainer
        label={
          <RuleLabel
            tooltipLabel='Range'
            icon={<TbMathMaxMin />}
            labelText={label ? `${label} From-To` : "From-To"}
            docKeys={mergeDocKeys(docKey, "range-rule")}
            canSwitchType={canSwitchType}
            onClick={() => {
              onChange(name, {
                t: RuleType.StaticNumber,
                value: (value.range[0] + value.range[1]) / 2,
              });
            }}
          />
        }
      >
        <EditorNumberInput
          decimalScale={decimalScale}
          value={value.range[0]}
          onChange={(newValue) => {
            onChange(name, {
              t: RuleType.RangeNumber,
              range: [Number(newValue), value.range[1]],
              period: value.period,
              phase: value.phase,
            });
          }}
          min={min}
          max={max}
          step={step}
        />
        <EditorNumberInput
          decimalScale={decimalScale}
          value={value.range[1]}
          onChange={(newValue) => {
            onChange(name, {
              t: RuleType.RangeNumber,
              range: [value.range[0], Number(newValue)],
              period: value.period,
              phase: value.phase,
            });
          }}
          min={min}
          max={max}
          step={step}
        />
      </LabelContainer>

      <LabelContainer
        label={
          <RuleLabel tooltipLabel='Range' labelText={`Period/Phase (s)`} />
        }
      >
        <EditorNumberInput
          decimalScale={0}
          value={value.period}
          onChange={(newValue) => {
            const newCycle = Number(newValue);

            onChange(name, {
              t: RuleType.RangeNumber,
              range: value.range,
              period: newCycle,
              phase: newValue ? value.phase % (newCycle * 2) : 0,
            });
          }}
          step={1}
        />

        <EditorNumberInput
          decimalScale={1}
          value={value.phase}
          onChange={(newValue) => {
            const newPhase = Number(newValue);

            onChange(name, {
              t: RuleType.RangeNumber,
              range: value.range,
              period: value.period,
              phase: value.period ? newPhase % value.period : 0,
            });
          }}
          step={0.1}
        />
      </LabelContainer>
    </Stack>
  );
};

const LabelContainer = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Group w='100%' gap='xs' justify='flex-start' wrap='nowrap'>
      <div className={styles.labelFlex}>{label}</div>
      <Group flex={1} gap='xs' wrap='nowrap'>
        {children}
      </Group>
    </Group>
  );
};
