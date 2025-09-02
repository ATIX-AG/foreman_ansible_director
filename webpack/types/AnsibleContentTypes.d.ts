import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleContentUnitBase {
  type: 'collection' | 'role';
  identifier: string;
  versions: AnsibleContentVersion[];
}

export interface AnsibleContentUnitCreate extends AnsibleContentUnitBase {
  source: string;
}

export interface AnsibleContentUnit
  extends AnsibleContentUnitBase,
    Identifiable {
  name: string;
  namespace: string;
}

export interface AnsibleContentVersion {
  version: string;
}

export interface AnsibleContentUnitAssignment extends Identifiable {
  type: 'collection' | 'role';
  identifier: string;
  version: string;
}
