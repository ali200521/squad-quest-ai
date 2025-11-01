-- ============================================
-- Create Bot Profiles for Code Battle
-- ============================================

-- Create bot profiles with fixed UUIDs
INSERT INTO profiles (id, username, display_name, current_level, total_xp)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CodeNinja', 'CodeNinja', 3, 2500),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'DevMaster', 'DevMaster', 4, 3200),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'BugHunter', 'BugHunter', 2, 1800),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'PixelPro', 'PixelPro', 3, 2700),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'DataDragon', 'DataDragon', 4, 3500)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  current_level = EXCLUDED.current_level,
  total_xp = EXCLUDED.total_xp;

-- Add skill levels for bots across all skill areas
INSERT INTO user_skill_levels (user_id, skill_area_id, level, xp, assessment_completed)
SELECT 
  p.id,
  sa.id,
  FLOOR(RANDOM() * 4 + 1)::INTEGER, -- Random level 1-5
  FLOOR(RANDOM() * 1000)::INTEGER, -- Random XP 0-1000
  true
FROM profiles p
CROSS JOIN skill_areas sa
WHERE p.id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000005'::uuid
)
ON CONFLICT (user_id, skill_area_id) 
DO UPDATE SET
  level = EXCLUDED.level,
  xp = EXCLUDED.xp,
  assessment_completed = true;