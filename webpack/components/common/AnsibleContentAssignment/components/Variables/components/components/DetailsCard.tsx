import React, { ReactElement } from 'react';
import {
  Card,
  CardBody,
  DescriptionList, DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm, Dropdown, DropdownItem, DropdownList, FormGroup,
  Grid,
  GridItem, Label, MenuToggle, MenuToggleElement, Popover,
} from '@patternfly/react-core';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { dataTypeDisplayNameMap, queryIdUiStringMap, transformerIdUiStringMap } from '../../utils';
import {
  AnsibleVariableDataType, VariableValueQueryType, VariableValueTransformerType,
} from '../../../../../../../types/AnsibleVariableTypes';
import { ContentResolutionNode } from '../../../../../../../types/AnsibleContentAssignmentTypes';
import { hierarchyIconMap } from '../../../../AnsibleContentAssignment';
import { crColorHierarchy, crnTypeUiString } from '../../../../helpers';

interface DetailsCardBaseProps {
  variant: 'variable' | 'binding' | 'bindingCreate';
  valueQuery: VariableValueQueryType;
  valueTransformer: VariableValueTransformerType;
  itemType: AnsibleVariableDataType;
  onItemTypeChange: (type: AnsibleVariableDataType) => void;
  isDisabled: boolean;
}

interface DetailsCardVariableProps {
  variant: 'variable';
}

interface DetailsCardBindingCreateProps {
  variant: 'bindingCreate';
}

interface DetailsCardBindingProps {
  variant: 'binding';
  boundNode: ContentResolutionNode;
}

type DetailsCardProps = DetailsCardBaseProps & (DetailsCardVariableProps | DetailsCardBindingProps | DetailsCardBindingCreateProps);

export const DetailsCard = (
  props: DetailsCardProps
): ReactElement => {

  const {
    variant,
    valueQuery,
    valueTransformer,
    itemType,
    onItemTypeChange,
    isDisabled,
  } = props;

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = React.useState<boolean>(false);

  return (
    <Card>
      <CardBody>
        <Grid>
          <GridItem span={8} rowSpan={2}>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {variant === 'variable' ? _('Variable value source') : _('Binding value source')}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {queryIdUiStringMap[valueQuery]}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {variant === 'variable' ? _('Variable value transformation') : _('Binding value transformation')}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {transformerIdUiStringMap[valueTransformer]}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {variant === 'binding' && (
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {_('Bound node')}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    {
                      <Label
                        icon={hierarchyIconMap[props.boundNode.type]}
                      >
                        {props.boundNode.name}
                      </Label>
                    }
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </GridItem>
          <GridItem span={4}>
            <FormGroup
              label={<b>{_('Value type')}</b>}
              labelIcon={
                <Popover
                  headerContent={<div>{_('Variable type')}</div>}
                  bodyContent={
                    <div>
                      {_(
                        'Select the value type used to validate this value.'
                      )}
                    </div>
                  }
                >
                  <button
                    type="button"
                    aria-label={_('More info for variable type')}
                    onClick={e => e.preventDefault()}
                    aria-describedby="variable-type-identifier-field"
                    className={styles.formGroupLabelHelp}
                  >
                    <HelpIcon />
                  </button>
                </Popover>
              }
            >
              <Dropdown
                isOpen={isTypeDropdownOpen}
                onSelect={(_event, value) => {
                  onItemTypeChange(value as AnsibleVariableDataType);
                  setIsTypeDropdownOpen(false);
                }}
                onOpenChange={(isOpen: boolean) => { setIsTypeDropdownOpen(isOpen); }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    isFullWidth
                    onClick={() => {
                      setIsTypeDropdownOpen(!isTypeDropdownOpen);
                    }}
                    isExpanded={isTypeDropdownOpen}
                    isDisabled={isDisabled}
                  >
                    {dataTypeDisplayNameMap[itemType]}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
              >
                <DropdownList>
                  {Object.entries(dataTypeDisplayNameMap).map(pair => (
                    <DropdownItem
                      value={pair[0]}
                      key={pair[0]}
                    >
                      {pair[1]}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
            </FormGroup>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};
