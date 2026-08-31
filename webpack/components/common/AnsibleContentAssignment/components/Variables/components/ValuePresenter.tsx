import React, { ReactElement } from 'react';
import {
  Alert,
  AlertActionLink,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { dump, load } from 'js-yaml';
import { translate as _ } from 'foremanReact/common/I18n';
import OutlinedDizzyIcon from '@patternfly/react-icons/dist/esm/icons/outlined-dizzy-icon';
import global_warning_color_100 from '@patternfly/react-tokens/dist/esm/global_warning_color_100';
import { AnsibleVariableDataType, AnsibleVariableParsedType } from '../../../../../../types/AnsibleVariableTypes';
import {
  YamlAdapter,
} from '../../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/YamlAdapter';
import {
  StringAdapter,
} from '../../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/StringAdapter';
import {
  BooleanAdapter,
} from '../../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/BooleanAdapter';
import { YamlParsedTypeMismatchErrorState } from './components/YamlParsedTypeMismatchErrorState';
import { dataTypeParsedTypeMap } from '../utils';
import { YamlErrorState } from './components/YamlErrorState';
import { ContentResolutionNode } from '../../../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUiString } from '../../../helpers';
import {
  IntegerAdapter,
} from '../../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/IntegerAdapter';
import {
  RealAdapter,
} from '../../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/RealAdapter';
import {
  ArrayAdapter,
} from '../../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/ArrayAdapter';

interface ValuePresenterBaseProps {
  variant: 'variable' | 'binding';
  valueType: AnsibleVariableDataType;
  value: string;
  onValueChange: (newValue: string) => void;
  isDisabled: boolean;
  crn?: ContentResolutionNode;
}

interface PropsForVariable {
  variant: 'variable';
  crn?: never;
}

interface PropsForBinding {
  variant: 'binding';
  crn: ContentResolutionNode;
}

type ValuePresenterProps = ValuePresenterBaseProps & (PropsForBinding | PropsForVariable);

export const ValuePresenter = ({
  variant,
  valueType,
  value,
  onValueChange,
  isDisabled,
  crn,
}: ValuePresenterProps): ReactElement => {

  let loadedValue: AnsibleVariableParsedType;

  try {
    // This raises in case the YAML is invalid. Exception is handled by the error boundary.
    // Casting here because I can't be asked to write type-guards for all of those types.
    loadedValue = load(value) as AnsibleVariableParsedType;
  } catch (e) {
    return (
      <YamlErrorState error={e as Error} />
    );

  }

  const assertCorrectParsedType = (): boolean => {
    switch (valueType) {
      case 'boolean':
      case 'string':
      case 'float':
      case 'integer':
        return typeof loadedValue === dataTypeParsedTypeMap[valueType];
      case 'dictionary':
        return typeof loadedValue === 'object' && !Array.isArray(loadedValue) && loadedValue !== null;
      case 'array':
        return Array.isArray(loadedValue);
      case 'unknown':
        // "unknown" is a special case, where no dedicated adapter exists.
        return true;
    }
  };

  const onValue = (value: AnsibleVariableParsedType): void => {
    onValueChange(`---\n${dump(value)}`);
  };

  const valueRenderer = (): ReactElement => {
    if (assertCorrectParsedType()) {
      switch (valueType) {
        case 'string':
          return (
            <StringAdapter
              isEditMode={!isDisabled}
              value={loadedValue as string}
              onChange={onValue}
            />
          );
        case 'boolean':
          return (
            <BooleanAdapter
              isEditMode={!isDisabled}
              value={loadedValue as boolean}
              onChange={onValue}
            />
          );
        case 'integer':
          return (
            <IntegerAdapter
              isEditMode={!isDisabled}
              value={loadedValue as number}
              onChange={onValue}
            />
          );
        case 'float':
          return (
            <RealAdapter
              isEditMode={!isDisabled}
              value={loadedValue as number}
              onChange={onValue}
            />
          );
        case 'array':
          return (
            <ArrayAdapter
              isEditMode={!isDisabled}
              value={loadedValue as string[]}
              onChange={onValue}
            />
          );
        case 'unknown':
          return (
            <EmptyState>
              <EmptyStateHeader
                titleText={_('Unknown variable type')}
                headingLevel="h4"
                icon={<EmptyStateIcon icon={OutlinedDizzyIcon} color={global_warning_color_100.var} />}
              />
              <EmptyStateBody>
                {_('The type of this variable could not be extracted during importing. Set the correct type or use the YAML input.')}
              </EmptyStateBody>
            </EmptyState>
          );
        default:
          return (
            <YamlAdapter
              isEditMode={!isDisabled}
              value={value}
              onChange={onValue}
            />
          );
      }
    } else {
      return (
        <YamlParsedTypeMismatchErrorState
          parsedType={typeof loadedValue}
          expectedType={valueType}
        />
      );
    }
  };

  return (
    <>
      {isDisabled && (
        <Alert
          title={_('Cross-node value editing disabled.')}
          variant="warning"
          isInline
          actionLinks={
            <>
              <AlertActionLink component="a" href="#">
                {variant === 'variable' ? (
                  _('Ansible > Ansible Content > Variables')
                ) : (_(`Configure > ${crnTypeUiString[crn.type]} > ${crn.name}`))}
              </AlertActionLink>
            </>
          }
        >
          {
            variant === 'variable'
              ? (_('Editing of variable default values from consumer nodes is disabled. Enable the "ansible_director_vars_cross_node_editing" setting or edit the default value on the Ansible Variables page.'))
              : (_(`Editing of values not bound to this node is disabled. Enable the "ansible_director_vars_cross_node_editing" setting or edit the value on the Ansible Director page of ${crnTypeUiString[crn.type]} ${crn.name}.`))
          }

        </Alert>
      )}

      <Bullseye>
        <div style={{ paddingTop: 20, width: '100%' }}>
          {valueRenderer()}
        </div>
      </Bullseye>
    </>
  );
};
