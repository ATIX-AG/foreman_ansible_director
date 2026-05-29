declare module 'foremanReact/components/ToastsList' {
  interface toastParams {
    type: 'success' | 'danger' | 'warning' | 'info' | 'custom';
    key: string;
    message: string | React.JSX.Element;
    sticky: boolean;
  }
  export const addToast: (params: toastParams) => unknown;
  export const deleteToast: () => void;
}
