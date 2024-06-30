import Info from "@/data";
import { MotionDiv } from "@/motion";
import { AiFillGithub, AiFillLinkedin } from "react-icons/ai";
import { BiLogoGmail, BiLogoTelegram } from "react-icons/bi";
import { BsDiscord } from "react-icons/bs";

import Social from "./Social";

const SocialBar = () => {
  const socials = Info.socials;
  return (
    <MotionDiv
      className="flex gap-3 justify-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Social
        Icon={AiFillGithub}
        link={`https://github.com/${socials.github}`}
      />
      <Social
        Icon={AiFillLinkedin}
        link={`https://linkedin.com/in/${socials.linkedin}`}
      />
      <Social Icon={BiLogoGmail} link={`mailto:${socials.gmail}`} />
      <Social Icon={BiLogoTelegram} link={`https://t.me/${socials.telegram}`} />
      <Social
        Icon={BsDiscord}
        link={`https://discord.com/users/${socials.discord}`}
      />
    </MotionDiv>
  );
};

export default SocialBar;
