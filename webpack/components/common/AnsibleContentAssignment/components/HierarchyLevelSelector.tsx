import React, { ReactElement } from 'react';
import { Breadcrumb, BreadcrumbItem, Label } from '@patternfly/react-core';

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import {
  ContentResolutionNode,
  ContentResolutionNodeType,
} from '../../../../types/AnsibleContentAssignmentTypes';

import { equalsCrn } from '../../../../helpers/comparisons';
import { crColorHierarchy, crnTypeUiString } from '../helpers';

interface HierarchyLevelSelectorProps {
  hierarchy: ContentResolutionNode[];
  hierarchyIconMap: Record<ContentResolutionNodeType, ReactElement>;
  selected: ContentResolutionNode;
  onSelect: (crn: ContentResolutionNode) => void;
}

export const HierarchyLevelSelector = ({
  hierarchy,
  hierarchyIconMap,
  onSelect,
  selected,
}: HierarchyLevelSelectorProps): ReactElement => (
  <Breadcrumb
    ouiaId="BasicBreadcrumb"
    // This is filthy, but an existing override adds 10px margin-bottom to this component
    style={{ marginTop: '10px' }}
  >
    {hierarchy.map((crn, index) => (
      <BreadcrumbItem key={index}>
        <Label
          variant={equalsCrn(selected, crn) ? 'filled' : 'outline'}
          color={crColorHierarchy[index % crColorHierarchy.length]}
          onClick={() => onSelect(crn)}
          icon={hierarchyIconMap[crn.type]}
        >
          {hierarchy.indexOf(crn) === hierarchy.length - 1 // indexOf(target) is always the last
            ? __(_('This %(crnType)s'), { crnType: crnTypeUiString[crn.type] })
            : crn.name}
        </Label>
      </BreadcrumbItem>
    ))}
  </Breadcrumb>
);
