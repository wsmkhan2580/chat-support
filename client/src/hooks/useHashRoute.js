import { useEffect, useState } from 'react';

function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  return hash;
}

/**
 * A deliberately minimal hash router. This app has exactly two views
 * (customer widget and agent console) so pulling in react-router would be
 * unnecessary weight — a tiny hashchange listener covers the need while
 * still giving each view a shareable, bookmarkable URL.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}
