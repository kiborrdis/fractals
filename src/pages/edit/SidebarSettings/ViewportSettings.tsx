import {
  useMantineTheme,
  Stack,
  Text,
  Group,
  Tooltip,
  ActionIcon,
  Divider,
} from "@mantine/core";
import {
  FiMaximize,
  FiRefreshCcw,
  FiChevronUp,
  FiChevronLeft,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { HiMagnifyingGlassPlus, HiMagnifyingGlassMinus } from "react-icons/hi2";
import { useActions } from "../store/data/useActions";
import { useSelectAreaActive } from "../store/data/useSelectAreaActive";

export const ViewportSettings = () => {
  const { resetViewport, magnifyViewport, moveViewport, toggleAreaSelection } =
    useActions();
  const selectAreaActive = useSelectAreaActive();
  const theme = useMantineTheme();

  return (
    <Stack gap='md'>
      <Text size='sm' fw={500} c='dimmed'>
        Viewport Controls
      </Text>
      <Group justify='space-evenly' gap={0} wrap='nowrap'>
        <Stack gap='xs' align='center'>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
            Area
          </Text>
          <Tooltip label='Select area' position='bottom' withArrow>
            <ActionIcon
              variant={selectAreaActive ? "filled" : "outline"}
              onClick={toggleAreaSelection}
            >
              <FiMaximize />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Reset viewport' position='bottom' withArrow>
            <ActionIcon variant='outline' color='red' onClick={resetViewport}>
              <FiRefreshCcw />
            </ActionIcon>
          </Tooltip>
        </Stack>

        <Divider orientation='vertical' />

        <Stack gap='xs' align='center'>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
            Zoom
          </Text>
          <Tooltip label='Zoom in' position='bottom' withArrow>
            <ActionIcon
              color='blue'
              variant='outline'
              onClick={() => magnifyViewport(0.5)}
            >
              <HiMagnifyingGlassPlus />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Zoom out' position='bottom' withArrow>
            <ActionIcon
              color='blue'
              variant='outline'
              onClick={() => magnifyViewport(2)}
            >
              <HiMagnifyingGlassMinus />
            </ActionIcon>
          </Tooltip>
        </Stack>

        <Divider orientation='vertical' />

        <Stack gap='xs' align='center'>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
            Move
          </Text>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto auto",
              gap: theme.spacing.xs,
            }}
          >
            <div />
            <Tooltip label='Move up' position='top' withArrow>
              <ActionIcon
                variant='outline'
                onClick={() => moveViewport("u", 0.25)}
              >
                <FiChevronUp />
              </ActionIcon>
            </Tooltip>
            <div />
            <Tooltip label='Move left' position='left' withArrow>
              <ActionIcon
                variant='outline'
                onClick={() => moveViewport("l", 0.25)}
              >
                <FiChevronLeft />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='Move down' position='bottom' withArrow>
              <ActionIcon
                variant='outline'
                onClick={() => moveViewport("d", 0.25)}
              >
                <FiChevronDown />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='Move right' position='right' withArrow>
              <ActionIcon
                variant='outline'
                onClick={() => moveViewport("r", 0.25)}
              >
                <FiChevronRight />
              </ActionIcon>
            </Tooltip>
          </div>
        </Stack>
      </Group>
    </Stack>
  );
};
