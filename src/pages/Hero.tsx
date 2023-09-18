import Introduction from "@/components/Introduction";
import { StarsCanvas } from "@/components/canvas/StarsCanvas";
import TextSphere from "@/components/textSphere/TextSphere";
import { AiFillGithub, AiFillLinkedin } from "react-icons/ai";
import { BiLogoTelegram } from "react-icons/bi";
import { BsDiscord } from "react-icons/bs";

const Hero = () => {
  const socialIconClass =
    "w-10 h-10 p-2 ring-2 rounded-full ring-primary cursor-pointer hover:ring-4 hover:text-primary transition duration-300 ease-in-out";
  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center px-10">
        <div className="flex flex-col justify-between">
          <Introduction />
          <div className="px-24 flex gap-4 justify-center md:justify-start">
            <AiFillGithub className={socialIconClass} />
            <BiLogoTelegram className={socialIconClass} />
            <BsDiscord className={socialIconClass} />
            <AiFillLinkedin className={socialIconClass} />
          </div>
        </div>
        <TextSphere className="hidden md:block" />
      </div>
      <StarsCanvas />
    </div>
  );
};

export default Hero;
