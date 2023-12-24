import { SocialBar } from '@/components';
import Introduction from './Introduction';

const Hero = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-12 bg-gray-900 text-gray-200">
      <Introduction />
      <SocialBar />
    </div>
  );
};

export default Hero;
