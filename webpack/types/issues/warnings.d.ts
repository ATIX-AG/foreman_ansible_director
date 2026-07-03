export interface AnsibleDirectorWarning {
  title: string;
  message: string;
}

export interface ResolutionWarning extends AnsibleDirectorWarning {
  assignment_id: number;
}
