export const findCellWithMostGreen = (
  bitmap: Uint8ClampedArray,
  width: number,
  height: number,
  gridSize: number,
): [number, number] | null => {
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  let maxGreen = -1;
  let maxCell: [number, number] = [0, 0];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      let greenSum = 0;

      const startX = Math.floor(col * cellWidth);
      const endX = Math.floor((col + 1) * cellWidth);
      const startY = Math.floor(row * cellHeight);
      const endY = Math.floor((row + 1) * cellHeight);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const index = (y * width + x) * 4;
          greenSum += bitmap[index + 1];
        }
      }
      if (row === 4 && col === 4) {
        console.log(`Cell [${col}, ${row}], green sum: ${greenSum}`);
      }
      if (greenSum > maxGreen) {
        maxGreen = greenSum;
        maxCell = [col, row];
      }
    }
  }
  console.log("Max green sum:", maxGreen, "at cell", maxCell);
  // color all red cells yellow in the winning cell for debugging
  const startX = Math.floor(maxCell[0] * cellWidth);
  const endX = Math.floor((maxCell[0] + 1) * cellWidth);
  const startY = Math.floor(maxCell[1] * cellHeight);
  const endY = Math.floor((maxCell[1] + 1) * cellHeight);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (y * width + x) * 4;
      const r = bitmap[index];
      // If pixel is 255 level red, change to yellow
      if (r === 255) {
        bitmap[index + 1] = 255; // Set green channel to max
      }
    }
  }

  if (maxGreen <= 0) {
    return null;
  }

  return [gridSize - 1 - maxCell[1], maxCell[0]];
};
