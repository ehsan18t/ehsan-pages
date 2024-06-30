import { SocialBar } from "@/components";
import Introduction from "./Introduction";

const Hero = () => {
  return (
    <section className="h-screen flex flex-col items-center justify-between pt-0 py-12 px-6 sm:px-12 md:px-32 lg:px-40 bg-background text-foreground">
      <Introduction />
      <SocialBar />
    </section>
  );
};

export default Hero;
