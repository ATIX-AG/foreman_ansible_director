import { AnsibleDirectorIssue } from './types';

export interface AnsibleDirectorWarning extends AnsibleDirectorIssue {
  type: 'warning';
  title: string;
  message: string;
}

export interface ResolutionWarning extends AnsibleDirectorWarning {
  assignment_id: number;
}
