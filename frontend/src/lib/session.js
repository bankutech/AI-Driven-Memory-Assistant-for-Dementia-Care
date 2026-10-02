import React from 'react';

const PIN = '1234';

// Fake JWT-ish token (prototype only - clearly not real auth)
function fakeToken(payload) {
  const b = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  const header = b({ alg: 'none', typ: 'JWT' });
  const body = b({ ...payload, iat: Date.now() });
  return `${header}.${body}.demo-signature`;
}

export function setSession(user, mode = 'login') {
  localStorage.setItem(
    'ma_session',
    JSON.stringify({ user, mode, token: fakeToken({ sub: user.email || 'demo', role: user.role }) })
  );
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('ma_session'));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('ma_session');
}

export function getPin() {
  return localStorage.getItem('ma_pin') || PIN;
}

// Remembers who signed in last, so the welcome screen can offer a PIN unlock
// instead of a full email sign in on the next visit.
export function setLastUser(user) {
  try {
    localStorage.setItem('ma_last_user', JSON.stringify(user));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function getLastUser() {
  try {
    return JSON.parse(localStorage.getItem('ma_last_user')) || null;
  } catch {
    return null;
  }
}

export function clearLastUser() {
  localStorage.removeItem('ma_last_user');
}

export function setPin(pin) {
  localStorage.setItem('ma_pin', pin);
}

export default PIN;
