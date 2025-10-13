import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  TextInput,
  Popover,
} from '@patternfly/react-core';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { TextInputEditable } from './components/TextInputEditable';

import { ExecutionEnvCardHeaderActions } from './ExecutionEnvCardHeaderActions';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';

interface ExecutionEnvCardProps {
  executionEnv: AnsibleExecutionEnv;
  handleDestroy: (env: AnsibleExecutionEnv) => void;
  handleUpdate: (env: AnsibleExecutionEnv) => void;
  setSelectedEnv: Dispatch<
    SetStateAction<AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined>
  >;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const ExecutionEnvCard: React.FC<ExecutionEnvCardProps> = ({
  executionEnv,
  handleDestroy,
  handleUpdate,
  setSelectedEnv,
  setIsContentUnitModalOpen,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [executionEnvironment, setExecutionEnvironment] = React.useState<
    AnsibleExecutionEnv
  >();

  useEffect(() => {
    setExecutionEnvironment(executionEnv);
  }, [executionEnv]);

  const askConfirmUpdate = async (): Promise<void> => {
    setSelectedEnv(executionEnvironment);
    if (editMode) {
      if (
        JSON.stringify(executionEnv) !== JSON.stringify(executionEnvironment)
      ) {
        executionEnvironment && handleUpdate(executionEnv);
      }
    }
    setEditMode(!editMode);
  };

  const askConfirmDestroy = (): void => {
    setSelectedEnv(executionEnv);
    handleDestroy(executionEnv);
  };

  if (!executionEnvironment) {
    return null;
  }

  return (
    <Card ouiaId="BasicCard" isLarge isRounded>
      <CardHeader
        actions={{
          actions: (
            <ExecutionEnvCardHeaderActions
              editMode={editMode}
              handleDestroy={askConfirmDestroy}
              handleEdit={askConfirmUpdate}
              executionEnvironment={executionEnvironment}
            />
          ),
        }}
      />
      <CardTitle>
        <TextInput
          className="pf-v5-c-card__title-text"
          value={executionEnvironment.name}
          onChange={(_event, value: string) => {
            setExecutionEnvironment({
              ...executionEnvironment,
              name: value,
            });
          }}
          type="text"
          readOnlyVariant={editMode ? undefined : 'plain'}
        />
      </CardTitle>
      <CardBody>
        <Form isHorizontal>
          <FormGroup label="Base-Image URL">
            <TextInputEditable
              isEditable={editMode}
              value={executionEnvironment.base_image_url}
              setValue={(_event, value) => {
                setExecutionEnvironment({
                  ...executionEnvironment,
                  base_image_url: value,
                });
              }}
            />
          </FormGroup>
          <FormGroup
            label="Ansible version"
            labelIcon={
              <Popover
                headerContent={<div>ansible-core version</div>}
                bodyContent={
                  <div>
                    The version of ansible-core to be used in this Execution
                    environment. As ansible-core is installed from PyPi, the
                    version must match one of{' '}
                    <a
                      href="https://pypi.org/project/ansible-core/#history"
                      target="_blank"
                      rel="noreferrer"
                    >
                      the available releases.
                    </a>
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="More info for unit id field"
                  onClick={e => e.preventDefault()}
                  aria-describedby="content-unit-identifier-field-01"
                  className={styles.formGroupLabelHelp}
                >
                  <HelpIcon />
                </button>
              </Popover>
            }
          >
            <TextInputEditable
              isEditable={editMode}
              value={executionEnvironment.ansible_version}
              setValue={(_event, value) =>
                setExecutionEnvironment({
                  ...executionEnvironment,
                  ansible_version: value,
                })
              }
            />
          </FormGroup>
          {/* <FormGroup label="Baked content">
            <Bullseye>
              <Button
                variant="control"
                onClick={() => {
                  setSelectedEnv(executionEnv);
                  setIsContentUnitModalOpen(true);
                }}
              >
                {`${executionEnvironment.content.length} ${
                  executionEnvironment.content.length === 1
                    ? 'content unit'
                    : 'content units'
                }`}
              </Button>
            </Bullseye>
          </FormGroup> */}
        </Form>
      </CardBody>
    </Card>
  );
};
