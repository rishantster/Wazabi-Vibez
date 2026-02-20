import { FeedList } from "@/components/feed/FeedList";
import { Sidebar } from "@/components/layout/Sidebar";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6">
      {/* Main feed */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Launch Feed</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Token launches ranked by conviction, reputation, and commitment
          </p>
        </div>
        <FeedList />
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
}
