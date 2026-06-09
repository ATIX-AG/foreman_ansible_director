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
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { useDispatch } from 'react-redux';
import { AnsibleContentVersionWithCount } from './AnsibleContentTableWrapper';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';
import { DefaultResponse, Task } from '../../../types/common';

interface AnsibleContentTableSecondaryRowProps {
  identifier: string; // Needed for keys
  nodeId: number;
  nodeVersions: AnsibleContentVersionWithCount[];
  isExpanded: boolean;
  setSelectedVersionId: Dispatch<SetStateAction<number>>;
  setSelectedIdentifier: Dispatch<SetStateAction<string>>;
  setSelectedVersion: Dispatch<SetStateAction<string>>;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
}

const AnsibleContentTableSecondaryRow: React.FC<AnsibleContentTableSecondaryRowProps> = ({
  identifier,
  nodeId,
  nodeVersions,
  isExpanded,
  setSelectedVersionId,
  setSelectedIdentifier,
  setSelectedVersion,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
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
              ? _('1 role')
              : __(_('%(count)s roles'), { count: version.roles_count })}
          </Button>
        </Td>
        <Td isActionCell>
          <ActionsColumn items={rowActions(version)} />
        </Td>
      </Tr>
    ));

  const dispatch = useDispatch();

  const userCanDestroyContent: boolean = usePermissions([
    AdPermissions.ansibleContent.destroy,
  ]);

  const destroyAction = (version: AnsibleContentVersionWithCount): IAction => ({
    title: _('Delete'),
    onClick: () => {
      setIsConfirmationModalOpen(true);
      setConfirmationModalTitle(
        __(_('Delete %(id)s?'), { id: `${identifier}:${version.version}` })
      );
      setConfirmationModalBody(
        __(_('Are you sure you want to delete %(id)s?'), {
          id: `${identifier}:${version.version}`,
        })
      );
      setConfirmationModalOnConfirm(() => async () => {
        try {
          const triggeredTask: AxiosResponse<DefaultResponse<
            never,
            never,
            { task: Task }
          >> = await axios.delete(
            foremanUrl('/api/v2/ansible_director/ansible_content'),
            {
              data: {
                units: [
                  {
                    unit_id: nodeId,
                    unit_version_ids: [version.id],
                  },
                ],
              },
            }
          );
          dispatch(
            addToast({
              type: 'success',
              key: `DESTROY_CUV_${identifier}_${version.version}_SUCC`,
              message: (
                <span>
                  {__(
                    _(
                      'A task to delete Ansible content unit version "%(identifier)s" was started successfully!'
                    ),
                    {
                      identifier: `${identifier}:${version.version}`,
                    }
                  )}
                  <br />
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={foremanUrl(
                      `/foreman_tasks/tasks/${triggeredTask.data.results.task.id}`
                    )}
                  >
                    {_('View the task page for more details.')}
                  </a>
                </span>
              ),
              sticky: false,
            })
          );
        } catch (e) {
          dispatch(
            addToast({
              type: 'danger',
              key: `DESTROY_CUV_${identifier}_${version.version}_ERR`,
              message: __(
                _(
                  'Starting of task to delete Ansible content unit version "%(identifier)s" failed with error code "%(error)s".'
                ),
                {
                  identifier: `${identifier}:${version.version}`,
                  error: (e as { response: AxiosResponse }).response.status,
                }
              ),
              sticky: false,
            })
          );
        } finally {
          setIsConfirmationModalOpen(false);
        }
      });
    },
  });

  const rowActions = (version: AnsibleContentVersionWithCount): IAction[] => [
    ...(userCanDestroyContent ? [destroyAction(version)] : []),
  ];

  return (
    <Tr isExpanded={isExpanded}>
      <Td colSpan={3}>
        <ExpandableRowContent>
          <Table aria-label="Simple table" variant="compact">
            <Thead>
              <Tr>
                <Th dataLabel="Version">{_('Version')}</Th>
                <Th dataLabel="Roles">{_('Roles')}</Th>
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
