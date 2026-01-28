import React, { ReactElement } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Gallery,
  GridItem,
} from '@patternfly/react-core';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
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
    {overrides.length > 0 ? (
      <Gallery hasGutter>
        {overrides.map(mergedOverride => (
          <GridItem>
            <MergedOverrideCard mergedOverride={mergedOverride} fqdn={fqdn} />
          </GridItem>
        ))}
      </Gallery>
    ) : (
      <EmptyState variant={EmptyStateVariant.xl}>
        <EmptyStateHeader
          headingLevel="h4"
          titleText="No variable overrides for this host"
          icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
        />
        <EmptyStateBody>
          This host has no variable overrides configured. Default values
          declared in content will be used.
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="link"
              onClick={() => window.open('/ansible/content')}
            >
              Manage variable overrides
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    )}
  </div>
);
