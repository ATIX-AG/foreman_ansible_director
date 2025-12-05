import React, { ReactElement } from 'react';
import {
  Button,
  ButtonProps,
  Popover,
  PopoverProps,
} from '@patternfly/react-core';
// import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';

type PermittedButtonProps = PermittedButtonMainProps &
  (PermittedButtonWithoutPopoverProps | PermittedButtonWithPopoverProps);

interface PermittedButtonMainProps extends ButtonProps {
  requiredPermissions: string[];
  hasErrorPopover?: boolean;
}

interface PermittedButtonWithPopoverProps {
  hasPopover: boolean;
  popoverProps: PopoverProps;
}

interface PermittedButtonWithoutPopoverProps {
  hasPopover?: false;
  popoverProps?: never;
}

// TODO: Refactor this, so it can do conjunction or disjunction
export const PermittedButton = ({
  requiredPermissions,
  hasErrorPopover = true,
  popoverProps = {} as PopoverProps,
  hasPopover,
  children,
  ...buttonProps
}: PermittedButtonProps): ReactElement => {
  const userHasPermissions: boolean = usePermissions(requiredPermissions);

  if (!userHasPermissions && hasErrorPopover) {
    popoverProps.bodyContent = (
      <>
        <span>
          Please request the required permissions listed below from a Foreman
          administrator:
          {requiredPermissions.map(permission => (
            <li key={permission}>
              <strong>{permission}</strong>
            </li>
          ))}
        </span>
      </>
    );
    popoverProps.headerComponent = 'h1';
    popoverProps.headerContent = 'Permission missing';
    popoverProps.alertSeverityVariant = 'warning';
    popoverProps.triggerAction = 'hover';
    // The icon is currently offset for an unknown reason.
    // Disabling the icon until a fix is found
    // popoverProps.headerIcon = <ExclamationTriangleIcon />;
  }

  const showPopover =
    (hasPopover || hasErrorPopover) && Object.keys(popoverProps).length > 0;

  return (
    <>
      {showPopover ? (
        <Popover {...popoverProps}>
          <Button isAriaDisabled={!userHasPermissions} {...buttonProps}>
            {children}
          </Button>
        </Popover>
      ) : (
        <Button isAriaDisabled={!userHasPermissions} {...buttonProps}>
          {children}
        </Button>
      )}
    </>
  );
};
