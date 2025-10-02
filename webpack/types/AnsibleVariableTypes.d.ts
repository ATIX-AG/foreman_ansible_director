export interface AnsibleVariable {
  name: string;
  // eslint-disable-next-line camelcase
  default_value: string;
  type: string; // TODO: Make discreet
}
