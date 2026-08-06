import type {
  OrganizableItem,
  OrganizedGroup,
  OrganizationService,
} from "./interface";

/** Deterministic local organization logic — grouping and sorting only. */
export class LocalOrganizationService implements OrganizationService {
  groupByTag(items: OrganizableItem[]): OrganizedGroup[] {
    const groups = new Map<string, OrganizableItem[]>();
    for (const item of items) {
      const tags = item.tags?.length ? item.tags : ["untagged"];
      for (const tag of tags) {
        if (!groups.has(tag)) groups.set(tag, []);
        groups.get(tag)!.push(item);
      }
    }
    return Array.from(groups.entries()).map(([key, groupItems]) => ({
      key,
      items: groupItems,
    }));
  }

  sortByRecency(items: OrganizableItem[]): OrganizableItem[] {
    return [...items].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }
}
