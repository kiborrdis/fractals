import { EditFractal } from "./edit/EditFractal";
import { RandomFractal } from "./random-fractal/RandomFractal";
import { ViewFractal } from "./view/ViewFractal";

function App() {
  const path = window.location.pathname;
  console.log(path);

  if (path === "/edit") {
    return <EditFractal />;
  } else if (path === "/view") {
    return <ViewFractal />;
  }

  return <RandomFractal />;
}

export default App;


