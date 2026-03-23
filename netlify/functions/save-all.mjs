import { neon } from '@netlify/neon';

export default async (req) => {
  const sql = neon();

  try {
    const { projects } = await req.json();

    if (!projects || !Array.isArray(projects)) {
      return new Response(JSON.stringify({ error: 'projects array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existing = await sql`SELECT id FROM projects`;
    const existingIds = new Set(existing.map(e => e.id));
    const incomingIds = new Set(projects.map(p => p.id));

    for (const eid of existingIds) {
      if (!incomingIds.has(eid)) {
        await sql`DELETE FROM projects WHERE id = ${eid}`;
      }
    }

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];

      await sql`
        INSERT INTO projects (id, name, category, status, priority, description, start_date, due_date, notes, sort_order, financial, progress_history, updated_at)
        VALUES (${p.id}, ${p.name}, ${p.category}, ${p.status}, ${p.priority || 'none'}, ${p.description || ''}, ${p.startDate || ''}, ${p.dueDate || ''}, ${p.notes || ''}, ${i}, ${p.financial ? JSON.stringify(p.financial) : null}::jsonb, ${JSON.stringify(p.progressHistory || [])}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          priority = EXCLUDED.priority,
          description = EXCLUDED.description,
          start_date = EXCLUDED.start_date,
          due_date = EXCLUDED.due_date,
          notes = EXCLUDED.notes,
          sort_order = EXCLUDED.sort_order,
          financial = EXCLUDED.financial,
          progress_history = EXCLUDED.progress_history,
          updated_at = NOW()
      `;

      await sql`DELETE FROM milestones WHERE project_id = ${p.id}`;

      if (p.milestones && p.milestones.length > 0) {
        for (let mi = 0; mi < p.milestones.length; mi++) {
          const m = p.milestones[mi];
          const result = await sql`
            INSERT INTO milestones (project_id, text, done, sort_order)
            VALUES (${p.id}, ${m.text}, ${m.done || false}, ${mi})
            RETURNING id
          `;
          const milestoneId = result[0].id;

          if (m.subtasks && m.subtasks.length > 0) {
            for (let si = 0; si < m.subtasks.length; si++) {
              const st = m.subtasks[si];
              await sql`
                INSERT INTO subtasks (milestone_id, text, done, sort_order)
                VALUES (${milestoneId}, ${st.text}, ${st.done || false}, ${si})
              `;
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/save-all', method: 'POST' };
