import React, { Dispatch } from 'react';
import { ActionsColumn, IAction, Td, Tr } from '@patternfly/react-table';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';

import { useDispatch } from 'react-redux';
import { AnsibleContentUnit } from '../../../types/AnsibleContentTypes';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';
import { DefaultResponse, Task } from '../../../types/common';

interface AnsibleContentTablePrimaryRowProps {
  node: AnsibleContentUnit;
  setExpandedNodeNames: Dispatch<React.SetStateAction<string[]>>;
  isExpanded: boolean;
  isDetailsExpanded: boolean;
  setExpandedDetailsNodeNames: Dispatch<React.SetStateAction<string[]>>;
  posInset: number;
  identifier: string;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
}

const AnsibleContentTablePrimaryRow: React.FC<AnsibleContentTablePrimaryRowProps> = ({
  node,
  setExpandedNodeNames,
  isExpanded,
  isDetailsExpanded,
  setExpandedDetailsNodeNames,
  posInset,
  identifier,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
}) => {
  const treeRow = {
    onCollapse: () =>
      setExpandedNodeNames(prevExpanded => {
        const otherExpandedNodeNames = prevExpanded.filter(
          name => name !== node.name
        );
        return isExpanded
          ? otherExpandedNodeNames
          : [...otherExpandedNodeNames, node.name];
      }),
    onToggleRowDetails: () =>
      setExpandedDetailsNodeNames(prevDetailsExpanded => {
        const otherDetailsExpandedNodeNames = prevDetailsExpanded.filter(
          name => name !== node.name
        );
        return isDetailsExpanded
          ? otherDetailsExpandedNodeNames
          : [...otherDetailsExpandedNodeNames, node.name];
      }),
    props: {
      isExpanded,
      isDetailsExpanded,
      'aria-level': 1,
      'aria-posinset': posInset,
      'aria-setsize': node.versions ? node.versions.length : 0,
    },
  };

  const dispatch = useDispatch();

  const userCanDestroyContent: boolean = usePermissions([
    AdPermissions.ansibleContent.destroy,
  ]);

  const destroyAction = (): IAction => ({
    title: _('Delete'),
    onClick: () => {
      setIsConfirmationModalOpen(true);
      setConfirmationModalTitle(__(_('Delete %(id)s?'), { id: identifier }));
      setConfirmationModalBody(
        __(_('Are you sure you want to delete %(id)s?'), {
          id: identifier,
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
                    unit_id: node.id,
                  },
                ],
              },
            }
          );
          dispatch(
            addToast({
              type: 'success',
              key: `DESTROY_CU_${node.id}_SUCC`,
              message: (
                <span>
                  {__(
                    _(
                      'A task to delete Ansible content unit "%(identifier)s" was started successfully!'
                    ),
                    {
                      identifier,
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
              key: `DESTROY_CU_${node.id}_ERR`,
              message: __(
                _(
                  'Starting of task to delete Ansible content unit "%(identifier)s" failed with error code "%(error)s".'
                ),
                {
                  identifier,
                  error: (e as { response: AxiosResponse }).response.status,
                }
              ),
              sticky: false,
            })
          );
        }
      });
    },
  });

  const rowActions: IAction[] = [
    ...(userCanDestroyContent ? [destroyAction()] : []),
  ];

  return (
    <Tr>
      <Td dataLabel="Identifier" treeRow={treeRow}>
        {identifier}
      </Td>
      <Td dataLabel="Type">{node.type}</Td>
      <Td dataLabel="Namespace">{node.namespace}</Td>
      <Td dataLabel="Name">{node.name}</Td>
      <Td isActionCell>
        <ActionsColumn items={rowActions} />
      </Td>
    </Tr>
  );
};

export default AnsibleContentTablePrimaryRow;
