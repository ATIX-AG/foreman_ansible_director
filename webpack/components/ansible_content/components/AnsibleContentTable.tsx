import React, { Dispatch, SetStateAction } from 'react';
import { Table, Thead, Th, Tbody, Tr } from '@patternfly/react-table';
import Pagination from 'foremanReact/components/Pagination';
import {
  APIOptions,
  PaginationProps,
} from 'foremanReact/common/hooks/API/APIHooks';
import {
  AnsibleContentUnitWithCounts,
  GetAnsibleContentResponse,
} from './AnsibleContentTableWrapper';
import AnsibleContentTablePrimaryRow from './AnsibleContentTablePrimaryRow';
import AnsibleContentTableSecondaryRow from './AnsibleContentTableSecondaryRow';
import { AnsibleVariablesOverview } from './AnsibleVariablesOverview/AnsibleVariablesOverview';
import { ConfirmationModal } from '../../../helpers/components/ConfirmationModal';
import { AnsibleVariable } from '../../../types/AnsibleVariableTypes';
import { VariableManagementModalWrapper } from './AnsibleVariablesOverview/VariableManagementModal/VariableManagementModalWrapper';

interface AnsibleContentTableProps {
  apiResponse: GetAnsibleContentResponse;
  setAPIOptions: Dispatch<SetStateAction<APIOptions>>;
  onPagination: (newPagination: PaginationProps) => void;
  refreshRequest: () => void;
}

export const AnsibleContentTable: React.FC<AnsibleContentTableProps> = ({
  apiResponse,
  setAPIOptions,
  onPagination,
  refreshRequest,
}) => {
  const [expandedNodeNames, setExpandedNodeNames] = React.useState<string[]>(
    []
  );
  const [
    expandedDetailsNodeNames,
    setExpandedDetailsNodeNames,
  ] = React.useState<string[]>([]);

  const [selectedVersionId, setSelectedVersionId] = React.useState<string>('');
  const [selectedIdentifier, setSelectedIdentifier] = React.useState<string>(
    ''
  );
  const [selectedVersion, setSelectedVersion] = React.useState<string>('');

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState<
    boolean
  >(false);
  const [confirmationModalTitle, setConfirmationModalTitle] = React.useState<
    string
  >('');
  const [confirmationModalBody, setConfirmationModalBody] = React.useState<
    string
  >('');
  const [
    confirmationModalOnConfirm,
    setConfirmationModalOnConfirm,
  ] = React.useState<() => void>(() => () => {});

  const [selectedVariable, setSelectedVariable] = React.useState<
    AnsibleVariable | undefined
  >(undefined);

  const renderRows = (
    results: AnsibleContentUnitWithCounts[]
  ): React.ReactNode[] => {
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
          setIsConfirmationModalOpen={setIsConfirmationModalOpen}
          setConfirmationModalTitle={setConfirmationModalTitle}
          setConfirmationModalBody={setConfirmationModalBody}
          setConfirmationModalOnConfirm={setConfirmationModalOnConfirm}
          refreshRequest={refreshRequest}
        />,
        <AnsibleContentTableSecondaryRow
          identifier={identifier}
          nodeVersions={result.versions}
          isExpanded={isExpanded}
          setSelectedVersionId={setSelectedVersionId}
          setSelectedIdentifier={setSelectedIdentifier}
          setSelectedVersion={setSelectedVersion}
          key={`${identifier}:secondary`}
          setIsConfirmationModalOpen={setIsConfirmationModalOpen}
          setConfirmationModalTitle={setConfirmationModalTitle}
          setConfirmationModalBody={setConfirmationModalBody}
          setConfirmationModalOnConfirm={setConfirmationModalOnConfirm}
          refreshRequest={refreshRequest}
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
            <Th>Type</Th>
            <Th>Namespace</Th>
            <Th>Name</Th>
          </Tr>
        </Thead>
        <Tbody>{renderRows(apiResponse.results)}</Tbody>
      </Table>
      <Pagination itemCount={apiResponse.total} onChange={onPagination} />
      {selectedVersionId !== '' && (
        <>
          <AnsibleVariablesOverview
            selectedVersionId={selectedVersionId}
            selectedIdentifier={selectedIdentifier}
            selectedVersion={selectedVersion}
            onClose={() => setSelectedVersionId('')}
            setSelectedVariable={setSelectedVariable}
          />
          {selectedVariable && (
            <VariableManagementModalWrapper
              variable={selectedVariable}
              setSelectedVariable={setSelectedVariable}
            />
          )}
        </>
      )}
      <ConfirmationModal
        isConfirmationModalOpen={isConfirmationModalOpen}
        setIsConfirmationModalOpen={setIsConfirmationModalOpen}
        title={confirmationModalTitle}
        body={confirmationModalBody}
        onConfirm={confirmationModalOnConfirm}
        onAbort={() => setIsConfirmationModalOpen(false)}
      />
    </>
  );
};
