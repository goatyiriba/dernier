/*
  # Create collaborative calendar entities

  1. New Tables
    - `collaborative_events`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `start_date` (timestamptz, required)
      - `end_date` (timestamptz)
      - `location` (text)
      - `meeting_type` (text)
      - `meeting_link` (text)
      - `priority` (text, default 'medium')
      - `status` (text, default 'pending')
      - `progress_percentage` (integer, default 0)
      - `created_by` (uuid, references employees)
      - `collaborators` (uuid array)
      - `responses` (jsonb)
      - `created_date` (timestamptz, default now)
      - `updated_date` (timestamptz, default now)

    - `collaboration_invitations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references collaborative_events)
      - `sender_id` (uuid, references employees)
      - `receiver_id` (uuid, references employees)
      - `message` (text)
      - `status` (text, default 'sent')
      - `response_message` (text)
      - `invitation_type` (text, default 'collaboration')
      - `urgency` (text, default 'medium')
      - `expires_at` (timestamptz)
      - `responded_at` (timestamptz)
      - `created_date` (timestamptz, default now)

    - `collaboration_comments`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references collaborative_events)
      - `author_id` (uuid, references employees)
      - `content` (text, required)
      - `comment_type` (text, default 'comment')
      - `created_date` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create collaborative events table
CREATE TABLE IF NOT EXISTS collaborative_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  meeting_type text DEFAULT 'in_person',
  meeting_link text,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_by uuid REFERENCES employees(id) ON DELETE CASCADE,
  collaborators uuid[],
  responses jsonb DEFAULT '[]'::jsonb,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

-- Create collaboration invitations table
CREATE TABLE IF NOT EXISTS collaboration_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES collaborative_events(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'sent',
  response_message text,
  invitation_type text DEFAULT 'collaboration',
  urgency text DEFAULT 'medium',
  expires_at timestamptz,
  responded_at timestamptz,
  created_date timestamptz DEFAULT now()
);

-- Create collaboration comments table
CREATE TABLE IF NOT EXISTS collaboration_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES collaborative_events(id) ON DELETE CASCADE,
  author_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  content text NOT NULL,
  comment_type text DEFAULT 'comment',
  created_date timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collaborative_events_created_by ON collaborative_events(created_by);
CREATE INDEX IF NOT EXISTS idx_collaborative_events_start_date ON collaborative_events(start_date);
CREATE INDEX IF NOT EXISTS idx_collaborative_events_status ON collaborative_events(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_event_id ON collaboration_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_receiver_id ON collaboration_invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_sender_id ON collaboration_invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_comments_event_id ON collaboration_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_comments_author_id ON collaboration_comments(author_id);

-- Enable Row Level Security
ALTER TABLE collaborative_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for collaborative_events
CREATE POLICY "Users can view events they created or are collaborators in"
  ON collaborative_events
  FOR SELECT
  USING (
    created_by IN (SELECT id FROM employees WHERE profile_id = auth.uid())
    OR 
    (SELECT id FROM employees WHERE profile_id = auth.uid()) = ANY(collaborators)
  );

CREATE POLICY "Users can create collaborative events"
  ON collaborative_events
  FOR INSERT
  WITH CHECK (
    created_by IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

CREATE POLICY "Event creators can update their events"
  ON collaborative_events
  FOR UPDATE
  USING (
    created_by IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

CREATE POLICY "Event creators can delete their events"
  ON collaborative_events
  FOR DELETE
  USING (
    created_by IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

-- Create RLS policies for collaboration_invitations
CREATE POLICY "Users can view invitations they sent or received"
  ON collaboration_invitations
  FOR SELECT
  USING (
    sender_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
    OR 
    receiver_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

CREATE POLICY "Users can create invitations"
  ON collaboration_invitations
  FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

CREATE POLICY "Users can update invitations they received"
  ON collaboration_invitations
  FOR UPDATE
  USING (
    receiver_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
    OR
    sender_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

-- Create RLS policies for collaboration_comments
CREATE POLICY "Users can view comments on events they have access to"
  ON collaboration_comments
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM collaborative_events 
      WHERE created_by IN (SELECT id FROM employees WHERE profile_id = auth.uid())
      OR (SELECT id FROM employees WHERE profile_id = auth.uid()) = ANY(collaborators)
    )
  );

CREATE POLICY "Users can create comments on events they have access to"
  ON collaboration_comments
  FOR INSERT
  WITH CHECK (
    author_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
    AND
    event_id IN (
      SELECT id FROM collaborative_events 
      WHERE created_by IN (SELECT id FROM employees WHERE profile_id = auth.uid())
      OR (SELECT id FROM employees WHERE profile_id = auth.uid()) = ANY(collaborators)
    )
  );

CREATE POLICY "Users can update their own comments"
  ON collaboration_comments
  FOR UPDATE
  USING (
    author_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

CREATE POLICY "Users can delete their own comments"
  ON collaboration_comments
  FOR DELETE
  USING (
    author_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
  );

-- Create triggers for updated_date
CREATE OR REPLACE FUNCTION update_collaborative_events_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collaborative_events_updated_date_trigger
  BEFORE UPDATE ON collaborative_events
  FOR EACH ROW
  EXECUTE FUNCTION update_collaborative_events_updated_date();