import { SocialBar } from "@/components";
import Introduction from "./Introduction";
import Photo from "./Photo";

const Hero = () => {
  return (
    <section className="h-screen pb-0 md:pb-20 px-6 sm:px-12 md:px-32 lg:px-40 bg-background text-foreground">
      <div className="h-4/5">
        <div className="h-full md:h-full w-full grid md:grid-cols-3 md:gap-10 items-center justify-self-center justify-items-center">
          <Introduction />
          <Photo />
        </div>
      </div>
      <SocialBar />
    </section>
  );
};

export default Hero;
