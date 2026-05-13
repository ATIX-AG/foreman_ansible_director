import { ContentResolutionNode } from '../types/AnsibleContentAssignmentTypes';

export const equalsCrn = (
  a: ContentResolutionNode,
  b: ContentResolutionNode
): boolean => a.type === b.type && a.id === b.id;
