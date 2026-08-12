import { AnsibleDirectorIssue } from './types';

export interface AnsibleDirectorError extends AnsibleDirectorIssue {
  type: 'error';
}
