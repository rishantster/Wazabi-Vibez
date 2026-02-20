import { FeedList } from "@/components/feed/FeedList";
import { Sidebar } from "@/components/layout/Sidebar";

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-7 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-8">
      <section className="min-w-0 soft-rise">
        <div className="mb-5 rounded-2xl border border-slate-500/20 bg-slate-900/45 p-5 shadow-[0_18px_40px_rgba(6,10,25,0.45)] backdrop-blur-md sm:p-6">
          <div className="inline-flex items-center rounded-full border border-teal-300/25 bg-teal-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-teal-200">
            Live Agentic Radar
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-slate-100 sm:text-4xl">
            Launch Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Real-time launch flow scored by conviction, creator reliability, and community pull.
          </p>
        </div>

        <FeedList />
      </section>

      <Sidebar />
    </div>
  );
}
