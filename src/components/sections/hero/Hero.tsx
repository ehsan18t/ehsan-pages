import { SocialBar } from "@/components";
import Introduction from "./Introduction";
import Photo from "./Photo";

const Hero = () => {
  return (
    <section className="h-screen flex flex-col items-center justify-between pt-0 py-12 px-6 sm:px-12 md:px-32 lg:px-40 bg-background text-foreground">
      <div className="h-full w-full grid md:grid-cols-3 md:gap-10 gap-4 items-center justify-self-center justify-items-center">
        <Introduction />
        <Photo />
      </div>
      <SocialBar />
    </section>
  );
};

export default Hero;
