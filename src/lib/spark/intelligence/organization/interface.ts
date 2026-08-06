export interface OrganizableItem {
  id: string;
  label: string;
  tags?: string[];
  createdAt?: string;
}

export interface OrganizedGroup {
  key: string;
  items: OrganizableItem[];
}

export interface OrganizationService {
  groupByTag(items: OrganizableItem[]): OrganizedGroup[];
  sortByRecency(items: OrganizableItem[]): OrganizableItem[];
}
