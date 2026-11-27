import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  Card,
  CardBody,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';

import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { DefaultResponse } from '../../../types/common';
import {
  ExecutionEnvironment,
  ExecutionEnvironmentDraft,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvironment as ExecutionEnvironmentClient } from '../../../resources/clients/ExecutionEnvironment';
import { ExecutionEnvCard } from './ExecutionEnvCard';
import { executionEnvCardConfigs } from './executionEnvCardConfig';
import { ConfirmationModal } from '../../../helpers/components/ConfirmationModal';
import { useToasts } from '../../../helpers/toasts/useToasts';
import { useAdContext } from '../../../helpers/adContext';

interface ExecutionEnvCardWrapperProps {
  executionEnv: ExecutionEnvironment;
  onDestroy: () => void;
}

interface ConfirmableAction {
  title: string;
  body: string;
  onConfirm: () => Promise<void>;
  onAbort: () => void;
}

export const ExecutionEnvCardWrapper = ({
  executionEnv,
  onDestroy,
}: ExecutionEnvCardWrapperProps): ReactElement => {
  const [
    actionPendingConfirmation,
    setActionPendingConfirmation,
  ] = React.useState<ConfirmableAction | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { withToast } = useToasts();

  const ctx = useAdContext();

  const getExecutionEnvResponse = useAPI<
    DefaultResponse<never, never, ExecutionEnvironment>
  >(
    'get',
    foremanUrl(
      `/api/v2/ansible_director/execution_environments/${executionEnv.id}`
    )
  );

  const refreshRequest = useCallback((): void => {
    getExecutionEnvResponse.setAPIOptions(options => ({ ...options }));
  }, [getExecutionEnvResponse]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();

    pollTimerRef.current = setInterval(() => {
      refreshRequest();
    }, ctx.settings.ansible_director_ui_refresh_interval * 1000);

    return () => stopPolling();
  }, [
    ctx.settings.ansible_director_ui_refresh_interval,
    refreshRequest,
    stopPolling,
  ]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (
      getExecutionEnvResponse.status === 'RESOLVED' &&
      getExecutionEnvResponse.response?.results?.status === 'running'
    ) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [
    getExecutionEnvResponse.response.results,
    getExecutionEnvResponse.status,
    startPolling,
    stopPolling,
  ]);

  const currentEnv =
    getExecutionEnvResponse.status === 'RESOLVED'
      ? getExecutionEnvResponse.response.results
      : executionEnv;

  const confirm = (
    title: string,
    body: string,
    onConfirm: () => Promise<boolean>
  ): Promise<boolean> =>
    new Promise(resolve => {
      setActionPendingConfirmation({
        title,
        body,
        onConfirm: async () => {
          const confirmed = await onConfirm();
          setActionPendingConfirmation(null);
          resolve(confirmed);
        },
        onAbort: () => {
          setActionPendingConfirmation(null);
          resolve(false);
        },
      });
    });

  const updateEnvironment = async (
    draft: ExecutionEnvironmentDraft
  ): Promise<boolean> => {
    const response = await withToast({
      type: 'update',
      resource: 'execution_environment',
      func: ExecutionEnvironmentClient.update(currentEnv.id, {
        execution_environment: draft,
      }),
    });
    refreshRequest();

    return response.ok;
  };

  const destroyEnvironment = async (): Promise<void> => {
    await withToast({
      type: 'delete',
      resource: 'execution_environment',
      func: ExecutionEnvironmentClient.destroy(currentEnv.id),
    });
  };

  const requestUpdate = (draft: ExecutionEnvironmentDraft): Promise<boolean> => {
    const rebuilds = executionEnvCardConfigs[currentEnv.source].rebuildsOnChange;
    const body = rebuilds
      ? __(
        _(
          'Are you sure you want to update %(name)s? This will require a rebuild of the associated image.'
        ),
        { name: currentEnv.name }
      )
      : __(
        _(
          'Are you sure you want to update %(name)s?'
        ),
        { name: currentEnv.name }
      );

    return confirm(
      __(_('Confirm update of %(name)s'), { name: currentEnv.name }),
      body,
      async () => updateEnvironment(draft)
    );
  };

  const requestDestroy = (): Promise<boolean> =>
    confirm(
      __(_('Confirm deletion of %(name)s'), { name: currentEnv.name }),
      __(_('Are you sure you want to delete %(name)s?'), {
        name: currentEnv.name,
      }),
      async () => {
        await destroyEnvironment();
        onDestroy();

        return true;
      }
    );

  if (getExecutionEnvResponse.status === 'ERROR') {
    // TODO: Handle error
  } else if (getExecutionEnvResponse.status === 'RESOLVED') {
    return (
      <>
        {actionPendingConfirmation !== null && (
          <ConfirmationModal
            isConfirmationModalOpen
            title={actionPendingConfirmation.title}
            body={actionPendingConfirmation.body}
            onConfirm={actionPendingConfirmation.onConfirm}
            onAbort={actionPendingConfirmation.onAbort}
          />
        )}
        <ExecutionEnvCard
          executionEnv={currentEnv}
          onDelete={requestDestroy}
          onSave={requestUpdate}
        />
      </>
    );
  }

  return (
    <Card style={{ minHeight: '21vh' }}>
      <CardBody>
        <EmptyState>
          <EmptyStateHeader
            titleText={__(_('Loading execution environment %(ee)s...'), {
              ee: executionEnv.name,
            })}
            headingLevel="h4"
            icon={<EmptyStateIcon icon={Spinner} />}
          />
        </EmptyState>
      </CardBody>
    </Card>
  );
};
