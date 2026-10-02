import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Plus, Pencil, Trash2, Search, MapPin, User, Tag, Image as ImageIcon } from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Spinner, ErrorState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { fmtDate, todayStr } from '../lib/format.js';
import { useDeepLinkOpen } from '../lib/useDeepLinkOpen.js';

export const CATEGORIES = ['Family', 'Friends', 'Places', 'Events'];

const emptyForm = {
  title: '',
  description: '',
  category: 'Family',
  date: todayStr(),
  location: '',
  person: '',
  image: '',
  tags: ''
};

export default function MemoryVault() {
  const { notify } = useApp();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/api/memories')
      .then(setMemories)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return memories.filter(m => {
      const matchCat = filter === 'All' || m.category === filter;
      const matchQ = !q ||
        m.title?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.person?.toLowerCase().includes(q) ||
        m.tags?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [memories, search, filter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  useDeepLinkOpen(openAdd);

  const openEdit = m => {
    setEditing(m);
    setForm({
      title: m.title || '',
      description: m.description || '',
      category: CATEGORIES.includes(m.category) ? m.category : 'Family',
      date: m.date || todayStr(),
      location: m.location || '',
      person: m.person || '',
      image: m.image || '',
      tags: m.tags || ''
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
    if (!form.title.trim()) {
      setFormError('Please give the memory a title.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        const updated = await api.put(`/api/memories/${editing.id}`, form);
        setMemories(ms => ms.map(m => (m.id === editing.id ? updated : m)));
        notify('Memory updated', `"${updated.title}" was saved.`);
      } else {
        const created = await api.post('/api/memories', form);
        setMemories(ms => [created, ...ms]);
        notify('Memory saved', `"${created.title}" was added to your vault.`);
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
      await api.del(`/api/memories/${deleting.id}`);
      setMemories(ms => ms.filter(m => m.id !== deleting.id));
      notify('Memory deleted', `"${deleting.title}" was removed.`);
    } catch (err) {
      notify('Could not delete memory', err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-2">Memory Vault</h1>
          <p className="text-xl text-slate-600">Your digital scrapbook of important moments.</p>
        </div>
        <button className="btn-primary text-lg px-6 py-3" onClick={openAdd}>
          <Plus size={24} className="mr-2" /> Add Memory
        </button>
      </header>

      {/* Search + filter bar */}
      <div className="bg-white border-2 border-nyala-primary rounded-sm p-4 mb-10 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-nyala-primary" aria-hidden="true" />
          <input
            className="w-full bg-slate-50 border-none px-14 py-4 text-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-nyala-primary rounded-sm"
            placeholder="Search for a memory, place, or person..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search memories"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-5 py-3 text-lg font-bold transition-colors rounded-sm border-2 ${
                filter === c ? 'bg-nyala-primary border-nyala-primary text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-nyala-primary hover:text-nyala-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner label="Opening your memory vault..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : visible.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-sm">
          <p className="text-2xl font-bold break-words text-slate-700 mb-2">No memories found</p>
          <p className="text-lg text-slate-500">Try adjusting your search or add a new memory.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(m => (
            <article key={m.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-sm flex flex-col">
              {m.image ? (
                <img src={m.image} alt={m.title} className="h-64 w-full object-cover border-b border-slate-100" />
              ) : (
                <div className="h-64 w-full bg-slate-50 flex flex-col items-center justify-center border-b border-slate-100 text-slate-300">
                  <ImageIcon size={48} />
                  <span className="mt-2 text-sm font-semibold uppercase tracking-widest">{m.category}</span>
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 leading-tight mb-1">{m.title}</h3>
                    <p className="text-lg text-nyala-primary font-bold">{fmtDate(m.date)}</p>
                  </div>
                </div>
                
                {m.description && <p className="text-lg text-slate-700 leading-relaxed mb-6 flex-1">{m.description}</p>}
                
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                  <span className="inline-block bg-blue-50 text-nyala-primary font-bold px-3 py-1 rounded-sm text-sm uppercase tracking-wider">
                    {m.category}
                  </span>
                  
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-nyala-primary transition-colors bg-slate-50 hover:bg-blue-50 rounded-sm" onClick={() => openEdit(m)} aria-label={`Edit ${m.title}`}>
                      <Pencil size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 rounded-sm" onClick={() => setDeleting(m)} aria-label={`Delete ${m.title}`}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Memory' : 'Add Memory'} wide>
        <form onSubmit={save} className="space-y-6" noValidate>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="m-title">Title *</label>
            <input id="m-title" className="input text-lg py-4" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Family Dinner" />
          </div>
          
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="m-img">Photo</label>
            <div className="flex items-center gap-4">
              <button type="button" className="btn-secondary text-lg" onClick={() => fileRef.current?.click()}>Upload Photo</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              {form.image && (
                <div className="flex items-center gap-4 bg-slate-50 p-2 pr-4 rounded-sm border border-slate-200">
                  <img src={form.image} alt="Preview" className="h-16 w-16 rounded-sm object-cover" />
                  <button type="button" className="text-red-600 font-bold hover:underline" onClick={() => setForm(f => ({ ...f, image: '' }))}>Remove</button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="m-desc">Description</label>
            <textarea id="m-desc" className="input text-lg min-h-32 py-4" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What happened? Who was there?" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="m-cat">Category *</label>
              <select id="m-cat" className="input text-lg py-4" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="m-date">Date</label>
              <input id="m-date" type="date" className="input text-lg py-4" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          
          {formError && <p className="bg-red-50 border border-red-200 p-4 text-lg font-bold text-red-700 rounded-sm">{formError}</p>}
          
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" className="btn-secondary text-lg px-8 py-4" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary text-lg px-8 py-4" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add Memory'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete memory"
        message={`Are you sure you want to delete "${deleting?.title}"? This cannot be undone.`}
        onConfirm={doDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
