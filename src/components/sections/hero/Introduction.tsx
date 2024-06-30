import Info from "@/data";
import { MotionH1, MotionP } from "@/motion";

const Introduction = () => {
  return (
    <div className="flex order-2 md:order-none flex-col gap-2 justify-center col-span-2">
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
  );
};

export default Introduction;
