import { translate as _ } from 'foremanReact/common/I18n';
import { load } from 'js-yaml';
import {
  AnsibleVariable,
  AnsibleVariableDataType, AnsibleVariableParsedType,
  VariableValueQueryType,
  VariableValueTransformerType,
} from '../../../../../types/AnsibleVariableTypes';
import { HierarchicalBinding } from './components/BindingDetailModalWrapper';

export const transformerIdUiStringMap: Record<VariableValueTransformerType, string> = {
  static: _('None (Static value)'),
};

export const queryIdUiStringMap: Record<VariableValueQueryType, string> = {
  local: _('Local (Foreman database)'),
};

export const dataTypeDisplayNameMap: Record<AnsibleVariableDataType, string> = {
  boolean: 'Boolean',
  string: 'String',
  float: 'Float',
  integer: 'Integer',
  dictionary: 'Dictionary',
  array: 'List',
  unknown: 'Unknown',
};

// Rather crude mapping of Ansible variable/binding value type to whatever typeof returns
export const dataTypeParsedTypeMap: Record<Exclude<AnsibleVariableDataType, 'unknown' | 'array' | 'dictionary'>, string> = {
  string: 'string',
  boolean: 'boolean',
  float: 'number',
  integer: 'number',
};

export const isHierarchicalBinding = (
  item: AnsibleVariable | HierarchicalBinding
): item is HierarchicalBinding => 'content_resolution_node' in item;

export type YamlValidity =
  | { state: 'valid'; parsed: AnsibleVariableParsedType }
  | { state: 'invalid'; error: Error }
  | { state: 'type_mismatch'; parsedType: string; expectedType: AnsibleVariableDataType };

export const getYamlValidity = (value: string, valueType: AnsibleVariableDataType): YamlValidity => {
  let parsed: AnsibleVariableParsedType;
  try {
    parsed = load(value) as AnsibleVariableParsedType;
  } catch (e) {
    return { state: 'invalid', error: e as Error };
  }

  const ok = ((): boolean => {
    switch (valueType) {
      case 'boolean': case 'string': case 'float': case 'integer':
        return typeof parsed === dataTypeParsedTypeMap[valueType];
      case 'dictionary':
        return typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null;
      case 'array':
        return Array.isArray(parsed);
      case 'unknown':
        return true;
    }
  })();

  return ok
    ? { state: 'valid', parsed }
    : { state: 'type_mismatch', parsedType: typeof parsed, expectedType: valueType };
};
