import { AiFillGithub, AiFillLinkedin } from 'react-icons/ai';
import { BiLogoGmail, BiLogoTelegram } from 'react-icons/bi';
import { BsDiscord } from 'react-icons/bs';

import { MotionDiv } from '@/motion';

import Social from './Social';

const SocialBar = () => {
  return (
    <MotionDiv
      className="flex gap-3"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Social Icon={AiFillGithub} link="https://github.com/ehsan18t" />
      <Social Icon={AiFillLinkedin} link="https://linkedin.com/in/ehsan18t" />
      <Social Icon={BiLogoGmail} link="mailto:ehsan18t@gmail.com" />
      <Social Icon={BiLogoTelegram} link="https://t.me/ehsan18t" />
      <Social Icon={BsDiscord} link="https://discord.com/users/xcarl3t" />
    </MotionDiv>
  );
};

export default SocialBar;
