// Built-in sample photos for the simulated "Who is this?" Demo Recognition flow.
// These are simple generated SVG portraits (no real people, no network calls), so the
// demo works even when the user has no image file on their device.

function faceSvg({ bg, skin, hair, shirt, label }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="${bg}"/>
  <path d="M100 132c34 0 58 20 62 44H38c4-24 28-44 62-44z" fill="${shirt}"/>
  <circle cx="100" cy="82" r="42" fill="${skin}"/>
  <path d="M58 74c0-26 19-44 42-44s42 18 42 44c-8-14-24-20-42-20s-34 6-42 20z" fill="${hair}"/>
  <circle cx="85" cy="84" r="5" fill="#1f2937"/>
  <circle cx="115" cy="84" r="5" fill="#1f2937"/>
  <path d="M86 102c5 6 23 6 28 0" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round"/>
  <text x="100" y="192" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const demoFaces = [
  { id: 'photo-a', label: 'Sample photo A', src: faceSvg({ bg: '#1f6f8b', skin: '#f2c9a0', hair: '#3f3f46', shirt: '#0f766e', label: 'Photo A' }) },
  { id: 'photo-b', label: 'Sample photo B', src: faceSvg({ bg: '#0f766e', skin: '#e8b48a', hair: '#1f2937', shirt: '#334155', label: 'Photo B' }) },
  { id: 'photo-c', label: 'Sample photo C', src: faceSvg({ bg: '#475569', skin: '#d9a273', hair: '#52525b', shirt: '#0ea5e9', label: 'Photo C' }) }
];
