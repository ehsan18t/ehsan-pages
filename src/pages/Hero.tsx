import Me from "@/components/Me";
import { StarsCanvas } from "@/components/canvas/StarsCanvas";
import TextSphere from "@/components/textSphere/TextSphere";
import { AiFillGithub, AiFillLinkedin } from "react-icons/ai";
import { BiLogoTelegram } from "react-icons/bi";
import { BsDiscord } from "react-icons/bs";

const App = () => {
  const socialIconClass =
    "w-10 h-10 p-2 ring-2 rounded-full ring-primary cursor-pointer hover:ring-4 hover:text-primary transition duration-300 ease-in-out";
  return (
    <div className="w-full h-full">
      <div className="w-full h-5/6 flex justify-between items-center px-10">
        <Me />
        <StarsCanvas />
        <TextSphere className="hidden md:block" />
      </div>
      <div className="px-24 flex gap-4 justify-center md:justify-start">
        <AiFillGithub className={socialIconClass} />
        <BiLogoTelegram className={socialIconClass} />
        <BsDiscord className={socialIconClass} />
        <AiFillLinkedin className={socialIconClass} />
      </div>
    </div>
  );
};

export default App;
