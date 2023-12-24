import { cn } from '@/utils/cn';
import React from 'react';

type SocialProps = {
  Icon: any;
  link: string;
  text?: string;
  className?: string;
  others?: any;
};

const Social = ({ Icon, link, text, className, others }: SocialProps) => {
  const cls = [
    'w-10 h-10 text-white p-2 rounded-full ring-2 ring-cyan-700',
    'hover:text-cyan-200 hover:ring-4',
    'transition duration-300 ease-in-out',
  ];

  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Icon className={cn(cls, className)} {...others} />
      {text}
    </a>
  );
};

export default Social;
