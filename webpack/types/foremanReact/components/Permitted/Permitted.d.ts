declare module 'foremanReact/components/Permitted' {
  import { ReactElement } from 'react';

  interface PermittedProps {
    requiredPermissions: string[];
    children?: ReactElement;
    unpermittedComponent?: ReactElement;
  }

  const Permitted: (props: PermittedProps) => ReactElement;

  export default Permitted;
}
