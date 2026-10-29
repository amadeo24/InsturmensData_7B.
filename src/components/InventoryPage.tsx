'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

type Instrument = {
  id: number;
  loader_name: string;
  instrument_name: string;
  part_number: string;
  serial_number: string;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type FormState = {
  loader_name: string;
  instrument_name: string;
  part_number: string;
  serial_number: string;
};

const emptyForm: FormState = {
  loader_name: '',
  instrument_name: '',
  part_number: '',
  serial_number: '',
};

export default function InventoryPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInstruments = async () => {
    const response = await fetch('/api/instruments');
    const data = await response.json();
    setInstruments(data.instruments || []);
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const formIsValid = useMemo(() => {
    return (
      form.loader_name.trim() &&
      form.instrument_name.trim() &&
      form.part_number.trim() &&
      form.serial_number.trim()
    );
  }, [form]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formIsValid) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      if (editingId !== null) {
        formData.append('id', String(editingId));
      }

      const endpoint = editingId === null ? '/api/instruments' : `/api/instruments/${editingId}`;
      const method = editingId === null ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'No se pudo guardar el instrumento.');
      }

      setSuccess(editingId === null ? 'Instrumento creado con éxito.' : 'Instrumento actualizado con éxito.');
      setForm(emptyForm);
      setPhotoFile(null);
      setPhotoPreview(null);
      setEditingId(null);
      fetchInstruments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (instrument: Instrument) => {
    setEditingId(instrument.id);
    setForm({
      loader_name: instrument.loader_name,
      instrument_name: instrument.instrument_name,
      part_number: instrument.part_number,
      serial_number: instrument.serial_number,
    });
    setPhotoPreview(instrument.photo_url || null);
    setPhotoFile(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Deseas eliminar este instrumento?')) return;

    try {
      const response = await fetch(`/api/instruments/${id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'No se pudo eliminar el instrumento.');
      }
      setSuccess('Instrumento eliminado con éxito.');
      fetchInstruments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el instrumento.');
    }
  };

  return (
    <main className="page-shell">
      <div className="container">
        <header className="topbar">
          <div>
            <p className="eyebrow">Inventario</p>
            <h1>InstrumentData_7B</h1>
          </div>
          <span className="badge">{instruments.length} registros</span>
        </header>

        <section className="card form-card">
          <h2>{editingId === null ? 'Registrar instrumento' : 'Editar instrumento'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span>Nombre de quien carga</span>
              <input
                value={form.loader_name}
                onChange={(e) => handleChange('loader_name', e.target.value)}
                placeholder="Ej: Ana García"
              />
            </label>

            <label>
              <span>Nombre del instrumento</span>
              <input
                value={form.instrument_name}
                onChange={(e) => handleChange('instrument_name', e.target.value)}
                placeholder="Ej: Multímetro"
              />
            </label>

            <label>
              <span>Número de parte</span>
              <input
                value={form.part_number}
                onChange={(e) => handleChange('part_number', e.target.value)}
                placeholder="Ej: PT-2201"
              />
            </label>

            <label>
              <span>Número de serie</span>
              <input
                value={form.serial_number}
                onChange={(e) => handleChange('serial_number', e.target.value)}
                placeholder="Ej: SN-98212"
              />
            </label>

            <label className="full-width">
              <span>Fotografía del instrumento</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              />
            </label>

            {(photoPreview || photoFile) && (
              <div className="preview-box full-width">
                <Image
                  src={photoPreview || '/placeholder.svg'}
                  alt="Vista previa"
                  width={220}
                  height={160}
                  unoptimized={!!photoPreview && !photoPreview.startsWith('http')}
                />
              </div>
            )}

            {error && <p className="message error">{error}</p>}
            {success && <p className="message success">{success}</p>}

            <div className="actions full-width">
              <button type="submit" className="primary" disabled={!formIsValid || loading}>
                {loading ? 'Guardando...' : editingId === null ? 'Guardar instrumento' : 'Actualizar instrumento'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setError('');
                    setSuccess('');
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card table-card">
          <h2>Instrumentos registrados</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Responsable</th>
                  <th>Instrumento</th>
                  <th>Parte</th>
                  <th>Serie</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {instruments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">No hay instrumentos cargados.</td>
                  </tr>
                ) : (
                  instruments.map((instrument) => (
                    <tr key={instrument.id}>
                      <td>
                        {instrument.photo_url ? (
                          <Image
                            src={instrument.photo_url}
                            alt={instrument.instrument_name}
                            width={64}
                            height={64}
                            unoptimized
                          />
                        ) : (
                          <div className="placeholder-thumb">Sin foto</div>
                        )}
                      </td>
                      <td>{instrument.loader_name}</td>
                      <td>{instrument.instrument_name}</td>
                      <td>{instrument.part_number}</td>
                      <td>{instrument.serial_number}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="small-button edit" onClick={() => handleEdit(instrument)}>
                            Editar
                          </button>
                          <button type="button" className="small-button delete" onClick={() => handleDelete(instrument.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
