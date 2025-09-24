import { Identifiable } from './AnsibleExecutionEnvTypes';

export interface AnsibleTask extends Identifiable {
  label: string;
  state: 'stopped' | 'pending' | 'running';
  // eslint-disable-next-line camelcase
  started_at: string;
  // eslint-disable-next-line camelcase
  ended_at: string;
}

export interface AnsibleTaskStep {
  // eslint-disable-next-line camelcase
  action_class: string;
  state: 'success';
  output: string;
}
