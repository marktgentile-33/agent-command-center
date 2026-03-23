import { neon } from '@netlify/neon';

export default async (req) => {
  const sql = neon();

  try {
    const { projectId, text, author } = await req.json();

    if (!projectId || !text) {
      return new Response(JSON.stringify({ error: 'projectId and text required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await sql`
      INSERT INTO comments (project_id, text, author)
      VALUES (${projectId}, ${text}, ${author || 'Team'})
      RETURNING id, text, author, created_at as time
    `;

    return new Response(JSON.stringify(result[0]), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/comments', method: 'POST' };
