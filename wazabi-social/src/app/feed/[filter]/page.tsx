import { FeedList } from "@/components/feed/FeedList";
import { Sidebar } from "@/components/layout/Sidebar";
import { CHAIN_CONFIG, ARTIFACT_TYPE_CONFIG } from "@/lib/constants";

export default function FilteredFeedPage({
  params,
}: {
  params: { filter: string };
}) {
  const { filter } = params;

  // Determine if it's a chain or artifact type
  const isChain = filter in CHAIN_CONFIG;
  const isType = filter in ARTIFACT_TYPE_CONFIG;

  let title = "Launch Feed";
  let description = "Token launches ranked by conviction, reputation, and commitment";

  if (isChain) {
    const config = CHAIN_CONFIG[filter as keyof typeof CHAIN_CONFIG];
    title = `${config.label} Launches`;
    description = `Token launches on ${config.label}`;
  } else if (isType) {
    const config = ARTIFACT_TYPE_CONFIG[filter as keyof typeof ARTIFACT_TYPE_CONFIG];
    title = `${config.label} Launches`;
    description = `${config.label} token launches`;
  } else if (filter === "top") {
    title = "Top Launches";
    description = "All-time highest rated launches";
  } else if (filter === "new") {
    title = "New Launches";
    description = "Latest token launches";
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
        <FeedList />
      </div>
      <Sidebar />
    </div>
  );
}
