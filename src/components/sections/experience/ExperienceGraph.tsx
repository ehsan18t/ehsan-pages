import type { Experience } from "@/data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useCallback, useRef, useState } from "react";
import ExperienceCard from "./ExperienceCard";
import "./experience.css";

gsap.registerPlugin(ScrollTrigger);

interface ExperienceGraphProps {
  experiences: Experience[];
}

// Lane configuration (uniform color)
const LANES = {
  frontend: { label: "Frontend", color: "oklch(var(--accent-500))", offset: 0 },
  backend: { label: "Backend", color: "oklch(var(--accent-500))", offset: 1 },
  fullstack: {
    label: "Fullstack",
    color: "oklch(var(--accent-500))",
    offset: 0.5,
  },
};

const ExperienceGraph: React.FC<ExperienceGraphProps> = ({ experiences }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(
    null,
  );
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

  // Generate SVG path for the commit line with wave effect
  const generatePath = useCallback(() => {
    if (!experiences.length) return "";

    const nodeSpacing = 180;
    const startX = 60;
    const laneWidth = 100;
    const waveAmplitude = 25; // Horizontal wave for visual interest

    let path = "";
    let prevX = startX;
    let prevY = 40;

    experiences.forEach((exp, index) => {
      const laneOffset = LANES[exp.lane].offset;
      const baseX = startX + laneOffset * laneWidth;
      // Add subtle wave effect based on index for visual interest
      const waveOffset = Math.sin(index * 0.8) * waveAmplitude;
      const x = baseX + waveOffset;
      const y = 40 + index * nodeSpacing;

      if (index === 0) {
        path = `M ${x} ${y}`;
      } else {
        // Create smooth bezier curves between nodes with more curve control
        const midY = (prevY + y) / 2;
        const controlX1 = prevX + (x - prevX) * 0.1;
        const controlX2 = x - (x - prevX) * 0.1;
        path += ` C ${controlX1} ${midY - 30}, ${controlX2} ${midY + 30}, ${x} ${y}`;
      }

      prevX = x;
      prevY = y;
    });

    return path;
  }, [experiences]);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveExperience(null);
    }, 140);
  };

  // Handle node hover - show card on mouse enter
  const handleNodeHover = (
    exp: Experience,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    clearCloseTimeout();
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const cardWidth = 420;
    const cardHeight = 480;
    const gap = 20;

    const prefersAbove = rect.bottom + cardHeight > window.innerHeight;
    const preferredX = rect.right + gap + scrollX;
    const preferredY = prefersAbove
      ? rect.top - cardHeight - gap + scrollY
      : rect.top - gap + scrollY;

    const maxX = scrollX + window.innerWidth - cardWidth;
    const maxY = scrollY + window.innerHeight - cardHeight;
    const clampedX = Math.min(Math.max(preferredX, scrollX + gap), maxX);
    const clampedY = Math.min(Math.max(preferredY, scrollY + gap), maxY);

    setCardPosition({
      x: clampedX,
      y: clampedY,
    });
    setActiveExperience(exp);
  };

  // Handle mouse leave - close card
  const handleNodeLeave = () => {
    scheduleClose();
  };

  const handleCardEnter = () => {
    clearCloseTimeout();
  };

  const handleCardLeave = () => {
    scheduleClose();
  };

  // GSAP animations
  useGSAP(
    () => {
      if (!containerRef.current || !graphRef.current) return;

      const nodes = gsap.utils.toArray<HTMLElement>(".commit-node");
      const yearMarkers = gsap.utils.toArray<HTMLElement>(".year-marker");
      const branchLines = gsap.utils.toArray<HTMLElement>(".branch-line");

      // Animate the main path drawing - adjusted end position for better sync
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: "none",
          scrollTrigger: {
            trigger: graphRef.current,
            start: "top 70%",
            end: "bottom 50%",
            scrub: 0.5,
          },
        });
      }

      // Animate nodes sequentially with more lenient trigger
      nodes.forEach((node, index) => {
        gsap.set(node, { scale: 0, opacity: 0 });

        gsap.to(node, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: graphRef.current,
            start: `top+=${index * 120} 90%`,
            toggleActions: "play none none reverse",
          },
        });
      });

      // Animate year markers
      yearMarkers.forEach((marker, index) => {
        gsap.set(marker, { opacity: 0, x: -20 });

        gsap.to(marker, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: graphRef.current,
            start: `top+=${index * 150} 90%`,
            toggleActions: "play none none reverse",
          },
        });
      });

      // Animate branch lines
      branchLines.forEach((line, index) => {
        gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

        gsap.to(line, {
          scaleX: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: graphRef.current,
            start: `top+=${index * 150} 90%`,
            toggleActions: "play none none reverse",
          },
        });
      });

      // Cleanup
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: containerRef, dependencies: [experiences] },
  );

  // Group experiences by year for markers
  const yearGroups = experiences.reduce(
    (acc, exp, index) => {
      const year = exp.startDate;
      if (!acc[year]) {
        acc[year] = { index, year };
      }
      return acc;
    },
    {} as Record<string, { index: number; year: string }>,
  );

  const nodeSpacing = 180;
  const graphHeight = (experiences.length - 1) * nodeSpacing + 200; // Increased padding

  return (
    <div ref={containerRef} className="experience-graph-container">
      {/* Main Graph */}
      <div
        ref={graphRef}
        className="experience-graph"
        style={{ height: graphHeight }}
      >
        {/* SVG for connection lines */}
        <svg
          className="graph-svg"
          viewBox={`0 0 300 ${graphHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(var(--accent-500))" />
              <stop offset="100%" stopColor="oklch(var(--accent-900))" />
            </linearGradient>
          </defs>

          {/* Main commit path */}
          <path
            ref={pathRef}
            d={generatePath()}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
            className="commit-path"
          />

          {/* Branch connection lines for merge commits */}
          {experiences.map((exp, index) => {
            if (!exp.isMergeCommit) return null;
            const y = 40 + index * nodeSpacing;
            return (
              <g key={`branch-${exp.id}`}>
                <line
                  x1="60"
                  y1={y}
                  x2="160"
                  y2={y}
                  stroke="oklch(var(--accent-500) / 0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="branch-line"
                />
              </g>
            );
          })}
        </svg>

        {/* Year Markers */}
        {Object.entries(yearGroups).map(([year, { index }]) => (
          <div
            key={year}
            className="year-marker"
            style={{ top: 40 + index * nodeSpacing - 10 }}
          >
            {year}
          </div>
        ))}

        {/* Commit Nodes */}
        {experiences.map((exp, index) => {
          const laneOffset = LANES[exp.lane].offset;
          const baseX = 60 + laneOffset * 100;
          // Match the wave effect from path generation
          const waveOffset = Math.sin(index * 0.8) * 25;
          const x = baseX + waveOffset;
          const y = 40 + index * nodeSpacing;

          return (
            <div
              key={exp.id}
              className={`commit-node ${exp.isMergeCommit ? "merge-commit" : ""} ${
                activeExperience?.id === exp.id ? "active" : ""
              }`}
              style={
                {
                  left: x,
                  top: y,
                  "--node-color": LANES[exp.lane].color,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => handleNodeHover(exp, e)}
              onMouseLeave={handleNodeLeave}
              onFocus={(e) =>
                handleNodeHover(
                  exp,
                  e as unknown as React.MouseEvent<HTMLDivElement>,
                )
              }
              onBlur={handleNodeLeave}
              tabIndex={0}
              role="button"
              aria-label={`${exp.role} at ${exp.company}`}
            >
              <div className="node-inner">
                {exp.isMergeCommit && <div className="merge-indicator" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Experience List - Outside the hidden graph */}
      <div className="mobile-experience-list">
        {experiences.map((exp, index) => (
          <div
            key={exp.id}
            className="mobile-experience-item"
            style={
              {
                "--node-color": LANES[exp.lane].color,
                "--delay": `${index * 0.1}s`,
              } as React.CSSProperties
            }
          >
            <div className="mobile-node-line">
              <div
                className={`mobile-node ${exp.isMergeCommit ? "merge" : ""}`}
              />
              {index < experiences.length - 1 && (
                <div className="mobile-connector" />
              )}
            </div>
            <div className="mobile-content">
              <div className="mobile-header">
                <span className="mobile-date">
                  {exp.startDate} — {exp.endDate}
                </span>
                <span className="mobile-lane-badge">{exp.lane}</span>
              </div>
              <h4 className="mobile-role">{exp.role}</h4>
              <p className="mobile-company">{exp.company}</p>
              <ul className="mobile-description-list">
                {exp.description.map((item, itemIndex) => (
                  <li key={`${exp.id}-desc-${itemIndex}`}>{item}</li>
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

      {/* Experience Card (Desktop) */}
      {activeExperience && (
        <ExperienceCard
          experience={activeExperience}
          position={cardPosition}
          laneColor={LANES[activeExperience.lane].color}
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleCardLeave}
        />
      )}
    </div>
  );
};

export default ExperienceGraph;
