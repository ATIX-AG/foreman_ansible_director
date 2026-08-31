import React, { Dispatch, SetStateAction } from 'react';
import { Table, Thead, Th, Tbody, Tr } from '@patternfly/react-table';
import Pagination from 'foremanReact/components/Pagination';
import {
  APIOptions,
  PaginationProps,
} from 'foremanReact/common/hooks/API/APIHooks';

import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';

import { Modal } from '@patternfly/react-core';
import {
  AnsibleContentUnitWithCounts, AnsibleContentVersionWithCount,
  GetAnsibleContentResponse,
} from './AnsibleContentTableWrapper';
import AnsibleContentTablePrimaryRow from './AnsibleContentTablePrimaryRow';
import AnsibleContentTableSecondaryRow from './AnsibleContentTableSecondaryRow';
import { ConfirmationModal } from '../../../helpers/components/ConfirmationModal';
import { CollectionOverviewWrapper } from './Variables/CollectionOverviewWrapper';

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

  // TODO: Yikes... Refactor when nothing better to do

  const [expandedNodeNames, setExpandedNodeNames] = React.useState<string[]>(
    []
  );
  const [
    expandedDetailsNodeNames,
    setExpandedDetailsNodeNames,
  ] = React.useState<string[]>([]);

  const [selectedNode, setSelectedNode] = React.useState<
    { node: AnsibleContentUnitWithCounts; version: AnsibleContentVersionWithCount } | null
  >(null);

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
          node={result}
          isExpanded={isExpanded}
          key={`${identifier}:secondary`}
          onVersionClick={node => setSelectedNode(node)}
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
      {selectedNode !== null && (
        <>
          <Modal
            width="80%"
            title={__(_('Collection overview: %(id)s'), {
              id: `${selectedNode.node.identifier}:${selectedNode.version.version}`,
            })}
            isOpen
            onClose={() => setSelectedNode(null)}
          >
            <CollectionOverviewWrapper node={selectedNode} />
          </Modal>
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
