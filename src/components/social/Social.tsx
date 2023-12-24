import React from 'react';
import { cn } from '@/utils/cn';

type SocialProps = {
  Icon: any;
  link: string;
  text?: string;
  className?: string;
  others?: any;
};

const Social = ({ Icon, link, text, className, others }: SocialProps) => {
  const cls = [
    'w-10 h-10 bg-transparent text-white rounded-full p-2 ring-2 ring-cyan-700',
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
