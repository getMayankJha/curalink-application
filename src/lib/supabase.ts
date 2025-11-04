import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'patient' | 'researcher';
  location: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PatientProfile = {
  id: string;
  user_id: string;
  conditions: string[];
  symptoms: string | null;
  interests: string[];
  created_at: string;
  updated_at: string;
};

export type ResearcherProfile = {
  id: string;
  user_id: string;
  specialties: string[];
  research_interests: string[];
  orcid: string | null;
  researchgate_url: string | null;
  bio: string | null;
  available_for_meetings: boolean;
  created_at: string;
  updated_at: string;
};

export type ClinicalTrial = {
  id: string;
  nct_id: string | null;
  title: string;
  description: string | null;
  summary: string | null;
  phase: string | null;
  status: string | null;
  conditions: string[];
  location: string | null;
  contact_email: string | null;
  eligibility: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  summary: string | null;
  doi: string | null;
  pubmed_id: string | null;
  journal: string | null;
  publication_date: string | null;
  keywords: string[];
  url: string | null;
  created_at: string;
};

export type Forum = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  created_by: string | null;
  created_at: string;
};

export type ForumPost = {
  id: string;
  forum_id: string;
  user_id: string;
  title: string;
  content: string;
  is_question: boolean;
  created_at: string;
  updated_at: string;
};

export type ForumReply = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  item_type: 'trial' | 'publication' | 'expert';
  item_id: string;
  created_at: string;
};

export type MeetingRequest = {
  id: string;
  requester_id: string;
  researcher_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
};

export type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};
