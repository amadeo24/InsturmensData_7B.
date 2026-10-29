import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { deleteInstrument, updateInstrument } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const loader_name = String(formData.get('loader_name') || '').trim();
    const instrument_name = String(formData.get('instrument_name') || '').trim();
    const part_number = String(formData.get('part_number') || '').trim();
    const serial_number = String(formData.get('serial_number') || '').trim();
    const photo = formData.get('photo');
    const id = Number(params.id);

    if (!loader_name || !instrument_name || !part_number || !serial_number || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    let photoUrl = formData.get('existingPhotoUrl') ? String(formData.get('existingPhotoUrl')) : null;

    if (photo && typeof photo !== 'string' && photo instanceof File) {
      const fileArrayBuffer = await photo.arrayBuffer();
      const blob = await put(`instruments/${Date.now()}-${photo.name}`, Buffer.from(fileArrayBuffer), {
        access: 'public',
      });
      photoUrl = blob.url;
    }

    const instrument = await updateInstrument(id, {
      loader_name,
      instrument_name,
      part_number,
      serial_number,
      photo_url: photoUrl,
    });

    if (!instrument) {
      return NextResponse.json({ error: 'Instrumento no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ instrument, message: 'Instrumento actualizado con éxito.' });
  } catch (error) {
    console.error('PUT /api/instruments/[id] failed:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el instrumento.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const instrument = await deleteInstrument(id);
    if (!instrument) {
      return NextResponse.json({ error: 'Instrumento no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Instrumento eliminado con éxito.' });
  } catch (error) {
    console.error('DELETE /api/instruments/[id] failed:', error);
    return NextResponse.json({ error: 'No se pudo eliminar el instrumento.' }, { status: 500 });
  }
}
