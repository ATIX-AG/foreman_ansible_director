import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
} from 'react';

import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  FormGroup,
  Icon,
  Popover,
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import CodeIcon from '@patternfly/react-icons/dist/esm/icons/code-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import styles from '@patternfly/react-styles/css/components/Form/form';

import {
  AnsibleVariable,
  AnsibleVariableDetail,
} from '../../../../../types/AnsibleVariableTypes';
import { TextInputEditable } from '../../../../ansible_execution_environments/components/components/TextInputEditable';

import { StringAdapter } from './ValueAdapters/StringAdapter';
import { YamlAdapter } from './ValueAdapters/YamlAdapter';
import { BooleanAdapter } from './ValueAdapters/BooleanAdapter';
import { IntegerAdapter } from './ValueAdapters/IntegerAdapter';
import { RealAdapter } from './ValueAdapters/RealAdapter';
import { OverridesTabContent } from './OverridesTabContent';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

interface VariableManagementModalProps {
  originalVariable: AnsibleVariableDetail;
  setSelectedVariable: Dispatch<SetStateAction<AnsibleVariable | undefined>>;
  refreshRequest: () => void;
}
export const VariableManagementModalContent = ({
  originalVariable,
  setSelectedVariable,
  refreshRequest,
}: VariableManagementModalProps): ReactElement => {
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);

  const [ansibleVariable, setAnsibleVariable] = React.useState<
    AnsibleVariableDetail | undefined
  >(undefined);

  const variableTypes: AnsibleVariable['type'][] = [
    'string',
    'boolean',
    'integer',
    'real',
    'yaml',
  ];

  useEffect(() => {
    setAnsibleVariable(originalVariable);
  }, [originalVariable]);

  const valueAdapter = (
    variable: AnsibleVariableDetail
  ): ReactElement | null => {
    if (ansibleVariable !== undefined) {
      const onChange = <T extends boolean | string | number>(
        newValue: T
      ): void => {
        setAnsibleVariable({
          ...ansibleVariable,
          default_value: newValue as T,
        });
      };

      switch (variable.type) {
        case 'string':
          return (
            <StringAdapter
              isEditMode={isEditMode}
              value={variable.default_value as string}
              onChange={onChange}
            />
          );
        case 'boolean':
          return (
            <BooleanAdapter
              isEditMode={isEditMode}
              value={variable.default_value as boolean}
              onChange={onChange}
            />
          );
        case 'integer':
          return (
            <IntegerAdapter
              isEditMode={isEditMode}
              value={variable.default_value as number}
              onChange={onChange}
            />
          );
        case 'real':
          return (
            <RealAdapter
              isEditMode={isEditMode}
              value={variable.default_value as number}
              onChange={onChange}
            />
          );
        case 'yaml':
          return (
            <YamlAdapter
              isEditMode={isEditMode}
              value={variable.default_value as string}
              onChange={onChange}
            />
          );
        default:
          return null;
      }
    }
    return null;
  };

  const headerActions = (): ReactElement[] => {
    const baseVariableActions = [
      <Button
        variant="plain"
        aria-label="Action"
        onClick={() => setIsEditMode(!isEditMode)}
      >
        {isEditMode ? (
          <Icon size="lg">
            <SaveIcon />
          </Icon>
        ) : (
          <Icon size="lg">
            <EditIcon />
          </Icon>
        )}
      </Button>,
    ];
    if (isEditMode) {
      baseVariableActions.push(
        <Button
          variant="plain"
          aria-label="Action"
          onClick={() => setIsEditMode(!isEditMode)}
        >
          <Icon size="lg">
            <TimesIcon />
          </Icon>
        </Button>
      );
    }
    return baseVariableActions;
  };

  return (
    <Tabs
      isFilled
      activeKey={activeTabKey}
      onSelect={(event, tabIndex) => setActiveTabKey(tabIndex)}
      isBox
      aria-label="Tabs in the filled with icons example"
      role="region"
    >
      <Tab
        eventKey={0}
        title={
          <>
            <TabTitleIcon>
              <CodeIcon />
            </TabTitleIcon>{' '}
            <TabTitleText>Base variable</TabTitleText>{' '}
          </>
        }
        aria-label="filled tabs with icons content users"
      >
        <Card ouiaId="BasicCard" isFullHeight>
          <CardHeader
            actions={{
              actions: headerActions(),
            }}
          />
          {ansibleVariable !== undefined && (
            <CardBody>
              <Form isHorizontal>
                <FormGroup label="Variable name">
                  <TextInputEditable
                    isEditable={isEditMode}
                    value={ansibleVariable.name}
                    setValue={(_event, value) => {
                      setAnsibleVariable({
                        ...ansibleVariable,
                        name: value,
                      });
                    }}
                  />
                </FormGroup>
                <FormGroup
                  label="Variable type"
                  labelIcon={
                    <Popover
                      headerContent={<div>Variable type</div>}
                      bodyContent={<div>Bla bla regarding type checking</div>}
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
                  <ToggleGroup
                    aria-label="Default with single selectable"
                    areAllGroupsDisabled={!isEditMode}
                  >
                    {variableTypes.map(variableType => (
                      <ToggleGroupItem
                        text={
                          variableType.charAt(0).toUpperCase() +
                          variableType.slice(1)
                        }
                        buttonId="toggle-group-single-1"
                        isSelected={ansibleVariable.type === variableType}
                        onChange={() =>
                          setAnsibleVariable({
                            ...ansibleVariable,
                            type: variableType,
                          })
                        }
                      />
                    ))}
                  </ToggleGroup>
                </FormGroup>
                <FormGroup label="Default value">
                  {valueAdapter(ansibleVariable)}
                </FormGroup>
              </Form>
            </CardBody>
          )}
        </Card>
      </Tab>
      <Tab
        eventKey={1}
        title={
          <>
            <TabTitleIcon>
              <CodeBranchIcon />
            </TabTitleIcon>{' '}
            <TabTitleText>Overrides</TabTitleText>
          </>
        }
      >
        <OverridesTabContent
          variable={originalVariable}
          refreshRequest={refreshRequest}
        />
      </Tab>
    </Tabs>
  );
};
