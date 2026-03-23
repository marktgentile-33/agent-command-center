import { neon } from '@netlify/neon';

export default async (req) => {
  const sql = neon();

  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Project ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await sql`DELETE FROM projects WHERE id = ${id}`;

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

export const config = { path: '/api/projects', method: 'DELETE' };
