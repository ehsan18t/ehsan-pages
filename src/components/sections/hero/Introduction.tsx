import { MotionH1, MotionP } from "@/motion";

const Introduction = () => {
  return (
    <div className="h-full flex flex-col gap-2 justify-center">
      <div className="text-2xl sm:text-3xl font-semibold">Hi, I am</div>
      <div className="text-4xl sm:text-6xl font-bold text-primary">
        <MotionH1
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ehsan Khan
        </MotionH1>
      </div>
      <div className="w-full p-1 sm:text-xl text-justify pt-5">
        <MotionP
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          A passionate software developer, competitive programer and quick
          learner. Love to code and learn new things. I mostly work with Django,
          React, NextJS, TailWindCSS, JavaScript, TypeScript, MySQL and Git.
          Additionally, I have experience with C++, C, Java, PostgreSQL,
          MongoDB, Docker, Linux, and many more. Currently, I am actively
          working on a NLP based project with Django, NextJS, TypeScript, and
          MySQL.
        </MotionP>
      </div>
    </div>
  );
};

export default Introduction;
