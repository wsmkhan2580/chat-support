import { Wrench, MessageCircle, ShieldCheck } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-ink-50 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white">
          <Wrench className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold text-ink-900">FixPoint Electronics Repair</h1>
        <p className="max-w-sm text-sm text-ink-500">
          Real-Time Chat Support system. Choose an entry point below.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href="#/chat"
          className="group flex flex-col items-center gap-3 rounded-xl border border-ink-200 bg-white p-8 text-center shadow-panel transition-colors hover:border-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-colors group-hover:bg-ink-900 group-hover:text-white">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold text-ink-900">Customer Chat</span>
          <span className="text-sm text-ink-500">Start a live support conversation.</span>
        </a>

        <a
          href="#/staff"
          className="group flex flex-col items-center gap-3 rounded-xl border border-ink-200 bg-white p-8 text-center shadow-panel transition-colors hover:border-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-colors group-hover:bg-ink-900 group-hover:text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold text-ink-900">Staff Console</span>
          <span className="text-sm text-ink-500">Manage live customer conversations.</span>
        </a>
      </div>
    </div>
  );
}
