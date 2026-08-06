import React from "react";
import { useParams } from "react-router-dom";
import { HUB_REGISTRY } from "@/data/hubRegistry";
import HubShell from "@/components/hubs/HubShell";
import HubFeed from "@/components/hubs/HubFeed";
import PageNotFound from "@/lib/PageNotFound";

/**
 * HubPage — dynamic route for any hub (/hub/:hubId).
 * Looks up the hub config and renders the shared HubShell + HubFeed.
 */
export default function HubPage() {
  const { hubId } = useParams();
  const hub = HUB_REGISTRY[hubId];

  if (!hub) return <PageNotFound />;

  return (
    <HubShell hub={hub}>
      <HubFeed hub={hub} />
    </HubShell>
  );
}