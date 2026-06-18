declare module 'foremanReact/components/PermissionDenied' {
  import { ReactElement } from 'react';

  interface PermissionDeniedProps {
    missingPermissions: string[];
    primaryButton?: ReactElement;
  }

  const PermissionDenied = (props: PermissionDeniedProps): ReactElement =>
    ReactElement;

  export default PermissionDenied;
}
