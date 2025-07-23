import React, { Dispatch, SetStateAction } from 'react';
import { Table, Thead, Th, Tbody, Tr } from '@patternfly/react-table';
import Pagination from 'foremanReact/components/Pagination';
import {
  APIOptions,
  PaginationProps,
} from 'foremanReact/common/hooks/API/APIHooks';
import { GetAnsibleContentResponse } from './AnsibleContentTableWrapper';
import AnsibleContentTablePrimaryRow from './AnsibleContentTablePrimaryRow';
import AnsibleContentTableSecondaryRow from './AnsibleContentTableSecondaryRow';
import { AnsibleContentUnit } from '../../../types/AnsibleContentTypes';

interface AnsibleContentTableProps {
  apiResponse: GetAnsibleContentResponse;
  setAPIOptions: Dispatch<SetStateAction<APIOptions>>;
  onPagination: (newPagination: PaginationProps) => void;
}

export const AnsibleContentTable: React.FC<AnsibleContentTableProps> = ({
  apiResponse,
  setAPIOptions,
  onPagination,
}) => {
  const [expandedNodeNames, setExpandedNodeNames] = React.useState<string[]>(
    []
  );
  const [
    expandedDetailsNodeNames,
    setExpandedDetailsNodeNames,
  ] = React.useState<string[]>([]);
  const renderRows = (results: AnsibleContentUnit[]): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    let posInset = 0;

    results.forEach(result => {
      const identifier = `${result.namespace}.${result.name}`;
      const isExpanded = expandedNodeNames.includes(result.name);

      rows.push(
        <AnsibleContentTablePrimaryRow
          node={result}
          setExpandedNodeNames={setExpandedNodeNames}
          setExpandedDetailsNodeNames={setExpandedDetailsNodeNames}
          isExpanded={isExpanded}
          isDetailsExpanded={expandedDetailsNodeNames.includes(result.name)}
          posInset={posInset}
          identifier={identifier}
          key={identifier}
        />,
        <AnsibleContentTableSecondaryRow
          identifier={identifier}
          nodeVersions={result.versions}
          isExpanded={isExpanded}
        />
      );
      posInset++;
    });

    return rows;
  };

  return (
    <>
      <Table aria-label="Simple table" isTreeTable variant="compact">
        <Thead>
          <Tr>
            <Th>Identifier</Th>
            <Th>Name</Th>
            <Th>Namespace</Th>
          </Tr>
        </Thead>
        <Tbody>{renderRows(apiResponse.results)}</Tbody>
      </Table>
      <Pagination itemCount={apiResponse.total} onChange={onPagination} />
    </>
  );
};
