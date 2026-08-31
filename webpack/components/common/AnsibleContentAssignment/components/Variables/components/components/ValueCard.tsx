import React, { ReactElement } from 'react';
import { Card, CardBody, CardTitle, StackItem, Tab, Tabs } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { ValuePresenter } from '../ValuePresenter';
import {
  AnsibleVariableDataType,
  VariableValueQueryType,
  VariableValueTransformerType,
} from '../../../../../../../types/AnsibleVariableTypes';
import { YamlEditor } from '../../../../../YamlEditor';
import { DetailsCard } from './DetailsCard';
import { ContentResolutionNode } from '../../../../../../../types/AnsibleContentAssignmentTypes';

interface PropsForVariable {
  variant: 'variable';
  crn?: never;
}

interface PropsForBinding {
  variant: 'binding';
  crn: ContentResolutionNode;
}

interface PropsForBindingCreate {
  variant: 'bindingCreate';
  crn?: never;
}

interface BaseProps {
  itemType: AnsibleVariableDataType;
  itemValue: string;
  valueQuery: VariableValueQueryType;
  valueTransformer: VariableValueTransformerType;
  onItemTypeChange: (type: AnsibleVariableDataType) => void;
  onItemValueChange: (value: string) => void;
  isDisabled: boolean;
}

type ValueCardProps = BaseProps & (PropsForVariable | PropsForBinding | PropsForBindingCreate);

export const ValueCard = ({
  variant,
  itemType,
  itemValue,
  valueQuery,
  valueTransformer,
  onItemTypeChange,
  onItemValueChange,
  crn,
  isDisabled,
}: ValueCardProps): ReactElement => {

  const [selectedTabIndex, setSelectedTabIndex] = React.useState<number>(0);

  const presenter = (): ReactElement => {
    if (variant === 'binding') {
      return (
        <ValuePresenter
          valueType={itemType}
          value={itemValue}
          onValueChange={newValue => onItemValueChange(newValue)}
          isDisabled={isDisabled}
          variant="binding"
          crn={crn}
        />
      );
    } else {
      return (
        <ValuePresenter
          valueType={itemType}
          value={itemValue}
          onValueChange={newValue => onItemValueChange(newValue)}
          isDisabled={isDisabled}
          variant="variable"
        />
      );
    }
  };

  return (
    <>
      <StackItem>
        <DetailsCard
          variant={variant}
          valueQuery={valueQuery}
          valueTransformer={valueTransformer}
          itemType={itemType}
          onItemTypeChange={type => onItemTypeChange(type)}
          isDisabled={isDisabled}
        />
      </StackItem>
      <StackItem>
        <Card>
          <CardTitle>{variant === 'variable' ? _('Variable value') : _('Binding value')}</CardTitle>
          <CardBody>
            <Tabs
              activeKey={selectedTabIndex}
              onSelect={(_event, eventKey) => setSelectedTabIndex(eventKey as number)}
              isBox
              isFilled
            >
              <Tab title={_('Visual mode')} eventKey={0}>
                {presenter()}
              </Tab>
              <Tab title={_('Raw YAML')} eventKey={1}>
                <YamlEditor
                  yamlFile={itemValue}
                  setYamlFile={newValue => onItemValueChange(newValue)}
                  isReadOnly={isDisabled}
                />
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </StackItem>
    </>
  );
};
