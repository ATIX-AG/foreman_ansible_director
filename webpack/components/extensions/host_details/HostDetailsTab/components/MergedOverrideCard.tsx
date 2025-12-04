import React, { ReactElement, useEffect } from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Icon,
  Label,
  Modal,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import { useDispatch } from 'react-redux';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';

import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { StringAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/StringAdapter';
import { BooleanAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/BooleanAdapter';
import { IntegerAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/IntegerAdapter';
import { RealAdapter } from '../../../../ansible_content/components/AnsibleVariablesOverview/VariableManagementModal/ValueAdapters/RealAdapter';

import { YamlEditor } from '../../../../common/YamlEditor';
import { AdPermissions } from '../../../../../constants/foremanAnsibleDirectorPermissions';

interface MergedOverrideCardProps {
  mergedOverride: MergedVariableOverride;
  fqdn: string;
}

export const MergedOverrideCard = ({
  mergedOverride,
  fqdn,
}: MergedOverrideCardProps): ReactElement => {
  const [override, setOverride] = React.useState<
    MergedVariableOverride | undefined
  >();
  const [overrideValue, setOverrideValue] = React.useState<
    string | number | boolean | undefined
  >();
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const [isCardLoading, setIsCardLoading] = React.useState<boolean>(false);

  useEffect(() => {
    setOverride(mergedOverride);
    let v = mergedOverride.override_value || mergedOverride.default_value;
    if (mergedOverride.type === 'yaml') {
      v = JSON.stringify(v);
    }
    setOverrideValue(v);
  }, [mergedOverride]);

  const userCanEditOverrides: boolean = usePermissions([
    AdPermissions.ansibleVariableOverrides.edit,
  ]);

  const dispatch = useDispatch();

  const valueAdapter = (): ReactElement | null => {
    if (override !== undefined) {
      switch (override.type) {
        case 'string':
          return (
            <StringAdapter
              isEditMode={isEditMode}
              value={overrideValue as string}
              onChange={value => setOverrideValue(value)}
            />
          );
        case 'boolean':
          return (
            <BooleanAdapter
              isEditMode={isEditMode}
              value={overrideValue as boolean}
              onChange={value => setOverrideValue(value)}
            />
          );
        case 'integer':
          return (
            <IntegerAdapter
              isEditMode={isEditMode}
              value={overrideValue as number}
              onChange={value => setOverrideValue(value)}
            />
          );
        case 'real':
          return (
            <RealAdapter
              isEditMode={isEditMode}
              value={overrideValue as number}
              onChange={value => setOverrideValue(value)}
            />
          );
        default:
          return null;
      }
    }
    return null;
  };

  const onAction = async (): Promise<void> => {
    if (isEditMode) {
      if (mergedOverride.override_id !== null) {
        // The override actually exists

        try {
          setIsCardLoading(true);
          // @ts-ignore TS18047 If override_id is not null, neither is this
          const splitMatcher = mergedOverride.override_matcher.split('=');
          await axios.put(
            `${foremanUrl('/api/v2/ansible_director/ansible_variables/')}/${
              mergedOverride.variable_id
            }/overrides/${mergedOverride.override_id}`,
            {
              override: {
                value: overrideValue,
                matcher: splitMatcher[0],
                matcher_value: splitMatcher[1],
              },
            }
          );
          dispatch(
            addToast({
              type: 'success',
              key: `EDIT_OVERRIDE_${mergedOverride.override_id}_SUCC`,
              message: `Successfully edited override for "${mergedOverride.key}"!`,
              sticky: false,
            })
          );
        } catch (e) {
          dispatch(
            addToast({
              type: 'danger',
              key: `UPDATE_OVERRIDE_${mergedOverride.override_id}_ERR`,
              message: `Updating of Ansible variable override for "${
                mergedOverride.key
              }" failed with error code "${
                (e as { response: AxiosResponse }).response.status
              }".`,
              sticky: false,
            })
          );
        } finally {
          setIsCardLoading(false);
        }
      } else {
        try {
          setIsCardLoading(true);
          await axios.post(
            foremanUrl(
              `/api/v2/ansible_director/ansible_variables/${mergedOverride.variable_id}/overrides/`
            ),
            {
              override: {
                value: overrideValue,
                matcher: 'fqdn',
                matcher_value: fqdn,
              },
            }
          );
          dispatch(
            addToast({
              type: 'success',
              key: `CREATE_OVERRIDE_FOR_${mergedOverride.variable_id}_SUCC`,
              message: `Successfully created override for "${mergedOverride.key}"!`,
              sticky: false,
            })
          );
        } catch (e) {
          dispatch(
            addToast({
              type: 'danger',
              key: `CREATE_OVERRIDE_${mergedOverride.variable_id}_ERR`,
              message: `Creation of Ansible variable override for variable"${
                mergedOverride.key
              }" failed with error code "${
                (e as { response: AxiosResponse }).response.status
              }".`,
              sticky: false,
            })
          );
        } finally {
          setIsCardLoading(false);
        }
      }
    }
    setIsEditMode(!isEditMode);
  };

  const editAction = (): ReactElement => (
    <Button
      variant="plain"
      aria-label="Action"
      onClick={() => onAction()}
      isInline
    >
      {isEditMode ? (
        <Icon size="md">
          <SaveIcon />
        </Icon>
      ) : (
        <Icon size="md">
          <EditIcon />
        </Icon>
      )}
    </Button>
  );

  return (
    <>
      {override !== undefined && (
        <Card isCompact style={{ minHeight: '130px' }}>
          {!isCardLoading ? (
            <>
              <CardHeader
                actions={{
                  actions: [...(userCanEditOverrides ? [editAction()] : [])],
                }}
              >
                <Label color="blue" isCompact>
                  {mergedOverride.type}
                </Label>
              </CardHeader>
              <CardTitle>{mergedOverride.key}</CardTitle>
              {mergedOverride.type !== 'yaml' && (
                <CardBody>
                  <Bullseye>{valueAdapter()}</Bullseye>
                </CardBody>
              )}
            </>
          ) : (
            <>
              <CardBody>
                <Bullseye>
                  <EmptyState style={{ padding: '0px' }}>
                    <EmptyStateHeader
                      headingLevel="h4"
                      icon={<EmptyStateIcon icon={Spinner} />}
                    />
                  </EmptyState>
                </Bullseye>
              </CardBody>
            </>
          )}
        </Card>
      )}
      {mergedOverride.type === 'yaml' && isEditMode && (
        <Modal
          title="Edit override"
          style={{ minHeight: '400px' }}
          isOpen
          onClose={() => setIsEditMode(false)}
          actions={[
            <Button key="confirm" variant="primary" onClick={() => onAction()}>
              Confirm
            </Button>,
          ]}
          ouiaId="BasicModal"
          variant={ModalVariant.large}
        >
          <YamlEditor
            yamlFile={overrideValue as string}
            setYamlFile={setOverrideValue}
          />
        </Modal>
      )}
    </>
  );
};
