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
        titleText={_('Type mismatch')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={OutlinedDizzyIcon} color={global_warning_color_100.var} />}
      />
      <EmptyStateBody>
        {_('The YAML you entered is valid but does not match the type of this item.')}
        <List isPlain>
          <ListItem>{_(`Expected: ${dataTypeDisplayNameMap[expectedType]}`)}</ListItem>
          <ListItem>{_(`Got: ${parsedType}`)}</ListItem>
        </List>
      </EmptyStateBody>
    </EmptyState>
  );
};
