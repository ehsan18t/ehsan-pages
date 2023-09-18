import { useEffect } from "react";
import { words } from "./words";
import TagCloud, { TagCloudOptions } from "TagCloud";
import "./TextSphere.css";

const TextSphere = ({ className }: { className?: string }) => {
  useEffect(() => {
    const container = ".tagcloud";

    const options: TagCloudOptions = {
      radius: 300,
      maxSpeed: "normal",
      initSpeed: "slow",
      keep: true,
    };

    TagCloud(container, words, options);
  }, []);

  return (
    <>
      <div className={`text-Sphere ${className ? className : ""}`}>
        <span className="tagcloud"></span>
      </div>
    </>
  );
};

export default TextSphere;
