import {
  AnsibleCollectionRoleAssignment,
  AnsibleContentAssignment,
  AnsibleContentAssignmentCreate,
  AnsibleRoleAssignment,
  ContentResolutionNodeType,
  Fqrnable,
} from '../../../types/AnsibleContentAssignmentTypes';
import { pfLabelColorType } from '../../../types/common';

export const assignmentFqrn = (assignment: Fqrnable): string => {
  if (
    assignment.assignable_type ===
    'ForemanAnsibleDirector::AnsibleCollectionRole'
  ) {
    const acr = assignment as
      | AnsibleCollectionRoleAssignment
      | AnsibleContentAssignmentCreate<AnsibleCollectionRoleAssignment>;
    return `${acr.assignable_namespace}.${acr.assignable_name}.${acr.assignable_role_name}`;
  } else if (
    assignment.assignable_type === 'ForemanAnsibleDirector::AnsibleRole'
  ) {
    const role = assignment as
      | AnsibleRoleAssignment
      | AnsibleContentAssignmentCreate<AnsibleContentAssignment>;
    return `${role.assignable_namespace}.${role.assignable_name}`;
  }

  return '';
};

export const crnTypeUrlMap: Record<ContentResolutionNodeType, string> = {
  Host: 'host',
  Hostgroup: 'hostgroup',
};

export const crnTypeMatcherMap: Record<ContentResolutionNodeType, string> = {
  Host: 'fqdn',
  Hostgroup: 'hostgroup',
};

export const crnTypeUiString: Record<ContentResolutionNodeType, string> = {
  Host: 'host',
  Hostgroup: 'host group',
};

export const crColorHierarchy: pfLabelColorType[] = ['gold', 'purple', 'cyan'];
