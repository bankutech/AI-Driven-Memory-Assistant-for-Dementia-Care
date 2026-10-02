import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Plus, Pencil, Trash2, Phone, Camera, UserSquare, X, Image as ImageIcon } from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Spinner, ErrorState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { fmtDate } from '../lib/format.js';
import { demoFaces } from '../lib/demoFaces.js';
import { useDeepLinkOpen } from '../lib/useDeepLinkOpen.js';

const emptyForm = { name: '', relationship: '', description: '', image: '', last_interaction: '' };

export default function People() {
  const { notify } = useApp();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileRef = useRef(null);

  // Demo matching state
  const [recogOpen, setRecogOpen] = useState(false);
  const [recogPhoto, setRecogPhoto] = useState(null);
  const [recogResult, setRecogResult] = useState(null);
  const [recogBusy, setRecogBusy] = useState(false);
  const recogFileRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/api/people')
      .then(setPeople)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = searchParams.get('person');
    if (id && people.length) {
      const p = people.find(x => String(x.id) === String(id));
      if (p) setSelected(p);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, people, setSearchParams]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  useDeepLinkOpen(openAdd);

  const openEdit = p => {
    setEditing(p);
    setForm({
      name: p.name || '',
      relationship: p.relationship || '',
      description: p.description || '',
      image: p.image || '',
      last_interaction: p.last_interaction || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const onFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Please enter a name.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        const updated = await api.put(`/api/people/${editing.id}`, form);
        setPeople(ps => ps.map(p => (p.id === editing.id ? updated : p)));
        if (selected?.id === updated.id) setSelected(updated);
        notify('Person updated', `${updated.name} was saved.`);
      } else {
        const created = await api.post('/api/people', form);
        setPeople(ps => [...ps, created]);
        notify('Person added', `${created.name} was added to Important People.`);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await api.del(`/api/people/${deleting.id}`);
      setPeople(ps => ps.filter(p => p.id !== deleting.id));
      if (selected?.id === deleting.id) setSelected(null);
      notify('Person removed', `${deleting.name} was removed.`);
    } catch (err) {
      notify('Could not remove person', err.message);
    } finally {
      setDeleting(null);
    }
  };

  const onRecogFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRecogPhoto(String(reader.result));
      setRecogResult(null);
    };
    reader.readAsDataURL(file);
  };

  const runRecognition = () => {
    if (!recogPhoto) return;
    setRecogBusy(true);
    setTimeout(() => {
      let hash = 0;
      for (let i = 0; i < recogPhoto.length; i += 1) {
        hash = (hash * 31 + recogPhoto.charCodeAt(i)) % 100000;
      }
      const demoPerson = people.length ? people[hash % people.length] : null;
      setRecogResult({ person: demoPerson });
      setRecogBusy(false);
    }, 1200);
  };

  const contact = name => api.get('/api/contacts').then(cs => cs.find(c => c.name === name));

  if (loading) return <Spinner label="Loading people..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-2">Important People</h1>
          <p className="text-xl text-slate-600">The familiar faces in your life.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="bg-white border-2 border-nyala-primary text-nyala-primary font-bold text-lg px-6 py-3 rounded-sm flex items-center hover:bg-blue-50 transition-colors" onClick={() => { setRecogOpen(true); setRecogPhoto(null); setRecogResult(null); }}>
            <UserSquare size={24} className="mr-2" /> Who is this?
          </button>
          <button className="btn-primary text-lg px-6 py-3 flex items-center" onClick={openAdd}>
            <Plus size={24} className="mr-2" /> Add Person
          </button>
        </div>
      </header>

      {people.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-sm">
          <p className="text-2xl font-bold break-words text-slate-700 mb-2">No people added yet</p>
          <p className="text-lg text-slate-500">Add family and friends so they're easy to remember.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {people.map(p => (
            <article key={p.id} className="bg-white border border-slate-200 rounded-sm p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-40 w-40 rounded-full object-cover mb-6 border-4 border-slate-50 shadow-sm" />
              ) : (
                <div className="h-40 w-40 rounded-full bg-blue-50 flex items-center justify-center mb-6 border-4 border-slate-50 shadow-sm">
                  <span className="text-5xl font-bold text-nyala-primary">{p.name?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <h3 className="text-3xl font-display break-words font-bold text-slate-900 mb-1">{p.name}</h3>
              <p className="text-xl font-bold break-words text-nyala-primary mb-4">{p.relationship}</p>
              {p.description && <p className="text-lg text-slate-600 mb-6 leading-relaxed line-clamp-3">{p.description}</p>}
              
              <div className="mt-auto flex gap-3 w-full">
                <button className="flex-1 btn-secondary text-lg py-3 font-bold" onClick={() => setSelected(p)}>View Details</button>
                <button className="bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-sm transition-colors border border-slate-200" onClick={() => setDeleting(p)} aria-label={`Remove ${p.name}`}>
                  <Trash2 size={24} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Profile'} wide>
        {selected && (
          <div className="p-2">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 text-center md:text-left">
              {selected.image ? (
                <img src={selected.image} alt={selected.name} className="h-48 w-48 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
              ) : (
                <div className="h-48 w-48 rounded-full bg-blue-50 flex items-center justify-center border-4 border-slate-50 shadow-sm">
                  <span className="text-6xl font-bold text-nyala-primary">{selected.name?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 mt-4">
                <h3 className="text-4xl font-display font-bold text-slate-900 mb-2">{selected.name}</h3>
                <p className="text-2xl font-bold break-words text-nyala-primary mb-4">{selected.relationship}</p>
                {selected.description && <p className="text-xl leading-relaxed text-slate-700 mb-6">{selected.description}</p>}
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-8 mt-8">
              <SelectedMemories name={selected.name} />
            </div>
            
            <div className="mt-8 flex flex-wrap justify-end gap-4 border-t border-slate-200 pt-6">
              <button
                className="bg-white border-2 border-nyala-primary text-nyala-primary font-bold text-lg px-8 py-4 rounded-sm flex items-center hover:bg-blue-50 transition-colors"
                onClick={async () => {
                  const c = await contact(selected.name);
                  if (c?.phone) {
                    window.location.href = `tel:${c.phone}`;
                  } else {
                    notify('No number saved', `${selected.name} has no phone number in Contacts.`);
                  }
                }}
              >
                <Phone size={24} className="mr-2" /> Call {selected.name}
              </button>
              <button className="btn-primary text-lg px-8 py-4" onClick={() => { setSelected(null); openEdit(selected); }}>
                <Pencil size={24} className="mr-2" /> Edit Details
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Person' : 'Add Person'}>
        <form onSubmit={save} className="space-y-6" noValidate>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="p-name">Name *</label>
            <input id="p-name" className="input text-lg py-4" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Riya" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="p-rel">Relationship</label>
            <input id="p-rel" className="input text-lg py-4" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} placeholder="e.g. Daughter" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="p-desc">Short description</label>
            <textarea id="p-desc" className="input text-lg min-h-32 py-4" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Lives nearby. Visits every Sunday." />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2">Photo</label>
            <div className="flex items-center gap-4">
              <button type="button" className="btn-secondary text-lg" onClick={() => fileRef.current?.click()}><Camera size={20} className="mr-2" /> Upload Photo</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              {form.image && (
                <div className="flex items-center gap-4 bg-slate-50 p-2 pr-4 rounded-sm border border-slate-200">
                  <img src={form.image} alt="Preview" className="h-16 w-16 rounded-sm object-cover" />
                  <button type="button" className="text-red-600 font-bold hover:underline" onClick={() => setForm(f => ({ ...f, image: '' }))}>Remove</button>
                </div>
              )}
            </div>
          </div>
          {formError && <p className="bg-red-50 border border-red-200 p-4 text-lg font-bold text-red-700 rounded-sm">{formError}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" className="btn-secondary text-lg px-8 py-4" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary text-lg px-8 py-4" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add person'}</button>
          </div>
        </form>
      </Modal>

      {/* Demo matching modal */}
      <Modal open={recogOpen} onClose={() => setRecogOpen(false)} title="Who is this?">
        <div className="p-4">
          <p className="mb-6 text-lg text-slate-600 text-center">Upload a photo to see if they are in your Important People.</p>
          
          {!recogPhoto ? (
            <div className="flex flex-col items-center">
              <div 
                className="w-full flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-nyala-primary bg-blue-50 p-12 cursor-pointer hover:bg-blue-100 transition-colors mb-8"
                onClick={() => recogFileRef.current?.click()}
              >
                <ImageIcon size={64} className="text-nyala-primary mb-4" />
                <p className="text-2xl font-bold break-words text-nyala-primary mb-2">Tap to Select Photo</p>
              </div>
              <input ref={recogFileRef} type="file" accept="image/*" className="hidden" onChange={onRecogFile} />
              
              <div className="w-full border-t border-slate-200 pt-6">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Or try a sample photo</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {demoFaces.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { setRecogPhoto(f.src); setRecogResult(null); }}
                      className="rounded-full overflow-hidden border-4 border-transparent hover:border-nyala-primary transition-colors"
                      title={f.label}
                    >
                      <img src={f.src} alt={f.label} className="h-20 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative mb-8 inline-block">
                <img src={recogPhoto} alt="Uploaded" className="h-48 w-48 rounded-sm object-cover shadow-md border-4 border-white" />
                {!recogBusy && (
                  <button className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-2 shadow-sm hover:bg-red-700" onClick={() => { setRecogPhoto(null); setRecogResult(null); }}>
                    <X size={20} />
                  </button>
                )}
              </div>
              
              {recogBusy ? (
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-sm p-6 w-full justify-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-nyala-primary" />
                  <span className="text-xl font-bold break-words text-slate-700">Looking through your people...</span>
                </div>
              ) : recogResult ? (
                <div className="w-full">
                  {recogResult.person ? (
                    <div className="bg-blue-50 border-2 border-nyala-primary rounded-sm p-8 text-center flex flex-col items-center shadow-sm">
                      <p className="text-xl font-bold break-words text-slate-600 mb-4">Match Found!</p>
                      
                      {recogResult.person.image ? (
                        <img src={recogResult.person.image} alt={recogResult.person.name} className="h-32 w-32 rounded-full object-cover mb-4 border-4 border-white shadow-sm" />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-nyala-primary text-white flex items-center justify-center mb-4 text-4xl font-bold">
                          {recogResult.person.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <p className="text-4xl font-display font-bold text-slate-900 mb-2">This is {recogResult.person.name}</p>
                      <p className="text-2xl font-bold break-words text-nyala-primary">{recogResult.person.relationship}</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-8 text-center">
                      <p className="text-2xl font-bold break-words text-slate-700 mb-2">No Match Found</p>
                      <p className="text-lg text-slate-600">This person is not in your Important People list.</p>
                    </div>
                  )}
                </div>
              ) : (
                <button className="btn-primary w-full text-xl py-4" onClick={runRecognition}>
                  <UserSquare size={24} className="mr-2" /> Find Match
                </button>
              )}
              
              {recogResult && (
                <button className="btn-secondary w-full text-lg mt-6 py-4" onClick={() => { setRecogPhoto(null); setRecogResult(null); }}>
                  Try another photo
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove Person"
        message={`Are you sure you want to remove ${deleting?.name}? Memories they appear in will be kept.`}
        onConfirm={doDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function SelectedMemories({ name }) {
  const [memories, setMemories] = useState([]);
  useEffect(() => {
    let active = true;
    api.get('/api/memories').then(all => {
      if (active) setMemories(all.filter(m => m.person?.toLowerCase() === name.toLowerCase()));
    }).catch(() => {});
    return () => { active = false; };
  }, [name]);

  if (memories.length === 0) return null;
  return (
    <div>
      <h4 className="mb-4 text-lg font-bold text-slate-800">Memories with {name}</h4>
      <div className="grid sm:grid-cols-2 gap-4">
        {memories.slice(0, 4).map(m => (
          <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-sm p-4">
            <p className="text-xl font-bold break-words text-slate-900 mb-1">{m.title}</p>
            <p className="text-lg text-slate-600">{fmtDate(m.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
