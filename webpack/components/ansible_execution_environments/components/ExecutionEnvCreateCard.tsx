import React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  Icon,
  Bullseye,
  Avatar,
  CardHeader,
  TextInput,
  Form,
  FormGroup,
  Button,
  ClipboardCopy,
  TextContent,
  Text,
  TextVariants,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import { ExecutionEnvCard } from './ExecutionEnvCard';
import { AnsibleExecutionEnvCreate } from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvCardHeaderActions } from './ExecutionEnvCardHeaderActions';
import { TextInputEditable } from './components/TextInputEditable';
import { DropdownEditable } from './components/DropdownEditable';
import { ANSIBLE_VERSIONS } from '../../../helpers/constants';

interface ExecutionEnvCreateCardProps {
  createEnvAction: (env: AnsibleExecutionEnvCreate) => Promise<void>;
}

export const ExecutionEnvCreateCard: React.FC<ExecutionEnvCreateCardProps> = ({
  createEnvAction,
}) => {
  console.log('sus');

  const [createMode, setCreateMode] = React.useState<boolean>(false);

  const [executionEnvironment, setExecutionEnvironment] = React.useState<
    AnsibleExecutionEnvCreate
  >({ name: '', ansible_version: '', base_image_url: '', content: [] }); // TODO: defaults

  const createExecutionEnv = async (): Promise<void> => {
    await createEnvAction(executionEnvironment);
    setCreateMode(false);
    setExecutionEnvironment({
      name: '',
      ansible_version: '',
      base_image_url: '',
      content: [],
    });
  };

  return !createMode ? (
    <Card ouiaId="BasicCard" isClickable isRounded isLarge>
      <CardHeader
        selectableActions={{
          onClickAction: () => {
            setCreateMode(true);
          },
          selectableActionId: 'id1',
          selectableActionAriaLabelledby: 'clickable-card-example-1',
          name: 'clickable-card-example',
        }}
      />
      <CardBody>
        <Bullseye>
          <PlusIcon style={{ width: '100px', height: '100px' }} />
        </Bullseye>
      </CardBody>
      <CardFooter />
    </Card>
  ) : (
    <Card ouiaId="BasicCard" isLarge isRounded>
      <CardHeader
        actions={{
          actions: (
            <ExecutionEnvCardHeaderActions
              editMode
              handleDestroy={() => setCreateMode(false)}
              handleEdit={() => {
                createExecutionEnv();
              }}
              handleBuild={() => {}}
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
        />
      </CardTitle>
      <CardBody>
        <Form isHorizontal>
          <FormGroup label="Base-Image URL">
            <TextInputEditable
              isEditable
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
              isEditable
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
