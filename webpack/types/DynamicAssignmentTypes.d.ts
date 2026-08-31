import { ContentResolutionNodeType } from './AnsibleContentAssignmentTypes';

export interface Consumable {
  consumable_type: ContentResolutionNodeType;
  consumable_id: number;
}

export interface Assignable extends RoleAssignable, CollectionRoleAssignable {}

export interface RoleAssignable {
  assignable_type: 'ForemanAnsibleDirector::AnsibleRole';
  assignable_namespace: string;
  assignable_name: string;
  assignable_role_name: never;
}

export interface CollectionRoleAssignable {
  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole';
  assignable_namespace: string;
  assignable_name: string;
  assignable_role_name: string;
}
