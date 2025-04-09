// src/types.ts (Ensure imageUrls is an array)
export interface Project {
  title: string;
  shortDescription: string;
  // No long/detailed description needed for this design
  imageUrls: string[]; // Changed from imageUrl
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  imageLayout?: "cover" | "contain";
  backgroundStyle?: string; // Keep if using custom backgrounds per card
  layout?: string; // Keep if needed for other layout logic, unused here
}
