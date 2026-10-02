import React, { useCallback, useEffect, useState } from 'react';
import { Phone, Plus, Trash2, ShieldAlert, UserRound, PhoneCall } from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Spinner, ErrorState, Modal, ConfirmDialog } from '../components/ui.jsx';

const TYPES = ['Emergency Contact', 'Doctor', 'Caregiver', 'Family', 'Friend'];
const emptyForm = { name: '', relationship: '', phone: '', type: 'Emergency Contact' };

export default function Contacts() {
  const { notify } = useApp();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/api/contacts')
      .then(setContacts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Please enter a name.'); return; }
    const digits = form.phone.replace(/[^\d+]/g, '');
    if (digits.length < 6) { setFormError('Please enter a valid phone number (at least 6 digits).'); return; }
    setSaving(true);
    setFormError('');
    try {
      const created = await api.post('/api/contacts', { ...form, phone: digits });
      setContacts(cs => [...cs, created]);
      notify('Contact added', `${created.name} was added.`);
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await api.del(`/api/contacts/${deleting.id}`);
      setContacts(cs => cs.filter(c => c.id !== deleting.id));
      notify('Contact removed', `${deleting.name} was removed.`);
    } catch (err) {
      notify('Could not remove contact', err.message);
    } finally {
      setDeleting(null);
    }
  };

  const badge = t =>
    t === 'Emergency Contact' ? 'bg-red-50 text-red-700 border-red-200'
      : t === 'Doctor' ? 'bg-blue-50 text-blue-700 border-blue-200'
      : t === 'Caregiver' ? 'bg-nyala-bg text-nyala-primary border-nyala-primary'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-2">Important Contacts</h1>
          <p className="text-xl text-slate-600">One tap to reach the people who can help.</p>
        </div>
        <button className="btn-primary text-lg px-6 py-3 flex items-center" onClick={() => { setForm(emptyForm); setFormError(''); setModalOpen(true); }}>
          <Plus size={24} className="mr-2" /> Add Contact
        </button>
      </header>

      {loading ? (
        <Spinner label="Loading contacts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : contacts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-sm">
          <p className="text-2xl font-bold break-words text-slate-700 mb-2">No contacts yet</p>
          <p className="text-lg text-slate-500">Add family, doctors, and emergency numbers here.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {[...contacts].sort((a, b) => {
            const rank = t => (t === 'Emergency Contact' ? 0 : t === 'Doctor' ? 1 : t === 'Caregiver' ? 2 : 3);
            return rank(a.type) - rank(b.type);
          }).map(c => (
            <article key={c.id} className="bg-white border-2 border-slate-200 flex flex-col p-6 rounded-sm shadow-sm hover:border-nyala-primary transition-colors">
              <div className="flex items-start gap-4 mb-6">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border-2 ${
                  c.type === 'Emergency Contact' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-nyala-primary border-blue-200'
                }`} aria-hidden="true">
                  {c.type === 'Emergency Contact' ? <ShieldAlert size={40} /> : <UserRound size={40} />}
                </div>
                
                <div className="min-w-0 flex-1">
                  <span className={`inline-block px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-sm border mb-3 ${badge(c.type)}`}>
                    {c.type}
                  </span>
                  <h3 className="text-3xl font-display break-words font-bold text-slate-900 leading-tight">{c.name}</h3>
                  <p className="text-xl text-slate-600 mt-1">{c.relationship}</p>
                  <p className="mt-2 text-lg font-bold text-slate-700">{c.phone}</p>
                </div>
                
                <button
                  className="rounded-sm p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => setDeleting(c)}
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 size={24} />
                </button>
              </div>
              
              <a href={`tel:${c.phone}`} className="w-full bg-nyala-primary hover:bg-blue-800 text-white font-display font-bold text-2xl py-4 rounded-sm flex items-center justify-center transition-colors shadow-sm">
                <PhoneCall size={28} className="mr-3" /> CALL NOW
              </a>
            </article>
          ))}
        </div>
      )}

      {/* Add contact modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Contact">
        <form onSubmit={save} className="space-y-6" noValidate>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="c-name">Name *</label>
            <input id="c-name" className="input text-lg py-4" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Riya" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="c-rel">Relationship</label>
            <input id="c-rel" className="input text-lg py-4" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} placeholder="e.g. Daughter" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="c-phone">Phone number *</label>
            <input id="c-phone" type="tel" className="input text-lg py-4" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. +919876543210" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="c-type">Type</label>
            <select id="c-type" className="input text-lg py-4" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {formError && <p className="bg-red-50 border border-red-200 p-4 text-lg font-bold text-red-700 rounded-sm">{formError}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" className="btn-secondary text-lg px-8 py-4" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary text-lg px-8 py-4" disabled={saving}>{saving ? 'Saving...' : 'Add contact'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove contact"
        message={`Are you sure you want to remove ${deleting?.name} from your contacts?`}
        onConfirm={doDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
