import React from 'react';
import {
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  ExpandableRowContent,
} from '@patternfly/react-table';
import { AnsibleContentVersion } from '../../../types/AnsibleContentTypes';

interface AnsibleContentTableSecondaryRowProps {
  identifier: string; // Needed for keys
  nodeVersions: AnsibleContentVersion[];
  isExpanded: boolean;
}

const AnsibleContentTableSecondaryRow: React.FC<AnsibleContentTableSecondaryRowProps> = ({
  identifier,
  nodeVersions,
  isExpanded,
}) => {
  const versionRows = (versions: AnsibleContentVersion[]): React.ReactNode =>
    versions.map(version => (
      <Tr key={`${identifier}:${version.version}`}>
        <Td dataLabel="Version">{version.version}</Td>
      </Tr>
    ));

  return (
    <Tr isExpanded={isExpanded}>
      <Td colSpan={3}>
        <ExpandableRowContent>
          <Table aria-label="Simple table" variant="compact">
            <Thead>
              <Tr>
                <Th>Version</Th>
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
