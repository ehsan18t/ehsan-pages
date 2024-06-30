import Info from "@/data";
import { MotionCircle, MotionDiv, MotionSVG } from "@/motion";

export default function Photo() {
  return (
    <div className="h-full w-full col-span-3 md:col-span-1 content-end md:content-center">
      <div className="flex justify-center">
        <MotionDiv
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative h-48 w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 xl:h-72 xl:w-72 flex justify-center items-center rounded-full"
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
    </div>
  );
}
