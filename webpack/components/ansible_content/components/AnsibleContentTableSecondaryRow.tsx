import React, { Dispatch } from 'react';
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
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { AnsibleContentUnitWithCounts, AnsibleContentVersionWithCount } from './AnsibleContentTableWrapper';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';
import { AnsibleContent } from '../../../resources/clients/AnsibleContent';
import { useToasts } from '../../../helpers/toasts/useToasts';

interface AnsibleContentTableSecondaryRowProps {
  node: AnsibleContentUnitWithCounts;
  isExpanded: boolean;
  onVersionClick: (node: { node: AnsibleContentUnitWithCounts; version: AnsibleContentVersionWithCount }) => void;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
}

const AnsibleContentTableSecondaryRow: React.FC<AnsibleContentTableSecondaryRowProps> = ({
  node,
  isExpanded,
  onVersionClick,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
}) => {

  const { withToast } = useToasts();

  const versionRows = (
    versions: AnsibleContentVersionWithCount[]
  ): React.ReactNode =>
    versions.map(version => (
      <Tr key={`${node.identifier}:${version.version}`}>
        <Td dataLabel="Version">{version.version}</Td>
        <Td dataLabel="Roles">
          <Button
            variant="link"
            isInline
            onClick={() => {
              onVersionClick({ node, version });
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

  const userCanDestroyContent: boolean = usePermissions([
    AdPermissions.ansibleContent.destroy,
  ]);

  const destroyAction = (version: AnsibleContentVersionWithCount): IAction => ({
    title: _('Delete'),
    onClick: () => {
      setIsConfirmationModalOpen(true);
      setConfirmationModalTitle(
        __(_('Delete %(id)s?'), { id: `${node.identifier}:${version.version}` })
      );
      setConfirmationModalBody(
        __(_('Are you sure you want to delete %(id)s?'), {
          id: `${node.identifier}:${version.version}`,
        })
      );
      setConfirmationModalOnConfirm(() => async () => {
        await withToast({
          type: 'task',
          func: AnsibleContent.destroy({
            units: [
              {
                unit_id: node.id,
                unit_version_ids: [version.id],
              },
            ],
          }),
        });
        setIsConfirmationModalOpen(false);
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
            <Tbody>{versionRows(node.versions)}</Tbody>
          </Table>
        </ExpandableRowContent>
      </Td>
    </Tr>
  );
};

export default AnsibleContentTableSecondaryRow;
