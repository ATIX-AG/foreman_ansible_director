import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  Bullseye,
  CardHeader,
  TextInput,
  Form,
  FormGroup,
  Popover,
} from '@patternfly/react-core';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvCardHeaderActions } from './ExecutionEnvCardHeaderActions';
import { TextInputEditable } from './components/TextInputEditable';
import { useAdContext } from '../../common/AdContextWrapper';

interface ExecutionEnvCreateCardProps {
  createEnvAction: (env: AnsibleExecutionEnvCreate) => Promise<void>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedEnv: Dispatch<
    SetStateAction<AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined>
  >;
  createModeOverride: boolean;
}

export const ExecutionEnvCreateCard: React.FC<ExecutionEnvCreateCardProps> = ({
  createEnvAction,
  setIsContentUnitModalOpen,
  setSelectedEnv,
  createModeOverride,
}) => {
  const ctx = useAdContext();

  const [createMode, setCreateMode] = React.useState<boolean>(false);

  const [executionEnvironment, setExecutionEnvironment] = React.useState<
    AnsibleExecutionEnvCreate
  >({
    name: '',
    ansible_version: ctx.settings.ad_default_ansible_core_version,
    base_image_url: '',
    content: [],
  });

  useEffect(() => {
    setCreateMode(createModeOverride);
  }, [createModeOverride]);

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
              isEditable
              value={executionEnvironment.ansible_version}
              setValue={(_event, value) =>
                setExecutionEnvironment({
                  ...executionEnvironment,
                  ansible_version: value,
                })
              }
            />
          </FormGroup>
          {/*          <FormGroup label="Baked content"> TODO: evaluate whether this feature should be exposed to users
            <Bullseye>
              <Button
                variant="control"
                onClick={() => {
                  setIsContentUnitModalOpen(true);
                  setSelectedEnv(executionEnvironment);
                }}
              >
                Assign content units
              </Button>
            </Bullseye>
          </FormGroup> */}
        </Form>
      </CardBody>
    </Card>
  );
};
