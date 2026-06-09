import React, { Dispatch, SetStateAction } from 'react';
import { Table, Thead, Th, Tbody, Tr } from '@patternfly/react-table';
import Pagination from 'foremanReact/components/Pagination';
import {
  APIOptions,
  PaginationProps,
} from 'foremanReact/common/hooks/API/APIHooks';

import { translate as _ } from 'foremanReact/common/I18n';

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

  const [selectedVersionId, setSelectedVersionId] = React.useState<number>(-1);
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
        />,
        <AnsibleContentTableSecondaryRow
          identifier={identifier}
          nodeId={result.id}
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
            <Th dataLabel="Identifier">{_('Identifier')}</Th>
            <Th dataLabel="Type">{_('Type')}</Th>
            <Th dataLabel="Namespace">{_('Namespace')}</Th>
            <Th dataLabel="Name">{_('Name')}</Th>
          </Tr>
        </Thead>
        <Tbody>{renderRows(apiResponse.results)}</Tbody>
      </Table>
      <Pagination itemCount={apiResponse.total} onChange={onPagination} />
      {selectedVersionId !== -1 && (
        <>
          <AnsibleVariablesOverview
            selectedVersionId={selectedVersionId}
            selectedIdentifier={selectedIdentifier}
            selectedVersion={selectedVersion}
            onClose={() => setSelectedVersionId(-1)}
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
        title={confirmationModalTitle}
        body={confirmationModalBody}
        onConfirm={() => {
          confirmationModalOnConfirm();
          setIsConfirmationModalOpen(false);
        }}
        onAbort={() => setIsConfirmationModalOpen(false)}
      />
    </>
  );
};
