import { EditFractal } from "@/pages/edit/EditFractal";
import { RandomFractal } from "@/pages/random-fractal/RandomFractal";
import { ViewFractal } from "@/pages/view/ViewFractal";
import { Simulation } from "@/pages/sim/Simulation";
import { Showcase } from "./pages/showcase/Showcase";

function App() {
  const path = window.location.pathname;

  if (path === "/edit") {
    return <EditFractal />;
  } else if (path === "/view") {
    return <ViewFractal />;
  } else if (path === "/sim") {
    return <Simulation />;
  } else if (path === "/showcase") {
    return <Showcase />;
  }

  return <RandomFractal />;
}

export default App;
