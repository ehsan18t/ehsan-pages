import type { Experience } from "@/data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef, useState } from "react";
import ExperienceCard from "./ExperienceCard";
import "./experience.css";

gsap.registerPlugin(ScrollTrigger);

interface ExperienceGraphProps {
  experiences: Experience[];
}

const NODE_COLOR = "oklch(var(--accent-500))";

const ExperienceGraph: React.FC<ExperienceGraphProps> = ({ experiences }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(
    null,
  );
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(700);

  // Layout config - all in pixels
  const nodeSpacing = 180;
  const startY = 60;
  const leftXPercent = 30;
  const rightXPercent = 70;

  const getXPercent = (i: number) =>
    i % 2 === 0 ? leftXPercent : rightXPercent;
  const getXPixel = (i: number) => (getXPercent(i) / 100) * containerWidth;
  const getY = (i: number) => startY + i * nodeSpacing;
  const graphHeight = getY(experiences.length - 1) + 100;

  // Update container width on resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (graphRef.current) {
        setContainerWidth(graphRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Generate SVG path with pixel coordinates
  const generatePath = () => {
    if (!experiences.length) return "";

    let d = `M ${getXPixel(0)} ${getY(0)}`;

    for (let i = 1; i < experiences.length; i++) {
      const px = getXPixel(i - 1),
        py = getY(i - 1);
      const cx = getXPixel(i),
        cy = getY(i);
      const midY = (py + cy) / 2;
      d += ` C ${px} ${midY}, ${cx} ${midY}, ${cx} ${cy}`;
    }

    return d;
  };

  // Hover handlers
  const clearClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearClose();
    closeTimeoutRef.current = window.setTimeout(
      () => setActiveExperience(null),
      150,
    );
  };

  const handleHover = (exp: Experience, e: React.MouseEvent) => {
    clearClose();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isLeft = experiences.indexOf(exp) % 2 === 0;

    let x = isLeft ? rect.right + 20 : rect.left - 400;
    let y = rect.top - 50 + window.scrollY;

    // Clamp to viewport
    x = Math.max(20, Math.min(x + window.scrollX, window.innerWidth - 420));
    y = Math.max(
      window.scrollY + 20,
      Math.min(y, window.scrollY + window.innerHeight - 500),
    );

    setCardPosition({ x, y });
    setActiveExperience(exp);
  };

  // GSAP scroll animation
  useGSAP(
    () => {
      if (
        !graphRef.current ||
        !pathRef.current ||
        !glowRef.current ||
        containerWidth === 0
      )
        return;

      const len = pathRef.current.getTotalLength();

      gsap.set([pathRef.current, glowRef.current], {
        strokeDasharray: len,
        strokeDashoffset: len,
      });

      gsap.to([pathRef.current, glowRef.current], {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: graphRef.current,
          start: "top 75%",
          end: "bottom 40%",
          scrub: 0.5,
        },
      });

      gsap.utils.toArray<HTMLElement>(".commit-node").forEach((node, i) => {
        gsap.set(node, { scale: 0, opacity: 0 });
        gsap.to(node, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: graphRef.current,
            start: `top+=${i * 120} 85%`,
            toggleActions: "play none none reverse",
          },
        });
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: containerRef, dependencies: [experiences, containerWidth] },
  );

  return (
    <div ref={containerRef} className="experience-graph-container">
      {/* Desktop Timeline */}
      <div
        ref={graphRef}
        className="experience-graph"
        style={{ height: graphHeight }}
      >
        <svg
          className="graph-svg"
          viewBox={`0 0 ${containerWidth} ${graphHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            ref={glowRef}
            d={generatePath()}
            fill="none"
            stroke="oklch(var(--accent-500) / 0.3)"
            strokeWidth="6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            ref={pathRef}
            d={generatePath()}
            fill="none"
            stroke="oklch(var(--accent-500))"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#lineGlow)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {experiences.map((exp, i) => (
          <div
            key={exp.id}
            className={`commit-node ${i % 2 === 0 ? "node-left" : "node-right"} ${activeExperience?.id === exp.id ? "active" : ""}`}
            style={
              {
                left: `${getXPercent(i)}%`,
                top: getY(i),
                "--node-color": NODE_COLOR,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => handleHover(exp, e)}
            onMouseLeave={scheduleClose}
            tabIndex={0}
            role="button"
            aria-label={`${exp.role} at ${exp.company}`}
          >
            <div className="node-inner" />
            <div className="node-label">
              <span className="node-date">{exp.startDate}</span>
              <span className="node-role">{exp.role}</span>
              <span className="node-company">{exp.company}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile List */}
      <div className="mobile-experience-list">
        {experiences.map((exp, i) => (
          <div
            key={exp.id}
            className="mobile-experience-item"
            style={
              {
                "--node-color": NODE_COLOR,
                "--delay": `${i * 0.1}s`,
              } as React.CSSProperties
            }
          >
            <div className="mobile-node-line">
              <div className="mobile-node" />
              {i < experiences.length - 1 && (
                <div className="mobile-connector" />
              )}
            </div>
            <div className="mobile-content">
              <span className="mobile-date">
                {exp.startDate} — {exp.endDate}
              </span>
              <h4 className="mobile-role">{exp.role}</h4>
              <p className="mobile-company">{exp.company}</p>
              <ul className="mobile-description-list">
                {exp.description.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
              <div className="mobile-tech-stack">
                {exp.techStack.map((tech) => (
                  <span key={tech} className="mobile-tech-pill">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeExperience && (
        <ExperienceCard
          experience={activeExperience}
          position={cardPosition}
          laneColor={NODE_COLOR}
          onMouseEnter={clearClose}
          onMouseLeave={scheduleClose}
        />
      )}
    </div>
  );
};

export default ExperienceGraph;
