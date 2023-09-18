import { AiFillGithub, AiFillLinkedin } from "react-icons/ai";
import { BiLogoTelegram, BiLogoGmail } from "react-icons/bi";
import { BsDiscord } from "react-icons/bs";

const Social = () => {
  const socialIconClass =
    "w-10 h-10 p-2 ring-2 rounded-full ring-primary cursor-pointer hover:ring-4 hover:text-primary transition duration-300 ease-in-out";

  const handleSocialClick = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <div className="p-24 flex gap-4 justify-center md:justify-start">
      <AiFillGithub
        onClick={() => handleSocialClick("https://github.com/ehsan18t")}
        className={socialIconClass}
      />
      <AiFillLinkedin
        onClick={() => handleSocialClick("https://linkedin.com/in/ehsan18t")}
        className={socialIconClass}
      />
      <BiLogoTelegram
        onClick={() => handleSocialClick("https://t.me/ehsan18t")}
        className={socialIconClass}
      />
      <BsDiscord
        onClick={() => handleSocialClick("https://discord.com/users/xcarl3t")}
        className={socialIconClass}
      />
      <BiLogoGmail
        onClick={() => handleSocialClick("mailto:ehsan18t@gmail.com")}
        className={socialIconClass}
      />
    </div>
  );
};

export default Social;
