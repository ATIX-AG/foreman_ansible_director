declare module 'foremanReact/components/Permitted' {
  import { ReactElement } from 'react';

  interface PermittedProps<TPermitted, TUnpermitted> {
    requiredPermissions: string[];
    children?: TPermitted;
    unpermittedComponent?: TUnpermitted;
  }

  const Permitted: <TPermitted = ReactElement, TUnpermitted = ReactElement>(
    props: PermittedProps
  ) => TPermitted | TUnpermitted;

  export default Permitted;
}
