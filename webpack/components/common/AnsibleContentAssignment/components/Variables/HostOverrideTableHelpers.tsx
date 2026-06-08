import React, { ReactElement } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  FormSelect,
  FormSelectOption,
  Spinner,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';

import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { ContentResolutionNodeType } from '../../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUiString, crnTypeUrlMap } from '../../helpers';

export const normalizeBooleanValue = (
  value: string | boolean | number | null | undefined
): boolean => value === true || value === 'true';

export const formatValueForDisplay = (
  override: MergedVariableOverride
): string | ReactElement => {
  const value = override.override_value ?? override.default_value;

  if (override.type === 'boolean') {
    return normalizeBooleanValue(value) ? <CheckIcon /> : <TimesIcon />;
  }

  if (override.type === 'yaml') {
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }

  return String(value);
};

export const formatSourceAttribute = (
  override: MergedVariableOverride
): string => {
  if (!override.override_matcher) {
    return _('Default value');
  }

  const [matcherType, matcherValue] = override.override_matcher.split('=');

  if (matcherType === 'fqdn') {
    return __('Host: %(matcherValue)s', { matcherValue });
  }

  if (matcherType === 'hostgroup') {
    return __('Hostgroup: %(matcherValue)s', { matcherValue });
  }

  return override.override_matcher;
};

export const normalizeValueForEdit = (
  override: MergedVariableOverride
): string | boolean => {
  const value = override.override_value ?? override.default_value;

  if (override.type === 'boolean') {
    return normalizeBooleanValue(value);
  }

  if (override.type === 'yaml') {
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }

  return String(value ?? '');
};

export const castValueForApi = (
  override: MergedVariableOverride,
  value: string | boolean
): string | boolean | number => {
  switch (override.type) {
    case 'boolean':
      return Boolean(value);
    case 'integer':
      return parseInt(String(value), 10);
    case 'real':
      return parseFloat(String(value));
    default:
      return String(value);
  }
};

export const isDraftValueValid = (
  override: MergedVariableOverride,
  value: string | boolean
): boolean => {
  if (override.type === 'integer') {
    return (
      String(value).trim() !== '' && !Number.isNaN(parseInt(String(value), 10))
    );
  }

  if (override.type === 'real') {
    return (
      String(value).trim() !== '' && !Number.isNaN(parseFloat(String(value)))
    );
  }

  return true;
};

export const errorStatusMessage = (error: unknown): string =>
  String(
    (error as { response?: AxiosResponse }).response?.status ?? _('unknown')
  );

export const ValueEditor = ({
  override,
  value,
  isDisabled,
  onChange,
}: {
  override: MergedVariableOverride;
  value: string | boolean;
  isDisabled: boolean;
  onChange: (newValue: string | boolean) => void;
}): ReactElement => {
  if (override.type === 'boolean') {
    return (
      <FormSelect
        value={String(value)}
        onChange={(_event, newValue) => onChange(newValue === 'true')}
        isDisabled={isDisabled}
        aria-label={__('Edit override for %(key)s', { key: override.key })}
      >
        <FormSelectOption value="true" label={_('true')} />
        <FormSelectOption value="false" label={_('false')} />
      </FormSelect>
    );
  }

  if (override.type === 'yaml') {
    return (
      <TextArea
        resizeOrientation="vertical"
        value={String(value)}
        onChange={(_event, newValue) => onChange(newValue)}
        isDisabled={isDisabled}
        aria-label={__('Edit override for %(key)s', { key: override.key })}
      />
    );
  }

  return (
    <TextInput
      type={
        override.type === 'integer' || override.type === 'real'
          ? 'number'
          : 'text'
      }
      value={String(value)}
      onChange={(_event, newValue) => onChange(newValue)}
      isDisabled={isDisabled}
      aria-label={__('Edit override for %(key)s', { key: override.key })}
    />
  );
};

export const LoadingState = (): ReactElement => (
  <EmptyState>
    <EmptyStateHeader
      titleText={_('Loading Ansible variables...')}
      headingLevel="h4"
      icon={<EmptyStateIcon icon={Spinner} />}
    />
  </EmptyState>
);

export const ErrorState = (): ReactElement => (
  <div>{_('Failed to load Ansible variables.')}</div>
);

export const EmptyOverridesState = ({
  crnType,
}: {
  crnType: ContentResolutionNodeType;
}): ReactElement => (
  <EmptyState variant={EmptyStateVariant.xl}>
    <EmptyStateHeader
      headingLevel="h4"
      titleText={__(_('No Ansible variables found for %(crnType)s'), {
        crnType: crnTypeUiString[crnType],
      })}
      icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
    />
    <EmptyStateBody>
      {__(
        _(
          'Only variables marked as overridable or resolved for this %(crnType)s are shown here.'
        ),
        { crnType: crnTypeUiString[crnType] }
      )}
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <Button variant="link" onClick={() => window.open('/ansible/content')}>
          {_('Manage variable overrides')}
        </Button>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

export const deleteTargetOverride = async ({
  override,
  crnId,
  crnType,
  dispatch,
  onStart,
  onFinish,
  onReload,
}: {
  override: MergedVariableOverride;
  crnId: number;
  crnType: ContentResolutionNodeType;
  dispatch: (...args: unknown[]) => void;
  onStart: () => void;
  onFinish: () => void;
  onReload: () => Promise<void>;
}): Promise<void> => {
  if (
    !window.confirm(
      __(_('Are you sure you want to delete override for %(key)s?'), {
        key: override.key,
      })
    )
  ) {
    return;
  }

  try {
    onStart();
    await axios.delete(
      foremanUrl(
        `/api/v2/ansible_director/ansible_variables/${override.variable_id}/overrides/${override.override_id}`
      )
    );
    dispatch(
      addToast({
        type: 'success',
        key: `DELETE_${crnTypeUrlMap[crnType]}_${crnId}_ANSIBLE_VAR_OVERRIDE_${override.variable_id}`,
        message: __(_('Successfully deleted override for "%(key)s".'), {
          key: override.key,
        }),
        sticky: false,
      })
    );
    await onReload();
  } catch (e) {
    dispatch(
      addToast({
        type: 'danger',
        key: `DELETE_${crnTypeUrlMap[crnType]}_${crnId}_ANSIBLE_VAR_OVERRIDE_${override.variable_id}_ERR`,
        message: __(
          _(
            'Deleting Ansible variable override for "%(key)s" failed with error code "%(error)s".'
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
    onFinish();
  }
};
