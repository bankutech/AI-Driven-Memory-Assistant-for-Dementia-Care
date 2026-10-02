import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function PeopleSection({ people }) {
  if (!people || people.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="mb-3 font-bold text-slate-800">Important People</h3>
        <p className="text-sm text-slate-500">No people added yet.</p>
      </div>
    );
  }
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Important People</h3>
        <Link to="/people" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {people.slice(0, 6).map(p => (
          <Link
            key={p.id}
            to={`/people?person=${p.id}`}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 hover:border-brand-200 hover:bg-brand-50/50"
          >
            {p.image ? (
              <img src={p.image} alt={p.name} className="h-11 w-11 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                {p.name?.[0]?.toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-bold text-slate-800">{p.name}</span>
              <span className="block truncate text-sm text-slate-500">{p.relationship}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
