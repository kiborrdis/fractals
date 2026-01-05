import {
  Children,
  CSSProperties,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Group } from "@mantine/core";
import styles from "./TimelineFloatingPanelContainer.module.css";

const DURATION = 200;

type Status = "entering" | "present" | "exiting";

interface Entry {
  key: string;
  status: Status;
}

export const TimelineFloatingPanelContainer = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const elementMap = useRef<Map<string, ReactElement>>(new Map());
  const [entries, setEntries] = useState<Entry[]>([]);
  const latestEntries = useRef(entries);
  latestEntries.current = entries;

  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const incomingKeys = parseChildKeys(children);
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.key != null) {
      elementMap.current.set(String(child.key), child as ReactElement);
    }
  });

  const childKeyString = incomingKeys.join("|");

  useEffect(() => {
    const { next, toExit, toReenter, toEnter } = reconcileEntries(
      latestEntries.current,
      incomingKeys,
    );

    if (toExit.length === 0 && toReenter.length === 0 && toEnter.length === 0) {
      return;
    }

    setEntries(next);

    for (const key of toReenter) {
      const timer = exitTimers.current.get(key);
      if (timer) {
        clearTimeout(timer);
        exitTimers.current.delete(key);
      }
    }

    for (const key of toExit) {
      if (exitTimers.current.has(key)) continue;
      const timer = setTimeout(() => {
        setEntries((e) => e.filter((x) => x.key !== key));
        elementMap.current.delete(key);
        exitTimers.current.delete(key);
      }, DURATION + 60);
      exitTimers.current.set(key, timer);
    }
    // childKeyString is basicaly a hash of incomingKeys
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childKeyString]);

  useEffect(() => {
    const timers = exitTimers.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Flip entering entries to present so the CSS transition fires.
  useEffect(() => {
    const entering = entries.filter((e) => e.status === "entering");
    if (entering.length === 0) return;

    const enteringKeys = new Set(entering.map((e) => e.key));
    setEntries((prev) =>
      prev.map((e) =>
        enteringKeys.has(e.key) && e.status === "entering"
          ? { ...e, status: "present" }
          : e,
      ),
    );
  }, [entries]);

  return (
    <Group style={style} gap={4} align='flex-end' wrap='wrap'>
      {entries.map((entry) => (
        <div
          key={entry.key}
          className={`${styles.wrapper} ${styles[entry.status]}`}
        >
          <div className={styles.content}>
            {elementMap.current.get(entry.key)}
          </div>
        </div>
      ))}
    </Group>
  );
};

function reconcileEntries(
  prev: Entry[],
  incomingKeys: string[],
): {
  next: Entry[];
  toExit: string[];
  toReenter: string[];
  toEnter: string[];
} {
  const incomingSet = new Set(incomingKeys);
  const prevByKey = new Map(prev.map((e) => [e.key, e]));

  const toExit: string[] = [];
  const toReenter: string[] = [];
  const toEnter: string[] = [];

  const updated: Entry[] = prev.map((entry) => {
    if (incomingSet.has(entry.key)) {
      if (entry.status === "exiting") {
        toReenter.push(entry.key);
        return { ...entry, status: "entering" as Status };
      }
      return entry;
    } else {
      if (entry.status !== "exiting") {
        toExit.push(entry.key);
        return { ...entry, status: "exiting" as Status };
      }
      return entry;
    }
  });

  const newKeys = incomingKeys.filter((k) => !prevByKey.has(k));
  if (newKeys.length === 0) {
    return { next: updated, toExit, toReenter, toEnter };
  }

  const result: Entry[] = [...updated];
  for (const newKey of newKeys) {
    toEnter.push(newKey);
    const declaredIdx = incomingKeys.indexOf(newKey);
    let insertAt = result.length;
    for (let i = 0; i < result.length; i++) {
      const ri = incomingKeys.indexOf(result[i].key);
      if (ri !== -1 && ri > declaredIdx) {
        insertAt = i;
        break;
      }
    }
    result.splice(insertAt, 0, { key: newKey, status: "entering" });
  }

  return { next: result, toExit, toReenter, toEnter };
}

function parseChildKeys(children: ReactNode): string[] {
  const keys: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.key != null) {
      keys.push(String(child.key));
    }
  });
  return keys;
}
