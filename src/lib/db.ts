import { sql } from '@vercel/postgres';

export async function getInstruments() {
  try {
    const result = await sql`SELECT * FROM instruments ORDER BY created_at DESC`;
    return result.rows;
  } catch (error) {
    console.error('Error loading instruments:', error);
    return [];
  }
}

export async function createInstrument(data: {
  loader_name: string;
  instrument_name: string;
  part_number: string;
  serial_number: string;
  photo_url?: string | null;
}) {
  try {
    const result = await sql`
      INSERT INTO instruments (loader_name, instrument_name, part_number, serial_number, photo_url)
      VALUES (${data.loader_name}, ${data.instrument_name}, ${data.part_number}, ${data.serial_number}, ${data.photo_url ?? null})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating instrument:', error);
    throw error;
  }
}

export async function updateInstrument(
  id: number,
  data: {
    loader_name: string;
    instrument_name: string;
    part_number: string;
    serial_number: string;
    photo_url?: string | null;
  },
) {
  try {
    const result = await sql`
      UPDATE instruments
      SET loader_name = ${data.loader_name},
          instrument_name = ${data.instrument_name},
          part_number = ${data.part_number},
          serial_number = ${data.serial_number},
          photo_url = ${data.photo_url ?? null},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating instrument:', error);
    throw error;
  }
}

export async function deleteInstrument(id: number) {
  try {
    const result = await sql`DELETE FROM instruments WHERE id = ${id} RETURNING *`;
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting instrument:', error);
    throw error;
  }
}
