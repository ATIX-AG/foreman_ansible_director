export interface AnsibleDirectorIssue {
  type: 'error' | 'warning';
  title: string;
  message: string;
}