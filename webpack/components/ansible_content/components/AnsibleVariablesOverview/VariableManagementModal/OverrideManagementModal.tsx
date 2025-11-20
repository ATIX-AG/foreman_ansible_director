/* eslint-disable max-lines */
import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
} from 'react';
import {
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
  Switch,
  TextInput,
  Button,
  Popover,
  MenuToggleElement,
  MenuToggle,
  Dropdown,
} from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { IndexResponse, useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import {
  AnsibleVariableDetail,
  AnsibleVariableOverride,
  AnsibleVariableOverrideCreate,
} from '../../../../../types/AnsibleVariableTypes';
import { MatcherSelector } from './MatcherSelector';
import { StringAdapter } from './ValueAdapters/StringAdapter';
import { BooleanAdapter } from './ValueAdapters/BooleanAdapter';
import { IntegerAdapter } from './ValueAdapters/IntegerAdapter';
import { RealAdapter } from './ValueAdapters/RealAdapter';
import { YamlAdapter } from './ValueAdapters/YamlAdapter';

interface OverrideManagementModalProps {
  variable: AnsibleVariableDetail;
  override: AnsibleVariableOverride | AnsibleVariableOverrideCreate;
  onSave: () => void;
  setSelectedOverride: Dispatch<
    SetStateAction<
      AnsibleVariableOverride | AnsibleVariableOverrideCreate | undefined
    >
  >;
  setOverrideMatcher: Dispatch<
    SetStateAction<AnsibleVariableOverride['matcher']>
  >;
  setOverrideValue: Dispatch<SetStateAction<string | boolean | number>>;
  setOverrideMatcherValue: Dispatch<SetStateAction<string>>;
  overrideMatcher: AnsibleVariableOverride['matcher'];
  overrideValue: string | boolean | number;
  overrideMatcherValue: string;
}

interface HostGroupsResponse extends IndexResponse {
  results: { id: string; name: string }[];
}
interface HostsResponse extends IndexResponse {
  results: { id: string; name: string }[];
}

const matcherNames: Record<AnsibleVariableOverride['matcher'], string> = {
  fqdn: 'FQDN',
  hostgroup: 'Hostgroup',
};

const matcherTypes: AnsibleVariableOverride['matcher'][] = [
  'fqdn',
  'hostgroup',
];

const urlMap: Record<AnsibleVariableOverride['matcher'], string> = {
  fqdn: '/api/v2/hosts',
  hostgroup: '/api/v2/hostgroups',
};

type ApiResponseMap = {
  fqdn: HostsResponse;
  hostgroup: HostGroupsResponse;
};

export const OverrideManagementModal = ({
  variable,
  override,
  onSave,
  setSelectedOverride,
  setOverrideMatcher,
  setOverrideValue,
  setOverrideMatcherValue,
  overrideMatcher,
  overrideMatcherValue,
  overrideValue,
}: OverrideManagementModalProps): ReactElement => {
  const [isConfirmLoading, setIsConfirmLoading] = React.useState<boolean>(
    false
  );

  const [isSimpleMatcherCreation, setIsSimpleMatcherCreation] = React.useState<
    boolean
  >(true);

  const matcherRequest = useAPI<ApiResponseMap[typeof overrideMatcher]>( // TODO: Ideally, this request should not fire if isSimpleMatcherCreation is false
    'get',
    urlMap[overrideMatcher]
  );

  useEffect(() => {
    setOverrideMatcher(override.matcher);
    setOverrideValue(override.value);
    setOverrideMatcherValue(override.matcher_value);
  }, [override, setOverrideMatcher, setOverrideMatcherValue, setOverrideValue]);

  const valueAdapter = (): ReactElement | null => {
    const onChange = <T extends boolean | string | number>(
      newValue: T
    ): void => {
      setOverrideValue(newValue as T);
    };

    switch (variable.type) {
      case 'string':
        return (
          <StringAdapter
            isEditMode
            value={overrideValue as string}
            onChange={onChange}
          />
        );
      case 'boolean':
        return (
          <BooleanAdapter
            isEditMode
            value={overrideValue as boolean}
            onChange={onChange}
          />
        );
      case 'integer':
        return (
          <IntegerAdapter
            isEditMode
            value={overrideValue as number}
            onChange={onChange}
          />
        );
      case 'real':
        return (
          <RealAdapter
            isEditMode
            value={overrideValue as number}
            onChange={onChange}
          />
        );
      case 'yaml':
        return (
          <YamlAdapter
            isEditMode
            value={String(overrideValue) as string}
            onChange={onChange}
          />
        );
      default:
        return null;
    }
  };

  if (matcherRequest.status === 'ERROR') {
    // TODO: Handle request error
  }

  return (
    <>
      <Modal
        title="Edit override"
        style={{ minHeight: '400px' }}
        isOpen
        onClose={() => setSelectedOverride(undefined)}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              setIsConfirmLoading(true);
              onSave();
              setIsConfirmLoading(false);
            }}
            isLoading={isConfirmLoading}
          >
            Confirm
          </Button>,
          <Button
            key="cancel"
            variant="link"
            onClick={() => setSelectedOverride(undefined)}
          >
            Cancel
          </Button>,
        ]}
        ouiaId="BasicModal"
        variant={ModalVariant.large}
      >
        <Form isHorizontal>
          <Split hasGutter>
            <SplitItem>
              <FormGroup fieldId="override-name" isRequired>
                <Switch
                  label="Custom Matcher Creation"
                  labelOff="Simple Matcher Creation"
                  id="checked-with-label-switch-on"
                  isChecked={isSimpleMatcherCreation}
                  hasCheckIcon
                  onChange={() =>
                    setIsSimpleMatcherCreation(!isSimpleMatcherCreation)
                  }
                />
                <Popover
                  aria-label="Basic popover"
                  headerContent={<div>Matcher creation type</div>}
                  bodyContent={
                    <div>
                      <strong>Simple matcher creation</strong> mode allows you
                      to set a matcher and its type from a dropdown, while{' '}
                      <strong>custom matcher creation</strong> mode allows you
                      to set a matcher and its type manually. Custom matcher
                      creation mode is useful when you want to set a matcher
                      that uses advanced functionality like regular expressions.
                    </div>
                  }
                >
                  <Button variant="plain" aria-label="Action" isInline>
                    <OutlinedQuestionCircleIcon />
                  </Button>
                </Popover>
              </FormGroup>
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem span={4}>
              <FormGroup label="Type" fieldId="override-name">
                <Dropdown
                  isOpen={false}
                  onSelect={(_event, value) => {}}
                  onOpenChange={(isOpen: boolean) => {}}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      isDisabled
                      ref={toggleRef}
                      isFullWidth
                      onClick={() => {}}
                      isExpanded={false}
                    >
                      {variable.type.charAt(0).toUpperCase() +
                        variable.type.slice(1)}
                    </MenuToggle>
                  )}
                />
              </FormGroup>
            </SplitItem>
          </Split>
          {isSimpleMatcherCreation ? (
            <>
              <FormGroup label="Matcher type">
                <FormSelect
                  value={overrideMatcher}
                  onChange={(event, value) => {
                    setOverrideMatcher(
                      value as AnsibleVariableOverride['matcher']
                    );
                    setOverrideMatcherValue('');
                  }}
                  id="horizontal-form-title"
                  name="horizontal-form-title"
                  aria-label="Your title"
                >
                  {matcherTypes.map((option, index) => (
                    <FormSelectOption
                      key={index}
                      value={option}
                      label={matcherNames[option]}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
              <FormGroup label="Matcher value">
                {matcherRequest.status === 'RESOLVED' && (
                  <MatcherSelector
                    matcherOptions={matcherRequest.response.results.map(
                      matcher => ({
                        value: matcher.name,
                        children: matcher.name,
                      })
                    )}
                    matcherValue={overrideMatcherValue}
                    setMatcherValue={setOverrideMatcherValue}
                  />
                )}
              </FormGroup>
            </>
          ) : (
            <>
              <FormGroup label="Matcher type" fieldId="matcher-type" isRequired>
                <TextInput
                  value={overrideMatcher}
                  id="age-1"
                  aria-describedby="age-1-helper"
                  onChange={
                    (_event, value) =>
                      setOverrideMatcher(
                        value as AnsibleVariableOverride['matcher']
                      ) // TODO: This is, at best, a hack. AnsibleVariableOverride[matcher] should extend string at some point
                  }
                  placeholder={`One of ${matcherTypes.join(', ')}`}
                />
              </FormGroup>
              <FormGroup
                label="Matcher value"
                fieldId="matcher-value"
                isRequired
              >
                <TextInput
                  value={overrideMatcherValue}
                  id="age-1"
                  aria-describedby="age-1-helper"
                  onChange={(_event, value) => setOverrideMatcherValue(value)}
                />
              </FormGroup>
            </>
          )}
          <FormGroup
            label={
              <>
                Override value
                <br />
                {`(variable type: ${variable.type})`}
              </>
            }
          >
            {valueAdapter()}
          </FormGroup>
        </Form>
      </Modal>
    </>
  );
};
