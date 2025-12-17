import React, { Dispatch, SetStateAction } from 'react';
import {
  ActionGroup,
  Button,
  Chip,
  ChipGroup,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Popover,
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';
import CodeIcon from '@patternfly/react-icons/dist/esm/icons/code-icon';
import TagIcon from '@patternfly/react-icons/dist/esm/icons/tag-icon';
import styles from '@patternfly/react-styles/css/components/Form/form';
import { AnsibleGitContentUnitCreate } from '../../../../../../types/AnsibleContentTypes';
import { AnsibleContentUnitCreateType } from '../../AnsibleContentWizard';
import { GitRefInput } from './components/GitRefInput';

interface GitContentUnitInputProps {
  contentUnits: Array<AnsibleContentUnitCreateType>;
  setContentUnits: Dispatch<
    SetStateAction<Array<AnsibleContentUnitCreateType>>
  >;
}

type refTabKeys = 'branch' | 'tag' | 'commit';

export const GitContentUnitInput: React.FunctionComponent<GitContentUnitInputProps> = ({
  contentUnits,
  setContentUnits,
}) => {
  const [repoUrl, setRepoUrl] = React.useState<string>('');
  const [repoUrlValidation, setRepoUrlValidation] = React.useState<
    ValidatedOptions
  >(ValidatedOptions.default);

  const [
    contentUnitValidationHelperText,
    setContentUnitValidationHelperText,
  ] = React.useState<string>('');

  const [contentUnitVersions, setContentUnitVersions] = React.useState<
    Array<string>
  >([]);

  const [unitType, setUnitType] = React.useState<'collection' | 'role'>(
    'collection'
  );

  // TODO: Implement repo inspect
  // eslint-disable-next-line no-unused-vars
  const [manualInputOnly, setManualInputOnly] = React.useState(true);

  const [activeRefTab, setActiveRefTab] = React.useState<refTabKeys>('commit');

  const [gitRefs, setGitRefs] = React.useState<string[]>([]);

  // TODO: Do I still need this
  // eslint-disable-next-line no-unused-vars
  const handleUnitTypeChange = (
    _event: React.FormEvent<HTMLInputElement>
  ): void => {
    if (unitType === 'collection') {
      setUnitType('role');
    } else {
      setUnitType('collection');
    }
  };

  const handleRepoUrlChange = (
    _event: React.FormEvent<HTMLInputElement>,
    name: string
  ): void => {
    let helperText: string;
    let validationState: ValidatedOptions;

    if (name === '') {
      helperText = `${
        unitType === 'collection' ? 'Collection' : 'Role'
      } repo URL may not be empty!`;
      validationState = ValidatedOptions.error;
    } else if (!new RegExp('^.*\\.git$').test(name)) {
      helperText = `${
        unitType === 'collection' ? 'Collection' : 'Role'
      } repo URL does not match /^.*\\.git$/!`;
      validationState = ValidatedOptions.error;
    } else {
      validationState = ValidatedOptions.success;
      helperText = '';
    }

    setRepoUrl(name);
    setRepoUrlValidation(validationState);
    setContentUnitValidationHelperText(helperText);
  };

  const addToBatch = (_event: never): void => {
    const unit: AnsibleGitContentUnitCreate = {
      type: unitType,
      identifier: 'nextcloud.admin',
      gitUrl: repoUrl,
      gitRefs,
    };
    setRepoUrl('');
    setRepoUrlValidation(ValidatedOptions.default);
    setContentUnitValidationHelperText('');
    setContentUnitVersions([]);
    setContentUnits(oldUnits => [...oldUnits, unit]);
  };

  return (
    <Form>
      {/* <FormGroup */}
      {/*  role="radiogroup" */}
      {/*  fieldId="basic-form-radio-group" */}
      {/*  label="Unit type" */}
      {/*  isInline */}
      {/* > */}
      {/*  <Radio */}
      {/*    isChecked={unitType === 'collection'} */}
      {/*    name="collection-radio" */}
      {/*    onChange={handleUnitTypeChange} */}
      {/*    label="Collection" */}
      {/*    id="collection-radio-01" */}
      {/*  /> */}
      {/*  <Radio */}
      {/*    isChecked={unitType === 'role'} */}
      {/*    name="role-radio" */}
      {/*    onChange={handleUnitTypeChange} */}
      {/*    label="Role" */}
      {/*    id="role-radio-01" */}
      {/*  /> */}
      {/* </FormGroup> */}
      <FormGroup
        label="Repository URL"
        isRequired
        fieldId="content-unit-form-01"
        labelIcon={
          <Popover
            alertSeverityVariant="info"
            headerContent={
              <div>
                The URL of the git repository containing the Ansible{' '}
                {unitType === 'collection' ? 'Collection' : 'Role'}.
              </div>
            }
            bodyContent={<div />}
          >
            <button
              type="button"
              aria-label="More info for repo url field"
              onClick={e => e.preventDefault()}
              aria-describedby="content-unit-identifier-field-01"
              className={styles.formGroupLabelHelp}
            >
              <HelpIcon />
            </button>
          </Popover>
        }
      >
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              isRequired
              type="text"
              id="content-unit-id-input-01"
              value={repoUrl}
              onChange={handleRepoUrlChange}
              validated={repoUrlValidation}
            />
            {repoUrlValidation === ValidatedOptions.error && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    {contentUnitValidationHelperText}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </InputGroupItem>
          <InputGroupItem>
            <Button
              variant="control"
              aria-label="inspect repository"
              onClick={() => {}}
            >
              Inspect repository
            </Button>
          </InputGroupItem>
        </InputGroup>
      </FormGroup>
      <FormGroup
        label="Git reference"
        isRequired
        fieldId="git-ref-form-01"
        labelIcon={
          <Popover
            alertSeverityVariant="info"
            headerContent={
              <div>
                A valid git branch/tag/commit pointing to an object in the
                specified repository.
              </div>
            }
            bodyContent={<div />}
          >
            <button
              type="button"
              aria-label="More info for git ref field"
              onClick={e => e.preventDefault()}
              aria-describedby="git-ref-field-01"
              className={styles.formGroupLabelHelp}
            >
              <HelpIcon />
            </button>
          </Popover>
        }
      >
        <Tabs
          isFilled
          activeKey={activeRefTab}
          onSelect={(_event, eventKey) =>
            setActiveRefTab(eventKey as refTabKeys)
          }
          role="region"
        >
          <Tab
            eventKey={'commit' as refTabKeys}
            title={
              <>
                <TabTitleIcon>
                  <CodeIcon />
                </TabTitleIcon>{' '}
                <TabTitleText>Commit / Manual input</TabTitleText>{' '}
              </>
            }
            aria-label="filled tabs with icons content users"
          >
            Users
          </Tab>
          <Tab
            eventKey={'branch' as refTabKeys}
            isDisabled={manualInputOnly}
            title={
              <>
                <TabTitleIcon>
                  <CodeBranchIcon />
                </TabTitleIcon>{' '}
                <TabTitleText>Branch</TabTitleText>{' '}
              </>
            }
          >
            Containers
          </Tab>
          <Tab
            eventKey={'tag' as refTabKeys}
            isDisabled={manualInputOnly}
            title={
              <>
                <TabTitleIcon>
                  <TagIcon />
                </TabTitleIcon>{' '}
                <TabTitleText>Tag</TabTitleText>{' '}
              </>
            }
          >
            Database
          </Tab>
        </Tabs>
      </FormGroup>

      <GitRefInput gitRefs={gitRefs} setGitRefs={setGitRefs} />

      <ChipGroup categoryName="Only import: " numChips={10}>
        {contentUnitVersions.map(unitVersion => (
          <Chip
            key={unitVersion}
            onClick={() =>
              setContentUnitVersions(oldVersions =>
                oldVersions.filter(v => v !== unitVersion)
              )
            }
          >
            {unitVersion}
          </Chip>
        ))}
      </ChipGroup>

      <ActionGroup>
        <Button
          isDisabled={repoUrlValidation !== ValidatedOptions.success}
          variant="primary"
          icon={<PlusIcon />}
          ouiaId="PrimaryWithIcon"
          onClick={addToBatch}
        >
          {`Add ${unitType === 'collection' ? 'Collection' : 'Role'} to batch`}{' '}
        </Button>{' '}
      </ActionGroup>
    </Form>
  );
};
