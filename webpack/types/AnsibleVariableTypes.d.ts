import { Identifiable } from './AnsibleExecutionEnvTypes';
import { AnsibleCollectionRoleAssignment, AnsibleRoleAssignment } from './AnsibleContentAssignmentTypes';
import { Assignable, Consumable } from './DynamicAssignmentTypes';

export interface AnsibleVariable extends Identifiable {
  name: string;
  data_type: AnsibleVariableDataType;
  query: VariableValueQueryType;
  transformer: VariableValueTransformerType;
  // API always(!) returns values as YAML
  raw_value: string;
  bindings_count: number;
  parsed_value: AnsibleVariableParsedType;
}

export interface AnsibleVariableBinding extends Identifiable, Assignable, Consumable {
  data_type: AnsibleVariableDataType;
  raw_value: string;
  query: VariableValueQueryType;
  transformer: VariableValueTransformerType;
  consumable_name: string;
}

// Narrower Variable types

// Narrower binding types

export interface BoundAnsibleVariable extends AnsibleVariable {
  binding: AnsibleVariableBinding | null;
}

// Helper types

export type VariableValueTransformerType = 'static';
export type VariableValueQueryType = 'local';

export type AnsibleVariableDataTypeString = 'string';
export type AnsibleVariableDataTypeBoolean = 'boolean';
export type AnsibleVariableDataTypeFloat = 'float';
export type AnsibleVariableDataTypeInteger = 'integer';
export type AnsibleVariableDataTypeDictionary = 'dictionary';
export type AnsibleVariableDataTypeArray = 'array';
export type AnsibleVariableDataTypeUnknown = 'unknown';

export type AnsibleVariableParsedTypeString = string;
export type AnsibleVariableParsedTypeBoolean = boolean;
export type AnsibleVariableParsedTypeFloat = number;
export type AnsibleVariableParsedTypeInteger = number;
export type AnsibleVariableParsedTypeDictionary = object;
export type AnsibleVariableParsedTypeArray = Record<unknown, unknown>;
export type AnsibleVariableParsedTypeUnknown = null;

export type AnsibleVariableParsedType =
  AnsibleVariableParsedTypeString
  | AnsibleVariableParsedTypeBoolean
  | AnsibleVariableParsedTypeFloat
  | AnsibleVariableParsedTypeInteger
  | AnsibleVariableParsedTypeDictionary
  | AnsibleVariableParsedTypeArray
  | AnsibleVariableParsedTypeUnknown;

export type AnsibleVariableDataType =
  AnsibleVariableDataTypeString
  | AnsibleVariableDataTypeBoolean
  | AnsibleVariableDataTypeFloat
  | AnsibleVariableDataTypeInteger
  | AnsibleVariableDataTypeDictionary
  | AnsibleVariableDataTypeArray
  | AnsibleVariableDataTypeUnknown;

export type WithResolvedVariables<T = AnsibleCollectionRoleAssignment | AnsibleRoleAssignment> = T & {
  variables: BoundAnsibleVariable[];
};
