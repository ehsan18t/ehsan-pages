import { Button } from "./components/ui/button";
import { StarsCanvas } from "./components/canvas/StarsCanvas";
import TextSphere from "@/components/textSphere/TextSphere";

const App = () => {
  return (
    <div className="w-full flex justify-end">
      <Button>Test</Button>
      <StarsCanvas />
      <TextSphere />
    </div>
  );
};

export default App;
