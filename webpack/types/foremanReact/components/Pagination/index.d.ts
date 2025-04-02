declare module 'foremanReact/components/Pagination' {
  import React from 'react';
  import { PaginationVariant } from '@patternfly/react-core';

  interface PaginationProps {
    onSetPage?: (nextPage: number) => void;
    onPerPageSelect?: (nextPerPage: number) => void;
    itemCount: number;
    className?: string;
    page?: number;
    perPage?: number;
    noSidePadding?: boolean;
    variant?: PaginationVariant;
    // eslint-disable-next-line camelcase
    onChange?: (params: { page: number; per_page: number }) => void;
    updateParamsByUrl?: boolean;
  }

  const Pagination: React.FC<PaginationProps>;

  export default Pagination;
}
