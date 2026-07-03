import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleContentAssignmentHierarchy {}

export interface AssignableBase extends Identifiable {
  assignable_name: string;
  assignable_namespace: string;
  consumable_id: number;
  consumable_type: ContentResolutionNodeType;
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
  assignable_type: 'ForemanAnsibleDirector::AnsibleRole';
}
export interface AnsibleCollectionRoleAssignment extends AssignableBase {
  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole';
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
