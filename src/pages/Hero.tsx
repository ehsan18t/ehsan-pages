import Introduction from "@/components/Introduction";
import { StarsCanvas } from "@/components/canvas/StarsCanvas";
import TextSphere from "@/components/textSphere/TextSphere";
import Social from "@/components/Social";

const Hero = () => {
  return (
    <div className="w-full h-full">
      <div className="h-full flex justify-between items-center px-4 md:px-10">
        <div className="h-full flex flex-col justify-between">
          <Introduction />
          <div className="flex-grow"></div>
          <Social />
        </div>
        <TextSphere className="hidden md:block" />
      </div>
      <StarsCanvas />
    </div>
  );
};

export default Hero;
