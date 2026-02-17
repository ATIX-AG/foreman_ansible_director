/* eslint-disable max-lines */
import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import axios, { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';

import {
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  Icon,
  TextInput,
} from '@patternfly/react-core';

import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';

import { foremanUrl } from 'foremanReact/common/helpers';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { addToast } from 'foremanReact/components/ToastsList';

import Permitted from 'foremanReact/components/Permitted';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import {
  AnsibleLce,
  AnsibleLcePath,
  SparseAnsibleLce,
} from '../../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathComponentHeaderActions } from './AnsibleLcePathComponentHeaderActions';
import { AnsibleLcePathEmptyState } from './AnsibleLcePathEmptyState';
import { AnsibleLceComponentWrapper } from './AnsibleLceComponentWrapper';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';
import { PermittedButton } from '../../../common/PermittedButton';

interface AnsibleLcePathProps {
  lcePath: AnsibleLcePath;
  refreshRequest: () => void;
  setLifecycleEnv: Dispatch<SetStateAction<AnsibleLce | undefined>>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
  setIsExecutionEnvModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AnsibleLcePathComponent = ({
  lcePath,
  refreshRequest,
  setLifecycleEnv,
  setIsContentUnitModalOpen,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
  setIsExecutionEnvModalOpen,
}: AnsibleLcePathProps): ReactElement | null => {
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

  const handleLcePathUpdate = async (): Promise<void> => {
    if (editMode) {
      if (
        JSON.stringify(lcePath) !== JSON.stringify(lifecycleEnvironmentPath)
      ) {
        if (lifecycleEnvironmentPath) {
          setIsConfirmationModalOpen(true);
          setConfirmationModalTitle(`Update "${lcePath.name}"?`);
          setConfirmationModalBody('');
          setConfirmationModalOnConfirm(() => async () => {
            await updateLcePath(lifecycleEnvironmentPath);
          });
        }
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
          `/api/v2/ansible_director/lifecycle_environments/paths/${lcePath.id}/promote`
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

  const destroyLcePath = async (path: AnsibleLcePath): Promise<void> => {
    // TODO: At some point I should refactor all these axios calls to a single function
    try {
      await axios.delete(
        `${foremanUrl(
          '/api/v2/ansible_director/lifecycle_environments/paths'
        )}/${path.id}`
      );
      dispatch(
        addToast({
          type: 'success',
          key: `DESTROY_LCE_PATH_${path.name}_SUCC`,
          message: `Successfully destroyed Ansible environment path "${path.name}"!`,
          sticky: false,
        })
      );
      refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `DESTROY_LCE_${path.name}_ERR`,
          message: `Destruction of Ansible environment path "${
            path.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  const updateLcePath = async (path: AnsibleLcePath): Promise<void> => {
    // TODO: At some point I should refactor all these axios calls to a single function
    try {
      await axios.put(
        `${foremanUrl(
          '/api/v2/ansible_director/lifecycle_environments/paths'
        )}/${path.id}`,
        {
          lifecycle_environment_path: lifecycleEnvironmentPath,
          organization_id: organization?.id,
        }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `UPDATE_LCE_PATH_${path.name}_SUCC`,
          message: `Successfully updated Ansible environment path "${path.name}"!`,
          sticky: false,
        })
      );
      refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPDATE_LCE_${path.name}_ERR`,
          message: `Updating of Ansible environment path "${
            path.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  const handleDestroyLcePath = (path: AnsibleLcePath): void => {
    setIsConfirmationModalOpen(true);
    setConfirmationModalTitle(`Destroy "${path.name}"?`);
    setConfirmationModalBody(
      `This will destroy "${path.name}" and ${path.lifecycle_environments.length} lifecycle environments.\nAre you sure you want to destroy ${path.name}?`
    );
    setConfirmationModalOnConfirm(() => async () => {
      await destroyLcePath(path);
    });
  };

  // const destroyLce = async (lce: AnsibleLce): Promise<void> => {
  //  try {
  //    await axios.delete(
  //      `${foremanUrl('/api/v2/ansible_director/lifecycle_environments')}/${lce.id}`
  //    );
  //    dispatch(
  //      addToast({
  //        type: 'success',
  //        key: `DESTROY_LCE_${lce.name}_SUCC`,
  //        message: `Successfully destroyed Ansible environment "${lce.name}"!`,
  //        sticky: false,
  //      })
  //    );
  //    refreshRequest();
  //  } catch (e) {
  //    dispatch(
  //      addToast({
  //        type: 'danger',
  //        key: `DESTROY_LCE_${lce.name}_ERR`,
  //        message: `Destruction of Ansible environment "${
  //          lce.name
  //        }" failed with error code "${
  //          (e as { response: AxiosResponse }).response.status
  //        }".`,
  //        sticky: false,
  //      })
  //    );
  //  }
  // };

  const insertEnv = async (
    pos: 'before' | 'after',
    lce: SparseAnsibleLce,
    name?: string
  ): Promise<void> => {
    try {
      await axios.post(
        foremanUrl('/api/v2/ansible_director/lifecycle_environments/'),
        {
          lifecycle_environment: {
            name: name || `${pos === 'before' ? 'PRE' : 'POST'}-${lce.name}`,
            position: pos === 'before' ? lce.position : lce.position + 1,
          },
          lifecycle_environment_path_id: lcePath.id,
          organization_id: organization?.id,
        }
      );
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
      await axios.post(
        foremanUrl('/api/v2/ansible_director/lifecycle_environments/'),
        {
          lifecycle_environment: {
            name,
            position: 0,
          },
          lifecycle_environment_path_id: lcePath.id,
          organization_id: organization?.id,
        }
      );
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
        <PermittedButton
          requiredPermissions={[AdPermissions.ansibleLce.create]}
          style={{ padding: '10px' }}
          hasPopover
          popoverProps={{
            triggerAction: 'hover',
            'aria-label': 'destroy popover',
            headerComponent: 'h1',
            headerContent: 'New lifecycle environment',
            bodyContent: (
              <div>
                {__(_('Insert new lifecycle environment after %(lce)s.'), {
                  lce: env.name,
                })}
              </div>
            ),
          }}
          variant="plain"
          aria-label="Action"
          onClick={() => insertEnv('after', env)}
        >
          <Icon size="lg">
            <PlusIcon />
          </Icon>
        </PermittedButton>
      );
    }

    if (env !== undefined && nextEnv !== undefined) {
      if (env.content_hash === nextEnv?.content_hash) {
        return (
          <PermittedButton
            requiredPermissions={[AdPermissions.ansibleLcePaths.promote]}
            hasPopover
            style={{ padding: '10px' }}
            popoverProps={{
              triggerAction: 'hover',
              'aria-label': 'promote equivalent popover',
              headerComponent: 'h1',
              headerContent: (
                <div>
                  {__(
                    _(
                      'Ansible environments %(env)s and %(nEnv)s are equivalent.'
                    ),
                    { env: env.name, nEnv: nextEnv.name }
                  )}
                </div>
              ),
              bodyContent: <div>{_('They provide the same content.')}</div>,
            }}
            variant="plain"
            aria-label="Action"
          >
            <Icon size="lg">
              <BarsIcon />
            </Icon>
          </PermittedButton>
        );
      }

      return (
        <PermittedButton
          requiredPermissions={[AdPermissions.ansibleLcePaths.promote]}
          isLoading={env.id === loadingButton}
          hasPopover
          style={{ padding: '10px' }}
          popoverProps={{
            triggerAction: 'hover',
            'aria-label': 'promote popover',
            headerComponent: 'h1',
            headerContent: (
              <div>
                {__(
                  _(
                    'Ansible environments %(env)s and %(nEnv)s are not equivalent.'
                  ),
                  { env: env.name, nEnv: nextEnv.name }
                )}
              </div>
            ),
            bodyContent: (
              <div>
                {_('They provide different content.')}
                <br />
                {__(
                  _('Promote to assign the content of %(env)s to %(nEnv)s.'),
                  { env: env.name, nEnv: nextEnv.name }
                )}
              </div>
            ),
          }}
          variant="plain"
          aria-label="Action"
          onClick={() => handlePromote(env.id, nextEnv.id)}
        >
          <Icon size="lg">
            <ArrowRightIcon />
          </Icon>
        </PermittedButton>
      );
    }

    return null;
  };

  const lceComponents = (): ReactNode => {
    if (lcePath.lifecycle_environments.length > 0) {
      return lcePath.lifecycle_environments.map((env, index) => (
        <React.Fragment key={`${env.name}-${index}`}>
          <AnsibleLceComponentWrapper
            lce={env}
            pathEditMode={editMode}
            refreshRequest={refreshRequest}
            setIsContentUnitModalOpen={setIsContentUnitModalOpen}
            setLifecycleEnv={setLifecycleEnv}
            setIsConfirmationModalOpen={setIsConfirmationModalOpen}
            setConfirmationModalTitle={setConfirmationModalTitle}
            setConfirmationModalBody={setConfirmationModalBody}
            setConfirmationModalOnConfirm={setConfirmationModalOnConfirm}
            setIsExecutionEnvModalOpen={setIsExecutionEnvModalOpen}
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
              handleEdit={handleLcePathUpdate}
              handleDestroy={handleDestroyLcePath}
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
          <Permitted requiredPermissions={[AdPermissions.ansibleLce.view]}>
            {lceComponents()}
          </Permitted>
        </div>
      </CardBody>
    </Card>
  );
};
