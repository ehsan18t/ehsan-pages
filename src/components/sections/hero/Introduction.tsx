import Info from "@/data";
import {
  MotionCircle,
  MotionDiv,
  MotionH1,
  MotionP,
  MotionSVG,
} from "@/motion";

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
      <MotionDiv
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative h-48 w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 xl:h-72 xl:w-72 flex justify-center rounded-full md:col-span-1"
      >
        <img
          src={Info.image}
          alt="profile"
          className="rounded-full object-cover mix-blend-lighten"
        />
        <MotionSVG
          className="absolute"
          fill="transparent"
          viewBox="0 0 506 506"
          xmlns="http://www.w3.org/2000/svg"
        >
          <MotionCircle
            r="250"
            cx="253"
            cy="253"
            stroke="#40A578"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ strokeDasharray: "24 10 0 0" }}
            animate={{
              strokeDasharray: ["15 120 25 25", "16 25 92 72", "4 250 22 22"],
              rotate: [120, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </MotionSVG>
      </MotionDiv>
    </div>
  );
};

export default Introduction;
