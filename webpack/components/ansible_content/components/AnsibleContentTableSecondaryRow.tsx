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
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { useDispatch } from 'react-redux';
import { AnsibleContentVersionWithCount } from './AnsibleContentTableWrapper';

interface AnsibleContentTableSecondaryRowProps {
  identifier: string; // Needed for keys
  nodeVersions: AnsibleContentVersionWithCount[];
  isExpanded: boolean;
  setSelectedVersionId: Dispatch<SetStateAction<string>>;
  setSelectedIdentifier: Dispatch<SetStateAction<string>>;
  setSelectedVersion: Dispatch<SetStateAction<string>>;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
  refreshRequest: () => void;
}

const AnsibleContentTableSecondaryRow: React.FC<AnsibleContentTableSecondaryRowProps> = ({
  identifier,
  nodeVersions,
  isExpanded,
  setSelectedVersionId,
  setSelectedIdentifier,
  setSelectedVersion,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
  refreshRequest,
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
          <ActionsColumn items={rowActions(version)} />
        </Td>
      </Tr>
    ));

  const organization = useForemanOrganization();
  const dispatch = useDispatch();

  const rowActions = (version: AnsibleContentVersionWithCount): IAction[] => [
    {
      title: 'Destroy',
      onClick: () => {
        setIsConfirmationModalOpen(true);
        setConfirmationModalTitle(`Destroy ${identifier}:${version.version}?`);
        setConfirmationModalBody(
          `This will destroy only version ${version.version} of ${identifier}.\nAre you sure you want to destroy ${identifier}:${version.version}?`
        );
        setConfirmationModalOnConfirm(async () => {
          try {
            await axios.delete(
              foremanUrl('/api/v2/ansible_director/ansible_content'),
              {
                data: {
                  organization_id: organization?.id,
                  units: [
                    {
                      unit_name: identifier,
                      unit_versions: [version.version],
                    },
                  ],
                },
              }
            );
            dispatch(
              addToast({
                type: 'success',
                key: `DESTROY_CUV_${identifier}_${version.version}_SUCC`,
                message: `Sucessfully destroyed Ansible content unit version "${identifier}:${version.version}"!`,
                sticky: false,
              })
            );
          } catch (e) {
            dispatch(
              addToast({
                type: 'danger',
                key: `DESTROY_CUV_${identifier}_${version.version}_ERR`,
                message: `Destroying Ansible content unit version "${identifier}:${
                  version.version
                }" failed with error code "${
                  (e as { response: AxiosResponse }).response.status
                }".`,
                sticky: false,
              })
            );
          } finally {
            setIsConfirmationModalOpen(false);
            refreshRequest();
          }
        });
      },
    },
  ];

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
