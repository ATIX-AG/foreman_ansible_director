declare module 'foremanReact/components/PF4/TableIndexPage/Table/TableIndexHooks' {
  import { Dispatch, SetStateAction } from 'react';

  import {
    APIOptions,
    UseAPIReturn,
  } from 'foremanReact/common/hooks/API/APIHooks';

  export const useTableIndexAPIResponse: <T>({
    replacementResponse,
    apiUrl,
    apiOptions,
    defaultParams,
  }: {
    replacementResponse?: UseAPIReturn<T>;
    apiUrl: string;
    apiOptions?: APIOptions;
    defaultParams?: APIOptions;
  }) => UseAPIReturn<T>;

  export const useSetParamsAndApiAndSearch: ({
    defaultParams,
    apiOptions,
    setAPIOptions,
    updateSearchQuery,
    pushToHistory,
  }: {
    defaultParams: APIOptions;
    apiOptions?: APIOptions;
    setAPIOptions: Dispatch<SetStateAction<APIOptions>>;
    updateSearchQuery?: (search: string) => void;
    pushToHistory?: boolean;
  }) => {
    setParamsAndAPI: Dispatch<SetStateAction<APIOptions>>;
    setSearch: Dispatch<SetStateAction<string>>;
    params: APIOptions;
  };
}
