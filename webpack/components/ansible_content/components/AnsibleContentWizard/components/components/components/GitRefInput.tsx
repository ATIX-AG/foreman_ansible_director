import React, { Dispatch, FormEvent, SetStateAction } from 'react';
import {
  Button,
  Chip,
  ChipGroup,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';

import { translate as _ } from 'foremanReact/common/I18n';

interface VersionInputProps {
  gitRefs: Array<string>;
  setGitRefs: Dispatch<SetStateAction<Array<string>>>;
}
export const GitRefInput: React.FC<VersionInputProps> = ({
  gitRefs,
  setGitRefs,
}) => {
  const [refInput, setRefInput] = React.useState<string>('');
  const [refInputValidation, setRefInputValidation] = React.useState<
    ValidatedOptions
  >(ValidatedOptions.default);

  const handleGitRefAdd = (): void => {
    const references: Array<string> = refInput.split(',').map(i => i.trim());

    setGitRefs(oldRefs => [...oldRefs, ...references]);
  };

  const handleGitRefInput = (
    _event: FormEvent<HTMLInputElement>,
    value: string
  ): void => {
    let validationState = ValidatedOptions.success;

    if (!new RegExp('^[a-zA-Z0-9\\-_.]*(, [a-zA-Z0-9\\-_.]+)*$').test(value)) {
      validationState = ValidatedOptions.error;
    }

    setRefInputValidation(validationState);
    setRefInput(value);
  };

  return (
    <FormGroup label={_('References')}>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            validated={refInputValidation}
            value={refInput}
            onChange={handleGitRefInput}
            onKeyDown={event =>
              event.key === 'Enter' &&
              refInputValidation === ValidatedOptions.success
                ? handleGitRefAdd()
                : null
            }
            id="cu-source-input-01"
            data-testid="git-ref-input"
            type="text"
            aria-label="content unit source input"
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            onClick={handleGitRefAdd}
            data-testid="add-git-ref-btn"
          >
            <PlusIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
      {refInputValidation === ValidatedOptions.error && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              {'Ref list does not conform to the pattern: "<Ref>, <Ref>"'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      <ChipGroup categoryName="Only import: " numChips={10}>
        {gitRefs.map(unitVersion => (
          <Chip
            key={unitVersion}
            onClick={() =>
              setGitRefs(oldVersions =>
                oldVersions.filter(v => v !== unitVersion)
              )
            }
          >
            {unitVersion}
          </Chip>
        ))}
      </ChipGroup>
    </FormGroup>
  );
};
