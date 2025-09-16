import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';

import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Popover,
  TextInput,
} from '@patternfly/react-core';

import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';

import { foremanUrl } from 'foremanReact/common/helpers';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { addToast } from 'foremanReact/components/ToastsList';

import {
  AnsibleLce,
  AnsibleLcePath,
  SparseAnsibleLce,
} from '../../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathComponentHeaderActions } from './AnsibleLcePathComponentHeaderActions';
import { AnsibleLcePathEmptyState } from './AnsibleLcePathEmptyState';
import { AnsibleLceComponentWrapper } from './AnsibleLceComponentWrapper';

interface AnsibleLcePathProps {
  lcePath: AnsibleLcePath;
  refreshRequest: () => void;
  destroyLce: (env: AnsibleLce) => void;
  destroyLcePath: (lcePath: AnsibleLcePath) => void;
  setLifecycleEnv: Dispatch<SetStateAction<AnsibleLce | undefined>>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AnsibleLcePathComponent: React.FC<AnsibleLcePathProps> = ({
  lcePath,
  refreshRequest,
  destroyLce,
  destroyLcePath,
  setLifecycleEnv,
  setIsContentUnitModalOpen,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);

  const [
    lifecycleEnvironmentPath,
    setLifecycleEnvironmentPath,
  ] = React.useState<AnsibleLcePath>();

  const [loadingButton, setLoadingButton] = useState<number>();

  const organization = useForemanOrganization();
  const dispatch = useDispatch();

  useEffect(() => {
    setLifecycleEnvironmentPath(lcePath);
  }, [lcePath]);

  const askConfirmUpdate = async (): Promise<void> => {
    if (editMode) {
      if (
        JSON.stringify(lcePath) !== JSON.stringify(lifecycleEnvironmentPath)
      ) {
        // TODO: update
      }
    }
    setEditMode(!editMode);
  };

  const handlePromote = async (
    sourceEnvId: number,
    targetEnvId: number
  ): Promise<void> => {
    setLoadingButton(sourceEnvId);
    try {
      await axios.post(
        foremanUrl(
          `/api/v2/ansible/lifecycle_environments/paths/${lcePath.id}/promote`
        ),
        {
          promote: {
            source_environment_id: sourceEnvId,
            target_environment_id: targetEnvId,
          },
        }
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `PROMOTE_${sourceEnvId}_ERR`,
          message: `Promotion failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    } finally {
      refreshRequest();
      setLoadingButton(undefined);
    }
  };

  const handleDestroy = async (): Promise<void> => {
    try {
      await axios.delete(
        foremanUrl(
          `/api/v2/ansible/lifecycle_environments/paths/${lcePath.id}`
        )
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `DELETE_${lcePath.id}_ERR`,
          message: `Promotion failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    } finally {
      refreshRequest();
      setLoadingButton(undefined);
    }
  };

  const insertEnv = async (
    pos: 'before' | 'after',
    lce: SparseAnsibleLce,
    name?: string
  ): Promise<void> => {
    try {
      await axios.post(foremanUrl('/api/v2/ansible/lifecycle_environments/'), {
        lifecycle_environment: {
          name: name || `${pos === 'before' ? 'PRE' : 'POST'}-${lce.name}`,
          position: pos === 'before' ? lce.position : lce.position + 1,
        },
        lifecycle_environment_path_id: lcePath.id,
        organization_id: organization?.id,
      });
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: 'INSERT_ENV_ERR',
          message: `Insertion of environment ${pos} ${
            lce.name
          } failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    } finally {
      refreshRequest();
    }
  };

  const insertFirstEnv = async (name: string): Promise<void> => {
    try {
      await axios.post(foremanUrl('/api/v2/ansible/lifecycle_environments/'), {
        lifecycle_environment: {
          name,
          position: 0,
        },
        lifecycle_environment_path_id: lcePath.id,
        organization_id: organization?.id,
      });
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: 'INSERT_ENV_ERR',
          message: `Insertion of environment ${name} failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    } finally {
      refreshRequest();
    }
  };

  const connectionIcon = (
    env: SparseAnsibleLce,
    index: number
  ): React.ReactNode => {
    const nextEnv = lcePath.lifecycle_environments[index + 1];
    if (editMode) {
      return (
        <Popover
          triggerAction="hover"
          aria-label="Hoverable popover"
          headerContent={<div>New Lifecycle Environment</div>}
          bodyContent={
            <div>
              Insert new Lifecycle environment after <strong>{env.name}</strong>
              .
            </div>
          }
        >
          <Button
            variant="plain"
            style={{ padding: '10px' }}
            onClick={() => insertEnv('after', env)}
          >
            <Icon iconSize="lg" style={{ verticalAlign: 'middle' }}>
              <PlusIcon />
            </Icon>
          </Button>
        </Popover>
      );
    }

    if (env !== undefined && nextEnv !== undefined) {
      if (env.content_hash === nextEnv?.content_hash) {
        return (
          <Popover
            triggerAction="hover"
            aria-label="Hoverable popover"
            headerContent={
              <div>{`Environments ${env.name} and ${nextEnv.name} are equivalent.`}</div>
            }
            bodyContent={
              <div>
                These environments are using the same content.
                <br />
                {'Content hash: '}
                <strong>{env.content_hash}</strong>
              </div>
            }
          >
            <Button variant="plain" style={{ padding: '10px' }}>
              <Icon iconSize="lg" style={{ verticalAlign: 'middle' }}>
                <BarsIcon />
              </Icon>
            </Button>
          </Popover>
        );
      }

      return (
        <Popover
          triggerAction="hover"
          aria-label="Hoverable popover"
          headerContent={
            <div>
              {`Environments ${env.name} and ${nextEnv.name} are `}
              <strong>not</strong>
              {' equivalent.'}
            </div>
          }
          bodyContent={
            <div>
              These environments are using different content.
              <br />
              {`Promotion will assign the content of ${env.name} to ${nextEnv.name}.`}
            </div>
          }
        >
          <Button
            variant="plain"
            style={{ padding: '10px' }}
            isLoading={env.id === loadingButton}
            // @ts-ignore: TS18048 - env.env is checked for undefined above
            onClick={() => handlePromote(env.id, nextEnv.id)}
          >
            <Icon iconSize="lg" style={{ verticalAlign: 'middle' }}>
              <ArrowRightIcon />
            </Icon>
          </Button>
        </Popover>
      );
    }

    return null;
  };

  const lceComponents = (): React.ReactNode => {
    if (lcePath.lifecycle_environments.length > 0) {
      return lcePath.lifecycle_environments.map((env, index) => (
        <React.Fragment key={`${env.name}-${index}`}>
          <AnsibleLceComponentWrapper
            lce={env}
            pathEditMode={editMode}
            setIsContentUnitModalOpen={setIsContentUnitModalOpen}
            setLifecycleEnv={setLifecycleEnv}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {connectionIcon(env, index)}
          </div>
        </React.Fragment>
      ));
    }

    return (
      <Bullseye style={{ margin: 'auto' }}>
        <AnsibleLcePathEmptyState insertFirstEnv={insertFirstEnv} />
      </Bullseye>
    );
  };

  if (!lifecycleEnvironmentPath) {
    return null;
  }

  return (
    <Card ouiaId="BasicCard" isCompact>
      <CardHeader
        actions={{
          actions: (
            <AnsibleLcePathComponentHeaderActions
              lcePath={lifecycleEnvironmentPath}
              editMode={editMode}
              handleEdit={askConfirmUpdate}
              handleDestroy={destroyLcePath}
            />
          ),
          hasNoOffset: true,
        }}
      >
        <TextInput
          style={{
            fontSize: 'var(--pf-v5-global--FontSize--xl)',
            fontWeight: 'var(--pf-v5-global--FontWeight--xlarge)',
            fontFamily: 'var(--pf-v5-global--FontFamily--heading)',
            lineHeight: 'var(--pf-v5-global--LineHeight--xl)',
          }}
          className="pf-v5-c-card__title-text"
          value={lifecycleEnvironmentPath.name}
          onChange={(_event, value: string) => {
            setLifecycleEnvironmentPath({
              ...lifecycleEnvironmentPath,
              name: value,
            });
          }}
          type="text"
          readOnlyVariant={editMode ? undefined : 'plain'}
        />
      </CardHeader>
      <CardBody>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '20px',
            justifyContent: 'space-evenly',
            overflow: 'auto',
          }}
        >
          {lceComponents()}
        </div>
      </CardBody>
    </Card>
  );
};
