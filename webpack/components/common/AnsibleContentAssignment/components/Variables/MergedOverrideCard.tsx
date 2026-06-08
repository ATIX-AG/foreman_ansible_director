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
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { YamlEditor } from '../../../../common/YamlEditor';
import { AdPermissions } from '../../../../../constants/foremanAnsibleDirectorPermissions';
import { PermittedButton } from '../../../../common/PermittedButton';
import { crnTypeUiString } from '../../helpers';
import { ContentResolutionNodeType } from '../../../../../types/AnsibleContentAssignmentTypes';
import { MergedOverrideValueAdapter } from './MergedOverrideValueAdapter';

interface MergedOverrideCardProps {
  mergedOverride: MergedVariableOverride;
  matcherName: string;
  matcherType: string;
  crnType: ContentResolutionNodeType;
  onUpdated: () => void;
}

export const MergedOverrideCard = ({
  mergedOverride,
  matcherName,
  matcherType,
  crnType,
  onUpdated,
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
    let v = mergedOverride.override_value ?? mergedOverride.default_value;
    if (mergedOverride.type === 'yaml') {
      v = JSON.stringify(v);
    }
    setOverrideValue(v);
  }, [mergedOverride]);

  const dispatch = useDispatch();

  const onAction = async (): Promise<void> => {
    if (isEditMode && override !== undefined) {
      const updatedMatcher = `${matcherType}=${matcherName}`;

      if (override.override_id !== null) {
        // The override actually exists

        try {
          setIsCardLoading(true);
          // @ts-ignore TS18047 If override_id is not null, neither is this
          const splitMatcher = override.override_matcher.split('=');
          await axios.put(
            `${foremanUrl('/api/v2/ansible_director/ansible_variables/')}/${
              override.variable_id
            }/overrides/${override.override_id}`,
            {
              override: {
                value: overrideValue,
                matcher: splitMatcher[0],
                matcher_value: splitMatcher[1],
              },
            }
          );
          setOverride({
            ...override,
            override_value: overrideValue ?? null,
          });
          onUpdated();
          dispatch(
            addToast({
              type: 'success',
              key: `EDIT_OVERRIDE_${override.override_id}_SUCC`,
              message: __(_('Successfully edited override for "%(key)s"!'), {
                key: override.key,
              }),
              sticky: false,
            })
          );
        } catch (e) {
          dispatch(
            addToast({
              type: 'danger',
              key: `UPDATE_OVERRIDE_${override.override_id}_ERR`,
              message: __(
                _(
                  'Updating of Ansible variable override for "%(key)s" failed with error code "%(error)s".'
                ),
                {
                  key: override.key,
                  error: (e as { response: AxiosResponse }).response.status,
                }
              ),
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
              `/api/v2/ansible_director/ansible_variables/${override.variable_id}/overrides/`
            ),
            {
              override: {
                value: overrideValue,
                matcher: matcherType,
                matcher_value: matcherName,
              },
            }
          );
          setOverride({
            ...override,
            override_matcher: updatedMatcher,
            override_value: overrideValue ?? null,
          });
          onUpdated();
          dispatch(
            addToast({
              type: 'success',
              key: `CREATE_OVERRIDE_FOR_${override.variable_id}_SUCC`,
              message: `Successfully created override for "${override.key}"!`,
              sticky: false,
            })
          );
        } catch (e) {
          dispatch(
            addToast({
              type: 'danger',
              key: `CREATE_OVERRIDE_${override.variable_id}_ERR`,
              message: `Creation of Ansible variable override for variable"${
                override.key
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

  const editAction = (overrideObject: MergedVariableOverride): ReactElement => (
    <PermittedButton
      requiredPermissions={[AdPermissions.ansibleVariableOverrides.edit]}
      hasPopover
      popoverProps={{
        triggerAction: 'hover',
        'aria-label': 'destroy popover',
        headerComponent: 'h1',
        headerContent: _('Edit variable override'),
        bodyContent: (
          <div>
            {__(
              _('Edit the value of variable %(key)s for this %(targetType)s'),
              {
                key: overrideObject.key,
                targetType: crnTypeUiString[crnType],
              }
            )}
          </div>
        ),
      }}
      variant="plain"
      aria-label="Action"
      onClick={() => onAction()}
      isInline
      key={`${overrideObject.variable_id}-${overrideObject.override_id}`}
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
    </PermittedButton>
  );

  return (
    <>
      {override !== undefined && (
        <Card isCompact style={{ minHeight: '130px' }}>
          {!isCardLoading ? (
            <>
              <CardHeader
                actions={{
                  actions: [...[editAction(override)]],
                }}
              >
                <Label color="blue" isCompact>
                  {override.type}
                </Label>
              </CardHeader>
              <CardTitle>{override.key}</CardTitle>
              {override.type !== 'yaml' && (
                <CardBody>
                  <Bullseye>
                    <MergedOverrideValueAdapter
                      override={override}
                      isEditMode={isEditMode}
                      overrideValue={overrideValue}
                      setOverrideValue={setOverrideValue}
                    />
                  </Bullseye>
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
      {override?.type === 'yaml' && isEditMode && (
        <Modal
          title={_('Edit override')}
          style={{ minHeight: '400px' }}
          isOpen
          onClose={() => setIsEditMode(false)}
          actions={[
            <Button key="confirm" variant="primary" onClick={() => onAction()}>
              {_('Confirm')}
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
