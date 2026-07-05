import { useEffect } from 'react';
import { useHashRoute } from './hooks/useHashRoute.js';
import { LandingPage } from './pages/LandingPage.jsx';
import { CustomerPage } from './pages/CustomerPage.jsx';
import { AgentPage } from './pages/AgentPage.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { trackInteraction } from './utils/analytics.js';

function RouteView() {
  const route = useHashRoute();

  useEffect(() => {
    trackInteraction('route_viewed', { route });
  }, [route]);

  if (route === '/chat') {
    return <CustomerPage />;
  }
  if (route === '/staff') {
    return <AgentPage />;
  }
  return <LandingPage />;
}

export default function App() {
  return (
    <ToastProvider>
      <a
        href="#main-content"
        className="sr-only-focusable fixed left-2 top-2 z-50 rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white"
      >
        Skip to main content
      </a>
      <div id="main-content">
        <RouteView />
      </div>
    </ToastProvider>
  );
}
