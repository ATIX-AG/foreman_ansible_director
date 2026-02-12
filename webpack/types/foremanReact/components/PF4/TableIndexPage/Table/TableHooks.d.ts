declare module 'foremanReact/components/PF4/TableIndexPage/Table/TableHooks' {
  export const useUrlParams: () => {
    searchParam: string;
    [key: string]: string;
  };
}
