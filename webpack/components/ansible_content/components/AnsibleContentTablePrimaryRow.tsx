import React, { Dispatch } from 'react';
import { ActionsColumn, IAction, Td, Tr } from '@patternfly/react-table';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { useDispatch } from 'react-redux';
import { AnsibleContentUnit } from '../../../types/AnsibleContentTypes';

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
  refreshRequest: () => void;
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
  refreshRequest,
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

  const organization = useForemanOrganization();
  const dispatch = useDispatch();

  const rowActions: IAction[] = [
    {
      title: 'Destroy',
      onClick: () => {
        setIsConfirmationModalOpen(true);
        setConfirmationModalTitle(`Destroy ${identifier}?`);
        setConfirmationModalBody(
          `This will destroy all imported versions of ${identifier}.\nAre you sure you want to destroy ${identifier}?`
        );
        setConfirmationModalOnConfirm(() => async () => {
          try {
            await axios.delete(
              foremanUrl('/api/v2/ansible_director/ansible_content'),
              {
                data: {
                  organization_id: organization?.id,
                  units: [
                    {
                      unit_name: identifier,
                    },
                  ],
                },
              }
            );
            dispatch(
              addToast({
                type: 'success',
                key: `DESTROY_CU_${node.id}_SUCC`,
                message: `Sucessfully destroyed Ansible content unit "${identifier}"!`,
                sticky: false,
              })
            );
          } catch (e) {
            dispatch(
              addToast({
                type: 'danger',
                key: `DESTROY_CU_${node.id}_ERR`,
                message: `Destroying Ansible content unit "${identifier}" failed with error code "${
                  (e as { response: AxiosResponse }).response.status
                }".`,
                sticky: false,
              })
            );
          } finally {
            refreshRequest();
          }
        });
      },
    },
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
