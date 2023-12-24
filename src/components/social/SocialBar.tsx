import React from 'react';
import { AiFillGithub, AiFillLinkedin } from 'react-icons/ai';
import { BiLogoTelegram, BiLogoGmail } from 'react-icons/bi';
import { BsDiscord } from 'react-icons/bs';

import Social from './Social';

const SocialBar = () => {
  return (
    <div className="flex gap-3">
      <Social Icon={AiFillGithub} link="https://github.com/ehsan18t" />
      <Social Icon={AiFillLinkedin} link="https://linkedin.com/in/ehsan18t" />
      <Social Icon={BiLogoGmail} link="https://t.me/ehsan18t" />
      <Social Icon={BiLogoTelegram} link="https://discord.com/users/xcarl3t" />
      <Social Icon={BsDiscord} link="mailto:ehsan18t@gmail.com" />
    </div>
  );
};

export default SocialBar;
