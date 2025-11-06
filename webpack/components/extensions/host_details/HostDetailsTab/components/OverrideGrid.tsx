import React, { ReactElement } from 'react';
import { Gallery, GridItem } from '@patternfly/react-core';
import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { MergedOverrideCard } from './MergedOverrideCard';

interface OverrideGridProps {
  overrides: MergedVariableOverride[];
  fqdn: string;
}

export const OverrideGrid = ({
  overrides,
  fqdn,
}: OverrideGridProps): ReactElement => (
  <div style={{ padding: '20px' }}>
    <Gallery hasGutter>
      {overrides.map(mergedOverride => (
        <GridItem>
          <MergedOverrideCard mergedOverride={mergedOverride} fqdn={fqdn} />
        </GridItem>
      ))}
    </Gallery>
  </div>
);
