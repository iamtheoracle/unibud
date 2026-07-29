import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileDetailCard from "@/components/discover/ProfileDetailCard";

const DEMO_PROFILE = {
  id: "p1",
  name: "Roselyn Archer",
  age: 27,
  location: "Paris, France",
  followers: "1,130",
  mutuals: "6",
  image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  interests: ["Movies", "Cooking", "Reading", "Fitness", "Travel"],
};

/**
 * ProfileView — user profile detail page.
 */
export default function ProfileView() {
  const navigate = useNavigate();
  const { profileId } = useParams();

  return (
    <ProfileDetailCard
      profile={DEMO_PROFILE}
      onBack={() => navigate(-1)}
      onMessage={() => navigate("/messages")}
    />
  );
}