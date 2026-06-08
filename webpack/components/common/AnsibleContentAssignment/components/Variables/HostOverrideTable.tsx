import React, { ReactElement, useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import { foremanUrl } from 'foremanReact/common/helpers';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { addToast } from 'foremanReact/components/ToastsList';

import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { AdPermissions } from '../../../../../constants/foremanAnsibleDirectorPermissions';
import { ContentResolutionNodeType } from '../../../../../types/AnsibleContentAssignmentTypes';
import { PermittedButton } from '../../../../common/PermittedButton';
import {
  castValueForApi,
  deleteTargetOverride,
  EmptyOverridesState,
  errorStatusMessage,
  ErrorState,
  formatSourceAttribute,
  formatValueForDisplay,
  isDraftValueValid,
  LoadingState,
  normalizeValueForEdit,
  ValueEditor,
} from './HostOverrideTableHelpers';
import { crnTypeUrlMap } from '../../helpers';

export const HostOverrideTable = ({
  crnType,
  crnId,
  matcherType,
  matcherName,
}: {
  crnType: ContentResolutionNodeType;
  crnId: number;
  matcherType: string;
  matcherName: string;
}): ReactElement => {
  const dispatch = useDispatch();
  const currentMatcher = `${matcherType}=${matcherName}`;
  const [overrides, setOverrides] = useState<MergedVariableOverride[]>([]);
  const [status, setStatus] = useState<'PENDING' | 'RESOLVED' | 'ERROR'>(
    'PENDING'
  );
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string | boolean>('');
  const [workingRowId, setWorkingRowId] = useState<string | null>(null);
  const rowIdFor = (override: MergedVariableOverride): string =>
    override.override_id ??
    [override.variable_id, override.override_matcher ?? 'none'].join(':');

  const loadOverrides = async (): Promise<void> => {
    try {
      setStatus('PENDING');
      const response = await axios.get<MergedVariableOverride[]>(
        foremanUrl(
          `/api/v2/ansible_director/ansible_variables/overrides/${crnTypeUrlMap[crnType]}/${crnId}?include_overridable=1`
        )
      );
      setOverrides(response.data);
      setStatus('RESOLVED');
    } catch (_error) {
      setStatus('ERROR');
      dispatch(
        addToast({
          type: 'danger',
          key: `GET_${crnTypeUrlMap[crnType]}_${crnId}_ANSIBLE_VAR_OVERRIDES`,
          message: _('Requesting Ansible variable overrides failed.'),
          sticky: false,
        })
      );
    }
  };

  useEffect(() => {
    loadOverrides();
  }, [crnId, crnType]); // eslint-disable-line react-hooks/exhaustive-deps
  const onSave = async (override: MergedVariableOverride): Promise<void> => {
    const payload = {
      override: {
        value: castValueForApi(override, draftValue),
        matcher: matcherType,
        matcher_value: matcherName,
      },
    };

    try {
      setWorkingRowId(rowIdFor(override));
      if (
        override.override_id &&
        override.override_matcher === currentMatcher
      ) {
        await axios.put(
          foremanUrl(
            `/api/v2/ansible_director/ansible_variables/${override.variable_id}/overrides/${override.override_id}`
          ),
          payload
        );
      } else {
        await axios.post(
          foremanUrl(
            `/api/v2/ansible_director/ansible_variables/${override.variable_id}/overrides/`
          ),
          payload
        );
      }

      dispatch(
        addToast({
          type: 'success',
          key: `UPSERT_${crnTypeUrlMap[crnType]}_${crnId}_ANSIBLE_VAR_OVERRIDE_${override.variable_id}`,
          message: __(_('Successfully updated override for "%(key)s".'), {
            key: override.key,
          }),
          sticky: false,
        })
      );

      setEditingRowId(null);
      await loadOverrides();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPSERT_${crnTypeUrlMap[crnType]}_${crnId}_ANSIBLE_VAR_OVERRIDE_${override.variable_id}_ERR`,
          message: __(
            _(
              'Updating Ansible variable override for "%(key)s" failed with error code "%(error)s".'
            ),
            {
              key: override.key,
              error: errorStatusMessage(e),
            }
          ),
          sticky: false,
        })
      );
    } finally {
      setWorkingRowId(null);
    }
  };
  if (status === 'PENDING') {
    return <LoadingState />;
  }

  if (status === 'ERROR') {
    return <ErrorState />;
  }

  if (overrides.length === 0) {
    return <EmptyOverridesState crnType={crnType} />;
  }
  return (
    <Table
      ouiaId={`${crnTypeUrlMap[crnType]}-ansible-variable-overrides-table`}
      variant="compact"
    >
      <Thead>
        <Tr>
          <Th>{_('Name')}</Th>
          <Th>{_('Type')}</Th>
          <Th>{_('Value')}</Th>
          <Th>{_('Source attribute')}</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {overrides.map(override => {
          const rowId = rowIdFor(override);
          const isEditing = editingRowId === rowId;
          const isWorking = workingRowId === rowId;
          const isCurrentTargetOverride =
            override.override_id !== null &&
            override.override_matcher === currentMatcher;
          const editPermissions = isCurrentTargetOverride
            ? [AdPermissions.ansibleVariableOverrides.edit]
            : [AdPermissions.ansibleVariableOverrides.create];

          return (
            <Tr key={rowId}>
              <Td>{override.key}</Td>
              <Td>{override.type}</Td>
              <Td width={40}>
                {isEditing ? (
                  <ValueEditor
                    override={override}
                    value={draftValue}
                    onChange={setDraftValue}
                    isDisabled={isWorking}
                  />
                ) : (
                  formatValueForDisplay(override)
                )}
              </Td>
              <Td>{formatSourceAttribute(override)}</Td>
              <Td>
                <Flex spaceItems={{ default: 'spaceItemsNone' }}>
                  {isEditing ? (
                    <>
                      <FlexItem>
                        <PermittedButton
                          requiredPermissions={editPermissions}
                          variant="plain"
                          onClick={() => {
                            setEditingRowId(null);
                            setDraftValue('');
                          }}
                          isDisabled={isWorking}
                        >
                          <TimesIcon />
                        </PermittedButton>
                      </FlexItem>
                      <FlexItem>
                        <PermittedButton
                          requiredPermissions={editPermissions}
                          variant="plain"
                          onClick={() => {
                            onSave(override);
                          }}
                          isDisabled={
                            isWorking ||
                            !isDraftValueValid(override, draftValue)
                          }
                        >
                          <CheckIcon />
                        </PermittedButton>
                      </FlexItem>
                    </>
                  ) : (
                    <FlexItem>
                      <PermittedButton
                        requiredPermissions={editPermissions}
                        variant="plain"
                        onClick={() => {
                          setEditingRowId(rowId);
                          setDraftValue(normalizeValueForEdit(override));
                        }}
                        isDisabled={isWorking}
                      >
                        <PencilAltIcon />
                      </PermittedButton>
                    </FlexItem>
                  )}
                  {isCurrentTargetOverride && !isEditing && (
                    <FlexItem>
                      <PermittedButton
                        requiredPermissions={[
                          AdPermissions.ansibleVariableOverrides.destroy,
                        ]}
                        variant="plain"
                        onClick={() => {
                          deleteTargetOverride({
                            override,
                            crnId,
                            crnType,
                            dispatch,
                            onStart: () => setWorkingRowId(rowId),
                            onFinish: () => setWorkingRowId(null),
                            onReload: loadOverrides,
                          });
                        }}
                        isDisabled={isWorking}
                      >
                        <TrashIcon />
                      </PermittedButton>
                    </FlexItem>
                  )}
                  {isWorking && (
                    <FlexItem>
                      <Spinner size="md" />
                    </FlexItem>
                  )}
                </Flex>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
