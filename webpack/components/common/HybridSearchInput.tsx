import React, { ReactElement } from 'react';
import {
  Button,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Spinner,
  Label,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import { SearchIcon } from '@patternfly/react-icons';
import { UseHybridSearchResult } from '../../helpers/hooks/useHybridSearch';

interface HybridSearchInputProps {
  hybridSearchResult: UseHybridSearchResult<unknown>;
  placeholder?: string;
  searchValue: string;
  onSearchValueChange: (searchValue: string) => void;
}

export const HybridSearchInput = ({
  hybridSearchResult,
  placeholder,
  searchValue,
  onSearchValueChange,
}: HybridSearchInputProps): ReactElement => {

  return (
    <TextInputGroup
      isDisabled={hybridSearchResult.status === 'PENDING'}
    >
      <TextInputGroupMain
        icon={<SearchIcon />}
        placeholder={placeholder}
        value={searchValue}
        onChange={(_, value) => onSearchValueChange(value)}
      />
      <TextInputGroupUtilities>
        {hybridSearchResult.status === 'PENDING' && (
          <Spinner isInline aria-label="Spinner in hybrid search input" />
        )}
        {searchValue !== '' && (
          <Button
            variant="plain"
            onClick={() => onSearchValueChange('')}
            aria-label="Clear button and input"
            // Because of custom Foreman CSS, the text input's height is lower than the button, causing the UI to shift
            // when this button is shown.
            style={{
              paddingTop: '0px',
              paddingBottom: '0px',
            }}
          >
            <TimesIcon />
          </Button>
        )}
        {hybridSearchResult.status === 'RESOLVED' && (
          <Label variant={'outline'} isCompact>
            {
              hybridSearchResult.overflow
                ? `${hybridSearchResult.effectiveCacheSize} / ${hybridSearchResult.total}`
                : `${hybridSearchResult.options.length} / ${hybridSearchResult.total}`
            }
          </Label>
        )}
      </TextInputGroupUtilities>
    </TextInputGroup>
  );
};
