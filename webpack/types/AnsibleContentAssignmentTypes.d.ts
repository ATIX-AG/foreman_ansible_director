import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleContentAssignmentHierarchy {}

export interface AssignableBase extends Identifiable {
  // eslint-disable-next-line camelcase
  assignable_name: string;
  // eslint-disable-next-line camelcase
  assignable_namespace: string;
  // eslint-disable-next-line camelcase
  consumable_id: number;
  // eslint-disable-next-line camelcase
  consumable_type: ContentResolutionNodeType;
  // eslint-disable-next-line camelcase
  subtractive: boolean;
  resolved: null;
}

export type AnsibleContentAssignment =
  | AnsibleRoleAssignment
  | AnsibleCollectionRoleAssignment;

export type ResolvedAssignment<T extends AnsibleContentAssignment> = Omit<
  T,
  'resolved'
> & {
  resolved: AssignmentResolution;
};

export type Fqrnable =
  | AnsibleContentAssignment
  | AnsibleContentAssignmentCreate<AnsibleContentAssignment>
  | ResolvedAssignment<AnsibleContentAssignment>;

export interface AnsibleRoleAssignment extends AssignableBase {
  // eslint-disable-next-line camelcase
  assignable_type: 'ForemanAnsibleDirector::AnsibleRole';
}
export interface AnsibleCollectionRoleAssignment extends AssignableBase {
  // eslint-disable-next-line camelcase
  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole';
  // eslint-disable-next-line camelcase
  assignable_role_name: string;
}

type ContentResolutionNodeType = 'Host' | 'Hostgroup';

export interface ContentResolutionNode extends Identifiable {
  type: ContentResolutionNodeType;
  name: string;
}

export type AnsibleContentAssignmentCreate<
  T extends AnsibleContentAssignment
> = Omit<T, 'id' | 'consumable_type' | 'consumable_id'>;

export interface AssignmentResolution extends Identifiable {
  version: string;
}
