import React, { ReactElement } from 'react';
import { EmptyState, EmptyStateBody, EmptyStateHeader, EmptyStateIcon, List, ListItem } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import OutlinedDizzyIcon from '@patternfly/react-icons/dist/esm/icons/outlined-dizzy-icon';
import global_warning_color_100 from '@patternfly/react-tokens/dist/esm/global_warning_color_100';
import { AnsibleVariableDataType, AnsibleVariableParsedType } from '../../../../../../../types/AnsibleVariableTypes';
import { dataTypeDisplayNameMap } from '../../utils';

interface YamlParsedTypeMismatchErrorStateProps {
  parsedType: AnsibleVariableParsedType;
  expectedType: AnsibleVariableDataType;
}

export const YamlParsedTypeMismatchErrorState = ({
  parsedType,
  expectedType,
}: YamlParsedTypeMismatchErrorStateProps): ReactElement => {

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Parsed type mismatch')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={OutlinedDizzyIcon} color={global_warning_color_100.var} />}
      />
      <EmptyStateBody>
        The YAML you entered is valid but does not match this items type.
        <List isPlain>
          <ListItem>{`Expected: ${dataTypeDisplayNameMap[expectedType]}`}</ListItem>
          <ListItem>{`Got: ${parsedType}`}</ListItem>
        </List>
      </EmptyStateBody>
    </EmptyState>
  );
};
