import React, { ReactElement, ReactHTMLElement } from 'react';
import {
  ExpandableSection,
  Level,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextContent,
  TextVariants,
  Text,
  Icon, Badge,
  ListItem,
} from '@patternfly/react-core';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { AnsibleContentUnit } from '../../../../types/AnsibleContentTypes';
import { ActiveVersionBadge } from './ActiveVersionBadge';
import { ContentUnitVersionList } from './ContentUnitVersionList';
import { SelectionMapWorkingObject } from '../ContentUnitVersionPickerModal';
import { RevertButton } from '../../RevertButton';

interface ContentUnitRowProps {
  contentUnit: AnsibleContentUnit;
  selectedContent: Record<number, SelectionMapWorkingObject | undefined>;
  onVersionSelect: (cuId: number, cuvId: number) => void;
  onClear: (cuId: number) => void;
  onRevertClick: () => void;
}

export const ContentUnitRow = ({
  contentUnit,
  selectedContent,
  onVersionSelect,
  onClear,
  onRevertClick,
}: ContentUnitRowProps): ReactElement => {
  const [isVersionExpandOpen, setIsVersionExpandOpen] = React.useState<boolean>(false);

  const workingObject = React.useMemo(() => {
    return selectedContent[contentUnit.id];
  }, [contentUnit.id, selectedContent]);

  const activeVersion = React.useMemo(() => {
    return contentUnit.versions.find(v => {
      // During the first render pass, the parent has not yet set the selectionMap state.
      // Object access above will return undefined and this will break
      if (workingObject !== undefined) {
        return workingObject.cuv_id === v.id;
      }
      return false;
    });
  }, [contentUnit.versions, workingObject]);

  return (
    <ListItem>
      <Stack>
        <StackItem>
          <Split>
            <SplitItem>
              <TextContent>
                <Text component={TextVariants.h3}>
                  <Icon isInline>
                    {contentUnit.type === 'role' ? <CubeIcon /> : <CubesIcon />}
                  </Icon>
                  {` ${contentUnit.identifier}`}
                </Text>
              </TextContent>
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem>
              <Split>
                {
                  workingObject !== undefined && workingObject.changed && (
                    <SplitItem>
                      <RevertButton onRevertClick={onRevertClick} />
                    </SplitItem>
                  )
                }
                <SplitItem isFilled style={{ width: 'var(--pf-v5-global--spacer--sm)' }} />
                <SplitItem>
                  <TextContent>
                    <Text component={TextVariants.h3}>{_('Active version:')}</Text>
                  </TextContent>
                </SplitItem>
                <SplitItem isFilled style={{ width: 'var(--pf-v5-global--spacer--sm)' }} />
                <SplitItem>
                  <ActiveVersionBadge
                    activeVersion={activeVersion !== undefined ? activeVersion.version : null}
                    onClear={() => onClear(contentUnit.id)}
                  />
                </SplitItem>
              </Split>
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem>
          <ExpandableSection
            toggleText={_('Versions')}
            onToggle={(_event, isExpanded) => setIsVersionExpandOpen(isExpanded)}
            isExpanded={isVersionExpandOpen}
          >
            <ContentUnitVersionList
              contentUnitVersions={contentUnit.versions}
              selectedVersionId={workingObject !== undefined ? workingObject.cuv_id : null}
              onVersionSelect={versionId => onVersionSelect(contentUnit.id, versionId)}
            />
          </ExpandableSection>
        </StackItem>
      </Stack>
    </ListItem>
  );

};
