import React from "react";
import ForYouFeed from "@/components/discover/ForYouFeed";
import { useNavigate } from "react-router-dom";

/**
 * ForYou — social discovery page with "For You" card feed.
 * Wraps the ForYouFeed component for routing.
 */
export default function ForYou() {
  const navigate = useNavigate();
  return <ForYouFeed onMessage={() => navigate("/messages")} />;
}