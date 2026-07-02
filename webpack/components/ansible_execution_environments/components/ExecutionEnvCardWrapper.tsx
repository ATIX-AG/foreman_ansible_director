import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
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
import { AnsibleExecutionEnv } from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvCard } from './ExecutionEnvCard';
import { ConfirmationModal } from '../../../helpers/components/ConfirmationModal';
import { ExecutionEnvironment } from '../../../resources/clients/ExecutionEnvironment';
import { useToasts } from '../../../helpers/toasts/useToasts';
import { useAdContext } from '../../../helpers/adContext';

interface ExecutionEnvCardWrapperProps {
  executionEnv: AnsibleExecutionEnv;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  onDestroy: () => void;
}

interface ConfirmableAction {
  title: string;
  body: string;
  mode: 'destroy' | 'update';
  onConfirm: () => void;
  onAbort: () => void;
}

export const ExecutionEnvCardWrapper = ({
  executionEnv,
  setIsContentUnitModalOpen,
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
    DefaultResponse<never, never, AnsibleExecutionEnv>
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
      getExecutionEnvResponse.response?.results?.build_status === 'running'
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

  const updateEnvironment = async (env: AnsibleExecutionEnv): Promise<void> => {
    await withToast({
      type: 'update',
      resource: 'execution_environment',
      func: ExecutionEnvironment.update(env.id, {
        execution_environment: {
          name: env.name,
          base_image_url: env.base_image_url,
          ansible_version: env.ansible_version,
        },
      }),
    });
    refreshRequest();
  };

  const destroyEnvironment = async (
    env: AnsibleExecutionEnv
  ): Promise<void> => {
    await withToast({
      type: 'delete',
      resource: 'execution_environment',
      func: ExecutionEnvironment.destroy(env.id),
    });
  };

  const currentEnv =
    getExecutionEnvResponse.status === 'RESOLVED'
      ? getExecutionEnvResponse.response.results
      : executionEnv;

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
          handleDestroy={env =>
            setActionPendingConfirmation({
              title: __(_('Confirm deletion of %(name)s'), { name: env.name }),
              body: __(_('Are you sure you want to delete %(name)s?'), {
                name: env.name,
              }),
              mode: 'destroy',
              onConfirm: async () => {
                await destroyEnvironment(env);
                setActionPendingConfirmation(null);
                onDestroy();
              },
              onAbort: () => {
                setActionPendingConfirmation(null);
              },
            })}
          handleUpdate={env =>
            setActionPendingConfirmation({
              title: __(_('Confirm update of %(name)s'), { name: env.name }),
              body: __(
                _(
                  'Are you sure you want to update %(name)s? This will require a rebuild of the associated image.'
                ),
                { name: env.name }
              ),
              mode: 'update',
              onConfirm: async () => {
                await updateEnvironment(env);
                setActionPendingConfirmation(null);
              },
              onAbort: () => {
                setActionPendingConfirmation(null);
              },
            })}
          setIsContentUnitModalOpen={setIsContentUnitModalOpen}
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
