// Validates a request body against the field list for a table.
// `partial: true` is used for PUT updates, where the client may send only the
// fields it wants to change (e.g. { completed: true } to tick a routine off).
// Required fields are then only checked when they are actually present.
export function validate(body, fields, { partial = false } = {}) {
  if (!body || typeof body !== 'object') return 'Request body must be a JSON object';
  for (const f of fields) {
    const v = body[f.name];
    if (f.required && (partial ? v !== undefined : true)) {
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        return `${f.label || f.name} is required`;
      }
    }
    if (f.maxLength && body[f.name] && body[f.name].length > f.maxLength) {
      return `${f.label || f.name} must be at most ${f.maxLength} characters`;
    }
  }
  return null;
}
