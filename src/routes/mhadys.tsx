import { createFileRoute } from "@tanstack/react-router";
import { MhadysHero } from "@/components/mhadys/MhadysHero";

export const Route = createFileRoute("/mhadys")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MhadysEvents — Events, Merchandise & Auto Care in one place" },
      { name: "description", content: "Explore MhadysEvents' interactive 3D campus: event venues, a merchandise fulfillment center, and an auto care studio." },
      { property: "og:title", content: "MhadysEvents — Everything you need, all in one place" },
      { property: "og:description", content: "Events. Merchandise. Auto Care. An interactive 3D tour of one company with three services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MhadysHero,
});
