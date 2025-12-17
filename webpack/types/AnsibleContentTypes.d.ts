import { Identifiable } from './AnsibleExecutionEnvTypes';
import { AnsibleVariable } from './AnsibleVariableTypes';

export interface AnsibleContentUnitCreateBase {
  type: 'collection' | 'role';
  identifier: string;
}
export interface AnsibleContentUnitBase extends AnsibleContentUnitCreateBase {
  versions: AnsibleContentVersion[];
}

export interface AnsibleGalaxyContentUnitCreate extends AnsibleContentUnitBase {
  source: string;
  versions: AnsibleGalaxyContentVersionCreate[];
}

export interface AnsibleGitContentUnitCreate
  extends AnsibleContentUnitCreateBase {
  gitUrl: string;
  gitRefs: string[];
}

export interface AnsibleContentUnit
  extends AnsibleContentUnitBase,
    Identifiable {
  name: string;
  namespace: string;
}

export interface AnsibleContentUnitFull extends AnsibleContentUnit {
  versions: AnsibleContentVersionFull[];
}

export interface AnsibleContentVersion extends Identifiable {
  version: string;
}
export interface AnsibleGalaxyContentVersionCreate {
  version: string;
}

export interface AnsibleCollectionRole extends Identifiable {
  name: string;
}

export interface AnsibleRole {
  name: string;
  variables: AnsibleVariable[];
}

export interface AnsibleContentVersionFull
  extends AnsibleContentVersion,
    Identifiable {
  roles: AnsibleCollectionRole[];
}

export interface AnsibleContentUnitAssignment extends Identifiable {
  type: 'collection' | 'role';
  identifier: string;
  version: string;
}

export interface FullAnsibleContentUnitAssignment
  extends AnsibleContentUnitAssignment {
  roles: AnsibleCollectionRole[];
}
