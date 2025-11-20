import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Split,
  SplitItem,
  TextInput,
} from '@patternfly/react-core';

import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';
import { AnsibleLceComponentHeaderActions } from './AnsibleLceComponentHeaderActions';
import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';
import axios, { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';

interface AnsibleLceComponentProps {
  lce: AnsibleLce;
  pathEditMode: boolean;
  refreshRequest: () => void;
  setLifecycleEnv: Dispatch<SetStateAction<AnsibleLce | undefined>>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
  setIsExecutionEnvModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AnsibleLceComponent: React.FC<AnsibleLceComponentProps> = ({
  lce,
  pathEditMode,
  refreshRequest,
  setLifecycleEnv,
  setIsContentUnitModalOpen,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
  setIsExecutionEnvModalOpen,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [lifecycleEnvironment, setLifecycleEnvironment] = React.useState<
    AnsibleLce
  >();

  useEffect(() => {
    setLifecycleEnvironment(lce);
  }, [lce]);

  const dispatch = useDispatch();

  const handleLceUpdate = (): void => {
    if (editMode) {
      if (JSON.stringify(lce) !== JSON.stringify(lifecycleEnvironment)) {
        setIsConfirmationModalOpen(true);
        setConfirmationModalTitle(`Update "${lce.name}"?`);
        setConfirmationModalBody('');
        setConfirmationModalOnConfirm(() => async () => {
          await updateLce(lce);
        });
      }
    }
    setEditMode(!editMode);
  };

  const updateLce = async (env: AnsibleLce): Promise<void> => {
    try {
      await axios.put(
        `${foremanUrl('/api/v2/ansible_director/lifecycle_environments')}/${env.id}`,
        {
          lifecycle_environment: lifecycleEnvironment,
        }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `UPDATE_LCE_${env.name}_SUCC`,
          message: `Successfully updated Ansible environment "${env.name}"!`,
          sticky: false,
        })
      );
      refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPDATE_LCE_${env.name}_ERR`,
          message: `Updating of Ansible environment "${
            env.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  const destroyLce = async (lce: AnsibleLce): Promise<void> => {
    try {
      await axios.delete(
        `${foremanUrl('/api/v2/ansible_director/lifecycle_environments')}/${lce.id}`
      );
      dispatch(
        addToast({
          type: 'success',
          key: `DESTROY_LCE_${lce.name}_SUCC`,
          message: `Successfully destroyed Ansible environment "${lce.name}"!`,
          sticky: false,
        })
      );
      refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `DESTROY_LCE_${lce.name}_ERR`,
          message: `Destruction of Ansible environment "${
            lce.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  const handleEditContent = async (): Promise<void> => {
    setLifecycleEnv(lce);
    setIsContentUnitModalOpen(true);
  };

  const handleEditExecutionEnv = async (): Promise<void> => {
    setLifecycleEnv(lce);
    setIsExecutionEnvModalOpen(true);
  }

  return lifecycleEnvironment ? (
    <Card
      style={{
        flex: 1,
        margin: 0,
        minWidth: 'max-content',
        boxShadow: 'var(--pf-v5-global--BoxShadow--lg)',
      }}
      isRounded
    >
      <CardHeader
        actions={{
          actions: (
            <AnsibleLceComponentHeaderActions
              lce={lce}
              pathEditMode={pathEditMode}
              editMode={editMode}
              handleEdit={handleLceUpdate}
              handleDestroy={() => new Promise<void>(() => {})}
              handleEditContent={handleEditContent}
            />
          ),
          hasNoOffset: true,
        }}
      >
        <TextInput
          style={{
            fontSize: 'var(--pf-v5-global--FontSize--md)',
            fontWeight: 'var(--pf-v5-global--FontWeight--medium)',
            fontFamily: 'var(--pf-v5-global--FontFamily--heading)',
            lineHeight: 'var(--pf-v5-global--LineHeight--medium)',
          }}
          className="pf-v5-c-card__title-text"
          value={lifecycleEnvironment.name}
          onChange={(_event, value: string) => {
            setLifecycleEnvironment({
              ...lifecycleEnvironment,
              name: value,
            });
          }}
          type="text"
          readOnlyVariant={editMode ? undefined : 'plain'}
        />
      </CardHeader>
      <CardBody>
        <Split>
          <SplitItem>
            <div
              style={{
                fontSize: 'var(--pf-global--FontSize--xs)',
                color: 'var(--pf-global--Color--200)',
              }}
            >
              Execution environment:{' '}
              <Button
                onClick={handleEditExecutionEnv}
                component="a"
                isInline
                variant="link"
                iconPosition="end"
              >
                {lifecycleEnvironment.execution_environment
                  ? lifecycleEnvironment.execution_environment.name
                  : 'None'}
              </Button>
            </div>
          </SplitItem>
          <SplitItem isFilled />
          <SplitItem>
            <Button
              // Preventing default click behavior for example purposes only
              onClick={(event: React.MouseEvent) => event.preventDefault()}
              component="a"
              isInline
              variant="link"
              isDisabled
            >
              {`${lifecycleEnvironment.content.length} content units`}
            </Button>
          </SplitItem>
        </Split>
      </CardBody>
    </Card>
  ) : null;
};
