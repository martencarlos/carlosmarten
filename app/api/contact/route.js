// app/api/contact/route.js
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';



export async function GET() {
  try {
    const res = await sql`SELECT * FROM contacts ORDER BY id DESC`;
    return NextResponse.json(res.rows); // Return the rows from the database
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Error fetching contacts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    await sql`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;

    return NextResponse.json({ message: 'Contact saved successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
  }
}

