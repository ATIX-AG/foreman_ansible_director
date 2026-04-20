import React, { Dispatch, SetStateAction } from 'react';
import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import UndoIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { AnsibleGalaxyContentUnitCreate } from '../../../../../../types/AnsibleContentTypes';
import { VersionInput } from './components/VersionInput';
import { AnsibleContentUnitCreateType } from '../../AnsibleContentWizard';
import { useAdContext } from '../../../../../common/AdContextWrapper';
import { IdentifierInput } from './components/IdentifierInput';

interface GalaxyContentUnitInputProps {
  contentUnits: Array<AnsibleContentUnitCreateType>;
  setContentUnits: Dispatch<
    SetStateAction<Array<AnsibleContentUnitCreateType>>
  >;
}

export const GalaxyContentUnitInput: React.FunctionComponent<GalaxyContentUnitInputProps> = ({
  contentUnits,
  setContentUnits,
}) => {
  const ctx = useAdContext();

  const defaultGalaxy: string =
    ctx.settings.ansible_director_default_galaxy_url;

  const [contentUnitName, setContentUnitName] = React.useState<string>('');
  const [contentUnitValidation, setContentUnitValidation] = React.useState<
    ValidatedOptions
  >(ValidatedOptions.default);

  const [contentUnitSource, setContentUnitSource] = React.useState(
    defaultGalaxy
  );

  const [
    contentUnitSourceValidation,
    setContentUnitSourceValidation,
  ] = React.useState<ValidatedOptions>(ValidatedOptions.success);

  const [contentUnitVersions, setContentUnitVersions] = React.useState<
    Array<string>
  >([]);

  const [unitType, setUnitType] = React.useState<'collection' | 'role'>(
    'collection'
  );

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

  const handleUnitSourceChange = (
    _event: React.FormEvent<HTMLInputElement>,
    sourceUrl: string
  ): void => {
    const validSource = new RegExp('^https?:\\/\\/.*\\/$').test(sourceUrl);

    setContentUnitSourceValidation(
      validSource ? ValidatedOptions.success : ValidatedOptions.error
    );
    setContentUnitSource(sourceUrl);
  };

  const addToBatch = (_event: never): void => {
    const unit: AnsibleGalaxyContentUnitCreate = {
      type: unitType,
      identifier: contentUnitName,
      source: contentUnitSource,
      versions: contentUnitVersions.map(versionString => ({
        version: versionString,
      })),
    };
    setContentUnitName('');
    setContentUnitValidation(ValidatedOptions.default);
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
      <IdentifierInput
        identifier={contentUnitName}
        setIdentifier={setContentUnitName}
        unitType={unitType}
        contentUnits={contentUnits}
        identifierValidation={contentUnitValidation}
        setIdentifierValidation={setContentUnitValidation}
      />
      <FormGroup label={_('Source')} fieldId="cu-source-01">
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              value={contentUnitSource}
              onChange={handleUnitSourceChange}
              id="cu-source-input-01"
              type="text"
              aria-label={_('content unit source input')}
              validated={contentUnitSourceValidation}
            />
          </InputGroupItem>
          <InputGroupItem>
            <Button
              variant="control"
              aria-label={_('popover for input')}
              onClick={
                () => {
                  setContentUnitSource(defaultGalaxy);
                  setContentUnitSourceValidation(ValidatedOptions.success);
                } // TODO: Global parameter
              }
            >
              <UndoIcon />
            </Button>
          </InputGroupItem>
        </InputGroup>
        {contentUnitSourceValidation === ValidatedOptions.error && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{`${
                unitType === 'collection' ? 'Collection' : 'Role'
              } source does not match /^https?:\\/\\/.*\\/$/!`}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
      {unitType === 'collection' && (
        <VersionInput
          contentUnitVersions={contentUnitVersions}
          setContentUnitVersions={setContentUnitVersions}
        />
      )}
      <ActionGroup>
        <Button
          isDisabled={
            contentUnitValidation !== ValidatedOptions.success ||
            contentUnitSourceValidation !== ValidatedOptions.success
          }
          variant="primary"
          icon={<PlusIcon />}
          ouiaId="PrimaryWithIcon"
          onClick={addToBatch}
        >
          {__(_('Add Ansible %(uType)s to batch'), {
            uType: unitType,
          })}
        </Button>{' '}
      </ActionGroup>
    </Form>
  );
};
