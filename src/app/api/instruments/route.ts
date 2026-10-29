import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createInstrument, getInstruments } from '@/lib/db';

export async function GET() {
  const instruments = await getInstruments();
  return NextResponse.json({ instruments });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const loader_name = String(formData.get('loader_name') || '').trim();
    const instrument_name = String(formData.get('instrument_name') || '').trim();
    const part_number = String(formData.get('part_number') || '').trim();
    const serial_number = String(formData.get('serial_number') || '').trim();
    const photo = formData.get('photo');

    if (!loader_name || !instrument_name || !part_number || !serial_number) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    let photoUrl: string | null = null;

    if (photo && typeof photo !== 'string' && photo instanceof File) {
      const fileArrayBuffer = await photo.arrayBuffer();
      const blob = await put(`instruments/${Date.now()}-${photo.name}`, Buffer.from(fileArrayBuffer), {
        access: 'public',
      });
      photoUrl = blob.url;
    }

    const instrument = await createInstrument({
      loader_name,
      instrument_name,
      part_number,
      serial_number,
      photo_url: photoUrl,
    });

    return NextResponse.json({ instrument, message: 'Instrumento creado con éxito.' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/instruments failed:', error);
    return NextResponse.json({ error: 'No se pudo crear el instrumento.' }, { status: 500 });
  }
}
