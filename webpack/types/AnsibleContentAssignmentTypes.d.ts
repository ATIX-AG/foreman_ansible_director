import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleContentAssignmentHierarchy {}

export interface AssignableBase extends Identifiable {
  assignable_name: string;
  assignable_namespace: string;
  subtractive: boolean;
}

export interface ApiAssignment extends AssignableBase {
  consumable_id: number;
  consumable_type: ContentResolutionNodeType;
}

export type AnsibleContentAssignment =
  | AnsibleRoleAssignment
  | AnsibleCollectionRoleAssignment;

export type ResolvedAssignment<T extends AnsibleContentAssignment> = T & {
  resolved: AssignmentResolution;
};

export type Fqrnable =
  | AnsibleContentAssignment
  | AnsibleContentAssignmentCreate<AnsibleContentAssignment>
  | ResolvedAssignment<AnsibleContentAssignment>;

export interface AnsibleRoleAssignment extends ApiAssignment {
  assignable_type: 'ForemanAnsibleDirector::AnsibleRole';
}
export interface AnsibleCollectionRoleAssignment extends ApiAssignment {
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
