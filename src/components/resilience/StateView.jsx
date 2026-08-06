import React from "react";
import SmartSkeleton from "./SkeletonKit";
import RetryError from "./RetryError";

/**
 * StateView — renders skeleton → error → empty → content based on
 * the state of an async resource (React Query result or manual props).
 *
 * Props:
 *  isLoading, isError, isEmpty, refetch, skeleton (variant|node),
 *  empty (node), children
 */
export default function StateView({
  isLoading,
  isError,
  isEmpty,
  refetch,
  skeleton = "list",
  empty,
  children,
}) {
  if (isLoading) {
    return typeof skeleton === "string"
      ? <SmartSkeleton variant={skeleton} />
      : skeleton;
  }
  if (isError) {
    return <RetryError onRetry={refetch} />;
  }
  if (isEmpty) {
    return empty || <RetryError onRetry={refetch} title="Nothing found" message="No results yet. Try refreshing." />;
  }
  return <>{children}</>;
}