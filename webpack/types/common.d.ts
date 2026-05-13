export type pfAlertVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'custom'
  | undefined;

export type pfLabelColorType =
  | 'blue'
  | 'cyan'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'grey'
  | 'gold';

export interface DefaultResponse<
  TError extends AnsibleDirectorError,
  TWarning extends AnsibleDirectorWarning,
  TResponse
> {
  status: 'error' | 'success';
  errors: TError[];
  warnings: TWarning[];
  results: TResponse;
}
