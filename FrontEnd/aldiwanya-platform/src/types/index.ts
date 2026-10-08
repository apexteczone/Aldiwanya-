export interface TechStackItem {
  name: string
  version: string
  description: string
  category: 'Framework' | 'Language' | 'Styling' | 'Tooling'
  docsUrl: string
  iconName: string
}

export interface QuickLink {
  label: string
  href: string
  description: string
}
