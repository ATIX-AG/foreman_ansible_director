import {
  Button,
  DrawerActions,
  DrawerCloseButton,
  DrawerContentBody,
  DrawerHead,
  Label,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import React, { LegacyRef, MutableRefObject, ReactElement, useMemo } from 'react';
import { translate as _ } from 'foremanReact/common/I18n';
import UndoIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';
import {
  AnsibleVariable as AnsibleVariableType,
  AnsibleVariableDataType,
} from '../../../../../types/AnsibleVariableTypes';
import {
  ValueCard,
} from '../../../../common/AnsibleContentAssignment/components/Variables/components/components/ValueCard';
import { getYamlValidity } from '../../../../common/AnsibleContentAssignment/components/Variables/utils';
import { useToasts } from '../../../../../helpers/toasts/useToasts';
import { AnsibleVariable } from '../../../../../resources/clients/AnsibleVariable';

interface DrawerVariableContentProps {
  drawerRef: MutableRefObject<HTMLElement | undefined>;
  variable: AnsibleVariableType;
  onCloseClick: () => void;
  onSuccess: () => void;
}

export const DrawerVariableContent = ({
  variable,
  drawerRef,
  onCloseClick,
  onSuccess,
}: DrawerVariableContentProps): ReactElement => {

  const [variableType, setVariableType] = React.useState<AnsibleVariableDataType>(variable.data_type);
  // EVERYTHING IS YAML
  const [variableValue, setVariableValue] = React.useState<string>(variable.raw_value);

  const yamlValidity = useMemo(() => {
    return getYamlValidity(variableValue, variableType);
  }, [variableValue, variableType]);

  const { withToast } = useToasts();

  return (
    <>
      <Stack>
        <StackItem>
          <DrawerHead>
            {/* Cast is fine here. This is how it is done in PatternFly docs.*/}
            <span tabIndex={0} ref={drawerRef as LegacyRef<HTMLSpanElement> | undefined}>
              <TextContent>
                <Text component={TextVariants.h2}>{_(`Manage variable "${variable.name}"`)}</Text>
              </TextContent>
            </span>
            <DrawerActions>
              {
                variableType !== variable.data_type || variableValue !== variable.raw_value && (
                  <Label
                    onClick={() => {
                      setVariableType(variable.data_type);
                      setVariableValue(variable.raw_value);
                    }}
                    icon={<UndoIcon />}
                    color={'orange'}
                  >
                    Revert
                  </Label>
                )
              }
              <DrawerCloseButton onClick={onCloseClick} />
            </DrawerActions>
          </DrawerHead>
          <DrawerContentBody>
            <Stack hasGutter style={{ paddingTop: '15px', paddingBottom: '15px' }}>
              <ValueCard
                onItemTypeChange={type => setVariableType(type)}
                onItemValueChange={value => setVariableValue(value)}
                variant={'variable'}
                itemType={variableType}
                itemValue={variableValue}
                valueTransformer={'static'}
                valueQuery={'local'}
                isDisabled={false}
              />
            </Stack>
          </DrawerContentBody>
        </StackItem>
        <StackItem isFilled />
        <StackItem>
          <>
            <div style={{ padding: '0 0 1rem 1rem' }}>
              <Button
                key="confirm"
                variant={yamlValidity.state === 'type_mismatch' ? 'warning' : 'primary'}
                isDisabled={yamlValidity.state === 'invalid'}
                onClick={async () => {
                  await withToast({
                    type: 'update',
                    resource: 'ansible_variable',
                    func: AnsibleVariable.updatePartial(variable.id, {
                      ansible_variable: {
                        data_type: variableType,
                        raw_value: variableValue,
                      },
                    }),
                  });
                  onSuccess();
                }}
              >
                {yamlValidity.state === 'type_mismatch' ? 'Confirm (I know what I am doing)' : 'Confirm'}
              </Button>
              <Button
                key="cancel"
                variant="link"
                onClick={onCloseClick}
              >
                Cancel
              </Button>
            </div>
          </>
        </StackItem>
      </Stack>
    </>
  );

};
