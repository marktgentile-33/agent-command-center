import { neon } from '@netlify/neon';

export default async () => {
  const sql = neon();

  try {
    const projects = await sql`
      SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC
    `;

    const milestones = await sql`
      SELECT * FROM milestones ORDER BY sort_order ASC, id ASC
    `;

    const subtasks = await sql`
      SELECT * FROM subtasks ORDER BY sort_order ASC, id ASC
    `;

    const comments = await sql`
      SELECT * FROM comments ORDER BY created_at ASC
    `;

    const result = projects.map(p => {
      const projMilestones = milestones
        .filter(m => m.project_id === p.id)
        .map(m => ({
          id: m.id,
          text: m.text,
          done: m.done,
          subtasks: subtasks
            .filter(s => s.milestone_id === m.id)
            .map(s => ({ id: s.id, text: s.text, done: s.done }))
        }));

      const projComments = comments
        .filter(c => c.project_id === p.id)
        .map(c => ({ id: c.id, text: c.text, author: c.author, time: c.created_at }));

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        status: p.status,
        priority: p.priority,
        description: p.description,
        startDate: p.start_date || '',
        dueDate: p.due_date || '',
        notes: p.notes || '',
        sortOrder: p.sort_order,
        financial: p.financial,
        progressHistory: p.progress_history || [],
        milestones: projMilestones,
        comments: projComments
      };
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/projects' };
