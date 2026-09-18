declare module 'foremanReact/components/ToastsList' {
  import type { AnyAction } from 'redux';

  interface toastParams {
    type: 'success' | 'danger' | 'warning' | 'info' | 'custom';
    key: string;
    message: string | React.JSX.Element;
    sticky: boolean;
  }
  export const addToast: (params: toastParams) => AnyAction;
  export const deleteToast: () => void;
}
