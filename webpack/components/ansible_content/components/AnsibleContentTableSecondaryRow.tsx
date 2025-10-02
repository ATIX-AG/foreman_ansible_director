import React, { Dispatch, SetStateAction } from 'react';
import {
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  ExpandableRowContent,
  IAction,
  ActionsColumn,
} from '@patternfly/react-table';
import { Button } from '@patternfly/react-core';
import { AnsibleContentVersionWithCount } from './AnsibleContentTableWrapper';

interface AnsibleContentTableSecondaryRowProps {
  identifier: string; // Needed for keys
  nodeVersions: AnsibleContentVersionWithCount[];
  isExpanded: boolean;
  setSelectedVersionId: Dispatch<SetStateAction<string>>;
  setSelectedIdentifier: Dispatch<SetStateAction<string>>;
  setSelectedVersion: Dispatch<SetStateAction<string>>;
}

const AnsibleContentTableSecondaryRow: React.FC<AnsibleContentTableSecondaryRowProps> = ({
  identifier,
  nodeVersions,
  isExpanded,
  setSelectedVersionId,
  setSelectedIdentifier,
  setSelectedVersion,
}) => {
  const versionRows = (
    versions: AnsibleContentVersionWithCount[]
  ): React.ReactNode =>
    versions.map(version => (
      <Tr key={`${identifier}:${version.version}`}>
        <Td dataLabel="Version">{version.version}</Td>
        <Td dataLabel="Roles">
          <Button
            variant="link"
            isInline
            onClick={() => {
              setSelectedVersionId(version.id);
              setSelectedIdentifier(identifier);
              setSelectedVersion(version.version);
            }}
          >
            {version.roles_count === 1
              ? `${version.roles_count} role`
              : `${version.roles_count} roles`}
          </Button>
        </Td>
        <Td isActionCell>
          <ActionsColumn items={rowActions} />
        </Td>
      </Tr>
    ));

  const rowActions: IAction[] = [{ title: 'Action 1', onClick: () => {} }];

  return (
    <Tr isExpanded={isExpanded}>
      <Td colSpan={3}>
        <ExpandableRowContent>
          <Table aria-label="Simple table" variant="compact">
            <Thead>
              <Tr>
                <Th>Version</Th>
                <Th>Roles</Th>
              </Tr>
            </Thead>
            <Tbody>{versionRows(nodeVersions)}</Tbody>
          </Table>
        </ExpandableRowContent>{' '}
      </Td>
    </Tr>
  );
};

export default AnsibleContentTableSecondaryRow;
