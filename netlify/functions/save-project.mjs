import { neon } from '@netlify/neon';

export default async (req) => {
  const sql = neon();

  try {
    const project = await req.json();

    await sql`
      INSERT INTO projects (id, name, category, status, priority, description, start_date, due_date, notes, sort_order, financial, progress_history, updated_at)
      VALUES (${project.id}, ${project.name}, ${project.category}, ${project.status}, ${project.priority || 'none'}, ${project.description || ''}, ${project.startDate || ''}, ${project.dueDate || ''}, ${project.notes || ''}, ${project.sortOrder || 0}, ${project.financial ? JSON.stringify(project.financial) : null}::jsonb, ${JSON.stringify(project.progressHistory || [])}::jsonb, NOW())
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

    await sql`DELETE FROM milestones WHERE project_id = ${project.id}`;

    if (project.milestones && project.milestones.length > 0) {
      for (let i = 0; i < project.milestones.length; i++) {
        const m = project.milestones[i];
        const result = await sql`
          INSERT INTO milestones (project_id, text, done, sort_order)
          VALUES (${project.id}, ${m.text}, ${m.done || false}, ${i})
          RETURNING id
        `;
        const milestoneId = result[0].id;

        if (m.subtasks && m.subtasks.length > 0) {
          for (let j = 0; j < m.subtasks.length; j++) {
            const st = m.subtasks[j];
            await sql`
              INSERT INTO subtasks (milestone_id, text, done, sort_order)
              VALUES (${milestoneId}, ${st.text}, ${st.done || false}, ${j})
            `;
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

export const config = { path: '/api/projects', method: 'POST' };
