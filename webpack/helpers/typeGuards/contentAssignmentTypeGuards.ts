import {
  AnsibleCollectionRoleAssignment,
  AnsibleContentAssignment,
  AnsibleRoleAssignment,
  AssignableBase,
  ResolvedAssignment,
} from '../../types/AnsibleContentAssignmentTypes';

export const isCollectionRoleAssignment = (
  assignment: AssignableBase
): assignment is AnsibleCollectionRoleAssignment =>
  'assignable_role_name' in assignment;

export const isResolvedCollectionRoleAssignment = (
  resolvedAssignment: ResolvedAssignment<AnsibleContentAssignment>
): resolvedAssignment is ResolvedAssignment<AnsibleCollectionRoleAssignment> =>
  'assignable_role_name' in resolvedAssignment;

export const isRoleAssignment = (
  assignment: AssignableBase
): assignment is AnsibleRoleAssignment =>
  !isCollectionRoleAssignment(assignment);
