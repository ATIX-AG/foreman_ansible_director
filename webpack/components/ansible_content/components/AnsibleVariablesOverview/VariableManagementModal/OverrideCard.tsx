import React, { ReactElement } from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Icon,
  Label,
  Popover,
} from '@patternfly/react-core';

import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';

import {
  AnsibleVariableDetail,
  AnsibleVariableOverride,
} from '../../../../../types/AnsibleVariableTypes';
import { StringAdapter } from './ValueAdapters/StringAdapter';
import { BooleanAdapter } from './ValueAdapters/BooleanAdapter';
import { IntegerAdapter } from './ValueAdapters/IntegerAdapter';
import { RealAdapter } from './ValueAdapters/RealAdapter';
import { YamlAdapter } from './ValueAdapters/YamlAdapter';

interface OverrideCardProps {
  override: AnsibleVariableOverride;
  variable: AnsibleVariableDetail;
  onClick: () => void;
}

const matcherNames: Record<AnsibleVariableOverride['matcher'], string> = {
  fqdn: 'FQDN',
  hostgroup: 'Hostgroup',
};

const matcherUrls: { [key: string]: string } = {
  fqdn: '/new/hosts',
  hostgroup: '/hostgroups',
};

export const OverrideCard = ({
  override,
  variable,
  onClick,
}: OverrideCardProps): ReactElement => {
  const valueAdapter = (): ReactElement | null => {
    switch (variable.type) {
      case 'string':
        return (
          <StringAdapter
            isEditMode={false}
            value={override.value as string}
            onChange={() => {}}
          />
        );
      case 'boolean':
        return (
          <BooleanAdapter
            isEditMode={false}
            value={override.value as boolean}
            onChange={() => {}}
          />
        );
      case 'integer':
        return (
          <IntegerAdapter
            isEditMode={false}
            value={override.value as number}
            onChange={() => {}}
          />
        );
      case 'real':
        return (
          <RealAdapter
            isEditMode={false}
            value={override.value as number}
            onChange={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card isCompact isClickable>
      <CardHeader
        selectableActions={{
          onClickAction: onClick,
          selectableActionId: `${override.id}-edit`,
        }}
      >
        <Label color="blue" isCompact>
          {matcherNames[override.matcher]}
        </Label>
      </CardHeader>
      <CardTitle>
        <Button
          variant="link"
          isInline
          component="span"
          onClick={() => {
            window.open(`${override.matcher}/${override.matcher_value}`);
          }}
        >
          {override.matcher_value}
        </Button>
      </CardTitle>
      {variable.type !== 'yaml' && (
        <CardBody>
          <Bullseye>{valueAdapter()}</Bullseye>
        </CardBody>
      )}
    </Card>
  );
};
