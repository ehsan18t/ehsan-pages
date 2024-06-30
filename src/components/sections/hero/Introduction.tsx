import Info from "@/data";
import { MotionH1, MotionP } from "@/motion";

const Introduction = () => {
  return (
    <div className="h-full w-full grid md:grid-cols-3 md:gap-10 gap-4 items-center justify-self-center justify-items-center">
      <div className="flex order-2 md:order-none md:col-span-2 flex-col gap-2 justify-center">
        <div className="text-2xl sm:text-3xl font-semibold">Hi, I am</div>
        <div className="text-4xl sm:text-6xl font-bold text-primary">
          <MotionH1
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {Info.name}
          </MotionH1>
        </div>
        <div className="p-1 text-justify pt-5">
          <MotionP
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {Info.description}
          </MotionP>
        </div>
      </div>
      <div className="h-48 w-48 flex justify-center border-2 rounded-full md:col-span-1"></div>
    </div>
  );
};

export default Introduction;
