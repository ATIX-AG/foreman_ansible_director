import React, { ReactElement, ReactNode } from 'react';
import { useForemanPermissions } from 'foremanReact/Root/Context/ForemanContext';
import PermissionDenied from 'foremanReact/components/PermissionDenied';

interface PermittedProps {
  requiredPermissions?: string[];
  children?: ReactNode;
  unpermittedComponent?: ReactNode;
}

/**
 * Component to conditionally render a node if the current user has the requested permissions.
 * Multiple permissions may be required by passing an array via **requiredPermissions**.
 *
 * @param {array<string>} requiredPermissions: An array of permission string.
 * @param {node} children: The node to be conditionally rendered
 * @param {node} unpermittedComponent: Component to be rendered if the desired permission is not met. Defaults to null.
 */
export const Permitted = ({
  requiredPermissions,
  children,
  unpermittedComponent,
}: PermittedProps): ReactElement => {
  const userPermissions = useForemanPermissions();

  const isPermitted =
    requiredPermissions &&
    requiredPermissions.every(permission => userPermissions.has(permission));

  if (isPermitted) {
    return <>{children}</>;
  }

  if (unpermittedComponent !== undefined) {
    return <>{unpermittedComponent}</>;
  }

  return (
    <PermissionDenied
      missingPermissions={
        Array.isArray(requiredPermissions)
          ? requiredPermissions.filter(p => !userPermissions.has(p))
          : []
      }
    />
  );
};
