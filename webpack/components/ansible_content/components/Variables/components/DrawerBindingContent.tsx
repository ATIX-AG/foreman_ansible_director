import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DrawerActions,
  DrawerCloseButton, DrawerHead,
  Flex,
  FlexItem,
  Stack, StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import React, { LegacyRef, MutableRefObject, ReactElement } from 'react';
import { translate as _ } from 'foremanReact/common/I18n';
import { AnsibleVariable, AnsibleVariableBinding } from '../../../../../types/AnsibleVariableTypes';
import { BindingIndexContent } from './components/BindingIndexContent';
import { BindingCreateContent } from './components/BindingCreateContent';
import { BindingDetailsContent } from './components/BindingDetailsContent';
import { CollectionRoleAssignable } from '../../../../../types/DynamicAssignmentTypes';

interface DrawerBindingContentProps {
  drawerRef: MutableRefObject<HTMLElement | undefined>;
  variable: AnsibleVariable;
  bindings: AnsibleVariableBinding[];
  onCloseClick: () => void;
  assignable: CollectionRoleAssignable;
  onSuccess: () => void;
}

export const DrawerBindingContent = ({
  variable,
  drawerRef,
  onCloseClick,
  bindings,
  assignable,
  onSuccess,
}: DrawerBindingContentProps): ReactElement => {

  const [navigationState, setNavigationState] = React.useState<
    { state: 'bindingIndex'; binding: null }
    | { state: 'bindingDetails'; binding: AnsibleVariableBinding }
    | { state: 'bindingCreate'; binding: null }
  >({ state: 'bindingIndex', binding: null });

  const breadCrumbs = (): ReactElement => {
    return (
      <Breadcrumb ouiaId="BasicBreadcrumb">
        <BreadcrumbItem
          component={'button'}
          onClick={() => setNavigationState({ state: 'bindingIndex', binding: null })}
        >
          Binding index
        </BreadcrumbItem>
        {navigationState.state === 'bindingDetails' && (<BreadcrumbItem>Binding</BreadcrumbItem>)}
        {navigationState.state === 'bindingCreate' && (<BreadcrumbItem>Create Binding</BreadcrumbItem>)}
      </Breadcrumb>
    );
  };

  const bindingIndex = (): ReactElement => {
    return (
      <>
        <StackItem>
          <Flex style={{ padding: '0.5rem 0 0.5rem 0' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              {breadCrumbs()}
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              <Button
                variant={'primary'}
                onClick={
                  () => setNavigationState({ state: 'bindingCreate', binding: null })
                }
              >Create Binding</Button>
            </FlexItem>
          </Flex>
        </StackItem>
        <BindingIndexContent
          variable={variable}
          bindings={bindings}
          onBindingManageClick={
            binding => setNavigationState({ state: 'bindingDetails', binding: binding })
          }
          onSuccess={onSuccess}
        />
      </>
    );
  };

  const bindingDetails = (): ReactElement | null => {
    return (
      navigationState.state === 'bindingDetails'
        ? (<>
          <StackItem>
            <Flex style={{ padding: '0.5rem 0 0.5rem 0' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem>
                {breadCrumbs()}
              </FlexItem>
            </Flex>
          </StackItem>
          <BindingDetailsContent
            binding={navigationState.binding}
            onSuccess={onSuccess}
            onAbort={() => setNavigationState({ state: 'bindingIndex', binding: null })}
            boundNode={{
              id: navigationState.binding.consumable_id,
              name: navigationState.binding.consumable_name,
              type: navigationState.binding.consumable_type,
            }}
          />
        </>)
        : null
    );
  };

  const bindingCreate = (): ReactElement => {
    return (
      <>
        <StackItem>
          <Flex style={{ padding: '0.5rem 0 0.5rem 0' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              {breadCrumbs()}
            </FlexItem>
          </Flex>
        </StackItem>
        <BindingCreateContent
          assignable={assignable}
          variable={variable}
          onSuccess={onSuccess}
          onAbort={() => setNavigationState({ state: 'bindingIndex', binding: null })}
        />
      </>
    );
  };

  const drawerContent = (): ReactElement | null => {
    if (navigationState.state === 'bindingIndex') {
      return bindingIndex();
    } else if (navigationState.state === 'bindingDetails') {
      return bindingDetails();
    }
    // state = bindingCreate
    else {
      return bindingCreate();
    }
  };

  return (
    <Stack>
      <StackItem>
        <DrawerHead>
          {/* Cast is fine here. This is how it is done in PatternFly docs.*/}
          <span tabIndex={0} ref={drawerRef as LegacyRef<HTMLSpanElement> | undefined}>
            <TextContent>
              <Text component={TextVariants.h2}>{_(`Manage bindings for variable "${variable.name}"`)}</Text>
            </TextContent>
          </span>
          <DrawerActions>
            <DrawerCloseButton onClick={onCloseClick} />
          </DrawerActions>
        </DrawerHead>
      </StackItem>
      {drawerContent()}
    </Stack>

  );

};
