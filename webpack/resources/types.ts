import { AnsibleExecutionEnv } from '../types/AnsibleExecutionEnvTypes';

export interface Organizable {
  organization_id: number;
}

interface TypeRegistry {
  execution_environments: AnsibleExecutionEnv;
}

export type ExtractRecordFromUnion<Union> = {
  [K in keyof TypeRegistry as TypeRegistry[K] extends Union ? K : never]: TypeRegistry[K];
};
