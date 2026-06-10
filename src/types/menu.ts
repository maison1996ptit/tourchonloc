export interface MenuItem {
  id: string;
  label: string;
  url: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  children?: MenuItem[];
}

export interface MenuConfig {
  header: MenuItem[];
  footer: MenuItem[];
}
