import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

// Lets one page deep-link straight into another page's "add new" dialog, e.g.
// the Caregiver view links to /schedule?add=event to open the Add Event form.
// The query flag is removed from the URL once consumed so a refresh does not
// reopen the dialog.
export function useDeepLinkOpen(open, param = 'add', value = null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const handled = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (handled.current) return;
    const requested = searchParams.get(param);
    if (requested === null) return;
    if (value !== null && requested !== value) return;
    handled.current = true;
    openRef.current();
    const next = new URLSearchParams(searchParams);
    next.delete(param);
    setSearchParams(next, { replace: true });
  });
}

export default useDeepLinkOpen;
