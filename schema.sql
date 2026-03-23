-- Command Center Database Schema
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'New Project',
  category TEXT NOT NULL DEFAULT 'work',
  status TEXT NOT NULL DEFAULT 'upnext',
  priority TEXT NOT NULL DEFAULT 'none',
  description TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  due_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  financial JSONB DEFAULT NULL,
  progress_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS subtasks (
  id SERIAL PRIMARY KEY,
  milestone_id INTEGER NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author TEXT DEFAULT 'Team',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_milestone ON subtasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);