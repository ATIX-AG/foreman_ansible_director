import React, { ReactElement } from 'react';

import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Spinner,
} from '@patternfly/react-core';

import { Taxon } from '../../../types/common';

interface TaxonSelectorProps {
  type: 'organization' | 'location';
  selected: string;
  onSelect: (taxonId: string) => void;
}

export const TaxonSelector = ({
  type,
  selected,
  onSelect,
}: TaxonSelectorProps): ReactElement => {
  const taxonResponse = useAPI<{ results: Taxon[] }>(
    'get',
    foremanUrl(`/api/v2/${type}s`)
  );

  if (taxonResponse.status === 'ERROR') {
    // TODO: Handle error
  } else if (taxonResponse.status === 'RESOLVED') {
    return (
      <FormGroup
        label={type === 'organization' ? _('Organization') : _('Location')}
        isRequired
      >
        <FormSelect
          value={selected}
          onChange={(_event, value) => {
            onSelect(value);
          }}
        >
          {[
            <FormSelectOption
              key="placeholder"
              value=""
              label={
                type === 'organization'
                  ? _('Select an organization')
                  : _('Select a location')
              }
              isPlaceholder
            />,
            ...taxonResponse.response.results.map(taxon => (
              <FormSelectOption
                key={taxon.id}
                value={taxon.id}
                label={taxon.title}
              />
            )),
          ]}
        </FormSelect>
      </FormGroup>
    );
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={__(_('Loading %(taxon)s information...'), { taxon: type })}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
