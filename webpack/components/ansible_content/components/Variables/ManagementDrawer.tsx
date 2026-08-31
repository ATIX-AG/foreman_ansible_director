import React, { ReactElement } from 'react';
import { Drawer, DrawerContent, DrawerContentBody, DrawerPanelContent } from '@patternfly/react-core';
import { VariableList } from './VariableList';
import { AnsibleVariable } from '../../../../types/AnsibleVariableTypes';
import { DrawerVariableContent } from './components/DrawerVariableContent';
import { DrawerBindingContentWrapper } from './components/DrawerBindingContentWrapper';
import { CollectionRoleAssignable } from '../../../../types/DynamicAssignmentTypes';

interface ManagementDrawerProps {
  assignable: CollectionRoleAssignable;
  variables: AnsibleVariable[];
  onDrawerClose: () => void;
}

export const ManagementDrawer = ({
  assignable,
  variables,
  onDrawerClose,
}: ManagementDrawerProps): ReactElement => {

  const [managementMode, setManagementMode] = React.useState<
    { mode: 'variable'; variable: AnsibleVariable }
    | { mode: 'binding'; variable: AnsibleVariable }
    | null
  >(null);

  const drawerRef = React.useRef<HTMLDivElement>();

  const onExpand = (): void => {
    drawerRef.current && drawerRef.current.focus();
  };

  const panelContent = (
    <DrawerPanelContent isResizable defaultSize={'80%'}>
      {managementMode !== null && (
        managementMode.mode === 'variable'
          ? (
            <DrawerVariableContent
              drawerRef={drawerRef}
              variable={managementMode.variable}
              onCloseClick={() => {
                setManagementMode(null);
                onDrawerClose();
              }}
              onSuccess={() => {
                setManagementMode(null);
                onDrawerClose();
              }}
            />
          )
          : (
            <DrawerBindingContentWrapper
              assignable={assignable}
              drawerRef={drawerRef}
              variable={managementMode.variable}
              onCloseClick={() => {
                setManagementMode(null);
                onDrawerClose();
              }}
            />
          )
      )}
    </DrawerPanelContent>
  );

  const drawerContent = (
    <VariableList
      variables={variables}
      onManageBindingsClick={
        clickedVariable => setManagementMode({ mode: 'binding', variable: clickedVariable })
      }
      onManageVariablesClick={
        clickedVariable => setManagementMode({ mode: 'variable', variable: clickedVariable })
      }
    />
  );

  return (
    <>
      <Drawer isExpanded={managementMode !== null} onExpand={onExpand}>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>{drawerContent}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
