/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { DisplayFractals, FractalParamsBuildRules } from "@/features/fractals";
import { ReactNode, useEffect, useRef, useState } from "react";
import styles from "./FractalGallery.module.css";
import { Link } from "@tanstack/react-router";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

export const FractalGallery = ({
  hasNextPage,
  fractals,
  currentPage,
}: {
  hasNextPage: boolean;
  currentPage: number;
  fractals: { name: string; params: FractalParamsBuildRules }[];
}) => {
  const [prev, setPrev] = useState<{
    page: number;
    fractals: { name: string; params: FractalParamsBuildRules }[];
  } | null>({
    page: currentPage,
    fractals,
  });
  const previousSnapshotRef = useRef({
    page: currentPage,
    fractals,
  });
  const hidePreviousTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const previousSnapshot = previousSnapshotRef.current;
    if (previousSnapshot.page !== currentPage) {
      setPrev(previousSnapshot);
    }

    previousSnapshotRef.current = {
      page: currentPage,
      fractals,
    };

    if (hidePreviousTimeoutRef.current) {
      clearTimeout(hidePreviousTimeoutRef.current);
    }

    hidePreviousTimeoutRef.current = setTimeout(() => {
      hidePreviousTimeoutRef.current = null;
      setPrev({
        fractals,
        page: currentPage,
      });
    }, 1000);

    return () => {
      if (hidePreviousTimeoutRef.current) {
        clearTimeout(hidePreviousTimeoutRef.current);
        hidePreviousTimeoutRef.current = null;
      }
    };
  }, [fractals, currentPage]);

  return (
    <div className={styles.mainContainer}>
      {prev && prev.page !== currentPage && (
        <Fractals key={prev.page} play={false} fractals={prev.fractals} />
      )}
      <Fractals key={currentPage} play fractals={fractals} />
      <div className={styles.navigation}>
        {currentPage > 1 ? (
          <Link
            className={styles.navLink}
            to='/gallery'
            search={{
              p: currentPage - 1,
            }}
          >
            <BlurButton>
              <BiChevronLeft size={32} />
            </BlurButton>
          </Link>
        ) : (
          <div />
        )}
        {hasNextPage ? (
          <Link
            className={styles.navLink}
            to='/gallery'
            search={{
              p: currentPage + 1,
            }}
          >
            <BlurButton>
              <BiChevronRight size={32} />
            </BlurButton>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

const Fractals = ({
  fractals,
  play,
}: {
  fractals: { name: string; params: FractalParamsBuildRules }[];
  play: boolean;
}) => {
  const indexGrid = toGrid(fractals.map((_, i) => i));
  const paramsGrid = indexGrid.map((row) =>
    row.map((index) => fractals[index].params),
  );

  return (
    <div className={styles.fractalsContainer}>
      <DisplayFractals play={play} fractals={paramsGrid} />
      <div className={styles.overlay}>
        <Grid
          grid={indexGrid}
          renderCell={(index) => (
            <div className={styles.item}>
              {fractals[index].name && (
                <div className={styles.name}>{fractals[index].name}</div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

const BlurButton = ({ children }: { children?: ReactNode }) => {
  return (
    <button className={styles.blurButton} onClick={() => {}}>
      {children}
    </button>
  );
};

const toGrid = <T extends unknown>(fractals: T[]): T[][] => {
  if (fractals.length === 0) {
    return [[]];
  }

  const maxPerRow = Math.ceil(Math.sqrt(fractals.length));
  const rows = Math.ceil(fractals.length / maxPerRow);
  const grid: T[][] = [];
  for (let i = 0; i < rows; i++) {
    grid.push(fractals.slice(i * maxPerRow, (i + 1) * maxPerRow));
  }
  return grid;
};

const Grid = ({
  grid,
  renderCell,
}: {
  grid: number[][];
  renderCell: (index: number) => ReactNode;
}) => {
  return (
    <div className={styles.grid}>
      {grid.map((row, r) => (
        <div key={r} className={styles.gridRow}>
          {row.map((index, c) => (
            <div
              key={c}
              className={styles.gridCell}
              onClick={() => renderCell(index)}
            >
              {renderCell(index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
