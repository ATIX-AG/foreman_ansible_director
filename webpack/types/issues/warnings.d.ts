export interface AnsibleDirectorWarning {
  title: string;
  message: string;
}

export interface ResolutionWarning extends AnsibleDirectorWarning {
  // eslint-disable-next-line camelcase
  assignment_id: number;
}
