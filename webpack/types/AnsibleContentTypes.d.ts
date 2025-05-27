export interface AnsibleContentUnit {
  type: 'collection' | 'role';
  identifier: string;
  source?: string;
  versions: AnsibleContentVersion[];
}

export interface AnsibleContentVersion {
  version: string;
}
