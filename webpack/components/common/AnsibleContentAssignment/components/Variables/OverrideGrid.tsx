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
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { MergedOverrideCard } from './MergedOverrideCard';
import { ContentResolutionNodeType } from '../../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUiString } from '../../helpers';

interface OverrideGridProps {
  overrides: MergedVariableOverride[];
  matcherName: string;
  matcherType: string;
  crnType: ContentResolutionNodeType;
  onUpdated: () => void;
}

export const OverrideGrid = ({
  overrides,
  matcherName,
  matcherType,
  crnType,
  onUpdated,
}: OverrideGridProps): ReactElement => (
  <div style={{ padding: '20px' }}>
    {overrides.length > 0 ? (
      <Gallery hasGutter>
        {overrides.map(mergedOverride => (
          <GridItem
            key={`${mergedOverride.variable_id}-${mergedOverride.override_id}`}
          >
            <MergedOverrideCard
              mergedOverride={mergedOverride}
              matcherName={matcherName}
              matcherType={matcherType}
              crnType={crnType}
              onUpdated={onUpdated}
            />
          </GridItem>
        ))}
      </Gallery>
    ) : (
      <EmptyState variant={EmptyStateVariant.xl}>
        <EmptyStateHeader
          headingLevel="h4"
          titleText={__(_('No variable overrides for this %(crnType)s'), {
            crnType: crnTypeUiString[crnType],
          })}
          icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
        />
        <EmptyStateBody>
          {__(
            _(
              'This %(crnType)s has no variable overrides configured. Default values declared in content will be used.'
            ),
            { crnType: crnTypeUiString[crnType] }
          )}
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="link"
              onClick={() => window.open('/ansible/content')}
            >
              {_('Manage variable overrides')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    )}
  </div>
);
