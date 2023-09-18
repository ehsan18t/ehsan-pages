const Introduction = ({ className }: { className?: string }) => {
  return (
    <div
      className={`w-full h-full flex items-center justify-start md:pl-16 ${className}`}
    >
      <div>
        <div className="text-3xl font-semibold">Hi, I am</div>
        <div className="text-6xl font-bold text-primary">Ehsan Khan</div>
        <div className="w-full md:w-4/5 p-1 text-xl text-justify mt-5">
          A passionate software developer, competitive programer and quick
          learner. Love to code and learn new things
        </div>
      </div>
    </div>
  );
};

export default Introduction;
