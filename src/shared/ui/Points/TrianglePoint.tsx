import { BiChevronLeft } from "react-icons/bi";

export const TrianglePoint = ({ angle }: { angle: number }) => (
  <BiChevronLeft size={24} style={{ transform: `rotate(${angle}rad)` }} />
);
