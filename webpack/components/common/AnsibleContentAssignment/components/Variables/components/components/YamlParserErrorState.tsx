import React, { ReactElement } from 'react';
import {
  Button,
  EmptyState, EmptyStateActions,
  EmptyStateBody, EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import OutlinedDizzyIcon from '@patternfly/react-icons/dist/esm/icons/outlined-dizzy-icon';
import global_danger_color_100 from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
interface YamlParserErrorStateProps {
  onInspectClick: () => void;
}

export const YamlParserErrorState = ({ onInspectClick }: YamlParserErrorStateProps): ReactElement => {

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('YAML parsing error')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={OutlinedDizzyIcon} color={global_danger_color_100.var} />}
      />
      <EmptyStateBody>
        An error occurred trying to render the value. Ensure the value is valid YAML.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant="primary"
            onClick={onInspectClick}
          >Inspect</Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
