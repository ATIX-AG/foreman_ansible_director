import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  CardHeader,
  Form,
  FormGroup,
  TextInput,
  TextVariants,
  Text,
  TextContent,
  Button,
  Bullseye,
  Timestamp,
  TimestampFormat,
  ClipboardCopy,
} from '@patternfly/react-core';

import { DropdownEditable } from './components/DropdownEditable';
import { TextInputEditable } from './components/TextInputEditable';
import { ANSIBLE_VERSIONS } from '../../../helpers/constants';

import { ExecutionEnvCardHeaderActions } from './ExecutionEnvCardHeaderActions';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';

interface ExecutionEnvCardProps {
  executionEnv: AnsibleExecutionEnv;
  handleDestroy: (env: AnsibleExecutionEnv) => void;
  handleUpdate: (env: AnsibleExecutionEnv) => void;
  setSelectedEnv: Dispatch<SetStateAction<AnsibleExecutionEnv | undefined>>;
}

export const ExecutionEnvCard: React.FC<ExecutionEnvCardProps> = ({
  executionEnv,
  handleDestroy,
  handleUpdate,
  setSelectedEnv,
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

  const handleBuild = (): void => {
    console.log('');
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
              handleBuild={handleBuild}
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
          <FormGroup label="Ansible version">
            <DropdownEditable
              isEditable={editMode}
              options={ANSIBLE_VERSIONS}
              value={executionEnvironment.ansible_version}
              setValue={(_event, value) =>
                setExecutionEnvironment({
                  ...executionEnvironment,
                  ansible_version: value,
                })
              }
            />
          </FormGroup>
          <FormGroup label="Baked content">
            <Bullseye>
              <Button variant="control">420 content units</Button>
            </Bullseye>
          </FormGroup>
        </Form>
      </CardBody>
    </Card>
  );
};
