declare module 'foremanReact/common/hooks/API/APIHooks' {
  import { Dispatch, SetStateAction } from 'react';

  interface APIOptions {
    key?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface UseAPIReturn<T> {
    response: T;
    status: 'PENDING' | 'RESOLVED' | 'ERROR';
    key: string;
    setAPIOptions: Dispatch<SetStateAction<APIOptions>>;
  }

  interface SortOptions {
    by: string | null;
    order: string | null;
  }

  export interface IndexResponse extends PaginationProps {
    total: number;
    subtotal: number;
    // eslint-disable-next-line camelcase
    search: string | null;
    sort: SortOptions;
  }

  export interface PaginationProps {
    page: number;
    // eslint-disable-next-line camelcase
    per_page: number;
  }

  export const useAPI: <T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    options?: APIOptions
  ) => UseAPIReturn<T>;
}
