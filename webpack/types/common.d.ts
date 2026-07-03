import { Identifiable } from './AnsibleExecutionEnvTypes';

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

export interface Organization {
  id: number;
  title: string;
}

export interface Location {
  id: number;
  title: string;
}

export interface HostGroup {
  id: string;
  name: string;
  title: string;
}

export interface Host {
  id: string;
  name: string;
}

export interface Taxon extends Organization, Location {}

export interface Task extends Identifiable {
  label: string;

  started_at: string;
}
