/*
  # CuraLink Database Schema

  ## Overview
  Complete database schema for CuraLink platform connecting patients and researchers.

  ## New Tables

  ### 1. profiles
  User profiles for both patients and researchers with role-based fields
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - Full name
  - `role` (text) - Either 'patient' or 'researcher'
  - `location` (text) - City, country
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. patient_profiles
  Extended profile information for patients
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `conditions` (jsonb) - Array of medical conditions
  - `symptoms` (text) - Patient-described symptoms
  - `interests` (jsonb) - Research interests and keywords
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. researcher_profiles
  Extended profile information for researchers
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `specialties` (jsonb) - Array of specialties
  - `research_interests` (jsonb) - Array of research interests
  - `orcid` (text) - ORCID identifier
  - `researchgate_url` (text) - ResearchGate profile URL
  - `bio` (text) - Professional biography
  - `available_for_meetings` (boolean) - Availability flag
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. clinical_trials
  Clinical trials information
  - `id` (uuid, primary key)
  - `nct_id` (text) - ClinicalTrials.gov NCT ID
  - `title` (text) - Trial title
  - `description` (text) - Full description
  - `summary` (text) - AI-generated summary
  - `phase` (text) - Trial phase
  - `status` (text) - Recruitment status
  - `conditions` (jsonb) - Related conditions
  - `location` (text) - Trial location
  - `contact_email` (text) - Contact information
  - `eligibility` (text) - Eligibility criteria
  - `created_by` (uuid) - Researcher who added it (if applicable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. publications
  Medical publications and research papers
  - `id` (uuid, primary key)
  - `title` (text) - Publication title
  - `authors` (jsonb) - Array of authors
  - `abstract` (text) - Full abstract
  - `summary` (text) - AI-generated summary
  - `doi` (text) - DOI identifier
  - `pubmed_id` (text) - PubMed ID
  - `journal` (text) - Journal name
  - `publication_date` (date) - Publication date
  - `keywords` (jsonb) - Keywords and topics
  - `url` (text) - Link to full paper
  - `created_at` (timestamptz)

  ### 6. forums
  Forum categories and communities
  - `id` (uuid, primary key)
  - `name` (text) - Forum name
  - `description` (text) - Forum description
  - `category` (text) - Main category
  - `created_by` (uuid) - Researcher who created it
  - `created_at` (timestamptz)

  ### 7. forum_posts
  Forum posts and questions
  - `id` (uuid, primary key)
  - `forum_id` (uuid, foreign key) - References forums
  - `user_id` (uuid, foreign key) - References profiles
  - `title` (text) - Post title
  - `content` (text) - Post content
  - `is_question` (boolean) - Whether it's a question
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. forum_replies
  Replies to forum posts
  - `id` (uuid, primary key)
  - `post_id` (uuid, foreign key) - References forum_posts
  - `user_id` (uuid, foreign key) - References profiles
  - `content` (text) - Reply content
  - `created_at` (timestamptz)

  ### 9. favorites
  Saved items for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `item_type` (text) - Type: 'trial', 'publication', 'expert'
  - `item_id` (uuid) - ID of the saved item
  - `created_at` (timestamptz)

  ### 10. meeting_requests
  Meeting requests between patients and researchers
  - `id` (uuid, primary key)
  - `requester_id` (uuid, foreign key) - Patient requesting
  - `researcher_id` (uuid, foreign key) - Researcher being requested
  - `status` (text) - Status: 'pending', 'accepted', 'declined'
  - `message` (text) - Request message
  - `created_at` (timestamptz)

  ### 11. connections
  Researcher-to-researcher connections
  - `id` (uuid, primary key)
  - `requester_id` (uuid, foreign key) - Researcher requesting
  - `recipient_id` (uuid, foreign key) - Researcher receiving
  - `status` (text) - Status: 'pending', 'accepted', 'declined'
  - `created_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies for authenticated users to manage their own data
  - Researchers can manage their clinical trials and forums
  - Patients can only post questions, researchers can reply
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('patient', 'researcher')),
  location text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create patient_profiles table
CREATE TABLE IF NOT EXISTS patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  conditions jsonb DEFAULT '[]'::jsonb,
  symptoms text,
  interests jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patient profile"
  ON patient_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patient profile"
  ON patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patient profile"
  ON patient_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create researcher_profiles table
CREATE TABLE IF NOT EXISTS researcher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  specialties jsonb DEFAULT '[]'::jsonb,
  research_interests jsonb DEFAULT '[]'::jsonb,
  orcid text,
  researchgate_url text,
  bio text,
  available_for_meetings boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE researcher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view researcher profiles"
  ON researcher_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Researchers can insert own profile"
  ON researcher_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Researchers can update own profile"
  ON researcher_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create clinical_trials table
CREATE TABLE IF NOT EXISTS clinical_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nct_id text UNIQUE,
  title text NOT NULL,
  description text,
  summary text,
  phase text,
  status text,
  conditions jsonb DEFAULT '[]'::jsonb,
  location text,
  contact_email text,
  eligibility text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clinical trials"
  ON clinical_trials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Researchers can insert clinical trials"
  ON clinical_trials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'researcher'
    )
  );

CREATE POLICY "Researchers can update own clinical trials"
  ON clinical_trials FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create publications table
CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  authors jsonb DEFAULT '[]'::jsonb,
  abstract text,
  summary text,
  doi text,
  pubmed_id text,
  journal text,
  publication_date date,
  keywords jsonb DEFAULT '[]'::jsonb,
  url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view publications"
  ON publications FOR SELECT
  TO authenticated
  USING (true);

-- Create forums table
CREATE TABLE IF NOT EXISTS forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forums"
  ON forums FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Researchers can create forums"
  ON forums FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'researcher'
    )
  );

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_question boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum posts"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create forum posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forum posts"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum replies"
  ON forum_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Researchers can create forum replies"
  ON forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'researcher'
    )
  );

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('trial', 'publication', 'expert')),
  item_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create meeting_requests table
CREATE TABLE IF NOT EXISTS meeting_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  researcher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting requests"
  ON meeting_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = researcher_id);

CREATE POLICY "Patients can create meeting requests"
  ON meeting_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = requester_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'patient'
    )
  );

CREATE POLICY "Researchers can update meeting request status"
  ON meeting_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = researcher_id)
  WITH CHECK (auth.uid() = researcher_id);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Researchers can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = requester_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'researcher'
    )
  );

CREATE POLICY "Researchers can update connection status"
  ON connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_conditions ON clinical_trials USING gin(conditions);
CREATE INDEX IF NOT EXISTS idx_publications_keywords ON publications USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_id ON forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
