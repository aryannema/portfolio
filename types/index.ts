export interface Profile {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  email: string;
  github_url: string | null;
  linkedin_url: string | null;
  location: string;
  available: boolean;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  view_count: number;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Window {
  id: string;
  title: string;
  icon: string;
  component: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
