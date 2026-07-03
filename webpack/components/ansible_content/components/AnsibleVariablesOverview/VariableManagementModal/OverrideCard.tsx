import React, { ReactElement } from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Label,
  Tooltip,
} from '@patternfly/react-core';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import { translate as _ } from 'foremanReact/common/I18n';

import {
  AnsibleVariableDetail,
  AnsibleVariableOverride,
} from '../../../../../types/AnsibleVariableTypes';
import { StringAdapter } from './ValueAdapters/StringAdapter';
import { BooleanAdapter } from './ValueAdapters/BooleanAdapter';
import { IntegerAdapter } from './ValueAdapters/IntegerAdapter';
import { RealAdapter } from './ValueAdapters/RealAdapter';

interface OverrideCardProps {
  override: AnsibleVariableOverride;
  variable: AnsibleVariableDetail;
  onClick: () => void;
  onDelete: () => void;
}

const matcherNames: Record<AnsibleVariableOverride['matcher'], string> = {
  fqdn: 'FQDN',
  hostgroup: 'Hostgroup',
};

const matcherUrls: Record<AnsibleVariableOverride['matcher'], string> = {
  fqdn: '/new/hosts',
  hostgroup: '/hostgroups',
};

export const OverrideCard = ({
  override,
  variable,
  onClick,
  onDelete,
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
    <Card isCompact>
      <CardHeader
        actions={{
          actions: (
            <>
              <Tooltip content={_('Edit')}>
                <Button
                  variant="plain"
                  aria-label={_('Edit override')}
                  onClick={onClick}
                >
                  <EditIcon />
                </Button>
              </Tooltip>
              <Tooltip content={_('Delete')}>
                <Button
                  variant="plain"
                  aria-label={_('Delete override')}
                  onClick={onDelete}
                >
                  <TrashIcon />
                </Button>
              </Tooltip>
            </>
          ),
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
            window.open(
              `${matcherUrls[override.matcher]}?search=title++%3D++${
                override.matcher_value
              }`
            );
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
