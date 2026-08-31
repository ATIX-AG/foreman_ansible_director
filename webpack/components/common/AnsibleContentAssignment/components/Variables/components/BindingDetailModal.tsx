import React, { CSSProperties, ReactElement, useContext, useMemo } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Label,
  LabelGroup,
  Modal,
  ModalVariant,
  Stack,
  Tab,
  Tabs,
} from '@patternfly/react-core';
import GlobeEuropeIcon from '@patternfly/react-icons/dist/esm/icons/globe-europe-icon';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';

import GlobeAsiaIcon from '@patternfly/react-icons/dist/esm/icons/globe-asia-icon';
import GlobeAfricaIcon from '@patternfly/react-icons/dist/esm/icons/globe-africa-icon';
import GlobeAmericasIcon from '@patternfly/react-icons/dist/esm/icons/globe-americas-icon';
import GlobeIcon from '@patternfly/react-icons/dist/esm/icons/globe-icon';
import UndoIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import {
  AnsibleVariable, AnsibleVariableBinding,
  AnsibleVariableDataType,
} from '../../../../../../types/AnsibleVariableTypes';
import { HierarchicalBinding } from './BindingDetailModalWrapper';
import { crColorHierarchy, crnTypeUiString } from '../../../helpers';
import { hierarchyIconMap } from '../../../AnsibleContentAssignment';
import { VariableContext } from '../VariableContext';
import { pfLabelColorType } from '../../../../../../types/common';
import { ContentResolutionNode } from '../../../../../../types/AnsibleContentAssignmentTypes';
import { ValueCardWrapper } from './components/ValueCardWrapper';
import { getYamlValidity, YamlValidity } from '../utils';

interface BindingDetailModal {
  variable: AnsibleVariable;
  hierarchicalBindings: HierarchicalBinding[];
  onClose: () => void;
  onConfirmSuccess: () => void;
}

interface BindingDetailTabProps {

  // Must be a number since this is used to calculate the CRN color
  eventKey: number;
  variant: 'binding';
  crn: ContentResolutionNode;
  hierarchicalBindingCount: number;
  item: HierarchicalBinding;
  isTargetNode: boolean;
  draftType: AnsibleVariableDataType;
  draftValue: string;
  onDraftTypeChange: (type: AnsibleVariableDataType) => void;
  onDraftValueChange: (value: string) => void;
}

interface VariableDetailTabProps {
  eventKey: number;
  variant: 'variable';
  crn?: never;
  hierarchicalBindingCount?: never;
  item: AnsibleVariable;
  isTargetNode?: false;
  draftType: AnsibleVariableDataType;
  draftValue: string;
  onDraftTypeChange: (type: AnsibleVariableDataType) => void;
  onDraftValueChange: (value: string) => void;
}

export type ItemDetailTabProps = (BindingDetailTabProps | VariableDetailTabProps);

type TabKey = string;
export type VariableOperations = 'editVariable' | null;
export type BindingOperations = 'editBinding' | 'createBinding' | null;

interface VariableDraftUpdate extends BaseDraftUpdate {
  operation: VariableOperations;
}

interface BindingDraftUpdate extends BaseDraftUpdate {
  operation: BindingOperations;
}

interface BaseDraftUpdate {
  type: AnsibleVariableDataType;
  value: string;
}

type DraftUpdate = BaseDraftUpdate & (VariableDraftUpdate | BindingDraftUpdate);

export interface TabDraftBinding {
  type: AnsibleVariableDataType;
  value: string;
  operation: 'editBinding' | 'createBinding' | null;
  sourceObject: AnsibleVariableBinding;
}

export interface TabDraftVariable {
  type: AnsibleVariableDataType;
  value: string;
  operation: 'editVariable' | null;
  sourceObject: AnsibleVariable;
}

export type TabDraft = TabDraftBinding | TabDraftVariable;

const getDraftKey = (variant: 'variable' | 'binding', key: number | string): TabKey =>
  variant === 'variable' ? 'variable' : `binding_${key}`;

export const BindingDetailModal = ({
  variable,
  hierarchicalBindings,
  onClose,
  onConfirmSuccess,
}: BindingDetailModal): ReactElement | null => {

  const variableCtx = useContext(VariableContext);

  if (variableCtx === null) {
    return null;
  }

  const [selectedTab, setSelectedTab] = React.useState<number>(hierarchicalBindings.length);

  type DraftState = {
    variable: TabDraftVariable;
    [key: string]: TabDraftBinding | TabDraftVariable | null;
  };

  const initialDraftState = (): DraftState => {
    const initialState: DraftState = {
      variable: {
        type: variable.data_type,
        value: variable.raw_value,
        operation: null,
        sourceObject: variable,
      },
    };

    hierarchicalBindings.forEach((hb, index) => {
      const key = getDraftKey('binding', index + 1);
      initialState[key] = hb.binding
        ? {
          type: hb.binding.data_type,
          value: hb.binding.raw_value,
          operation: null,
          sourceObject: hb.binding,
        }
        : null;
    });

    return initialState;
  };

  const [drafts, setDrafts] = React.useState<{ 'variable': TabDraft } & Record<TabKey, TabDraft | null>>(initialDraftState());

  const validities = useMemo(
    () => Object.fromEntries(
      Object.entries(drafts).map(([k, d]) => [k, d && getYamlValidity(d.value, d.type)])
    ),

    [drafts]
  ) as Record<TabKey, YamlValidity>;

  const noneInvalid = Object.values(validities).filter(v => v !== null).every(v => v.state !== 'invalid');
  const anyWarning = Object.values(validities).filter(v => v !== null).some(v => v.state === 'type_mismatch');

  const updateDraft = (key: TabKey, update: DraftUpdate): void => {
    const draft = drafts[key] as TabDraft;
    // @ts-ignore I can't be asked to deal with this.
    setDrafts(prev => ({
      ...prev,
      [key]: {
        type: update.type,
        value: update.value,
        operation: update.operation,
        sourceObject: draft.sourceObject },
    }));
  };

  const itemTab = (props: ItemDetailTabProps): ReactElement => {
    let tabIcon: ReactElement;
    let tabLabelColor: pfLabelColorType;
    let tabTitle: string;
    let changesMade: boolean = false;

    let originalType: AnsibleVariableDataType;
    let originalValue: string;

    let tabContent: ReactElement;

    const { eventKey, variant, isTargetNode } = props;
    const tabKey = getDraftKey(variant, variant === 'variable' ? 0 : eventKey);

    const draft = drafts[tabKey];

    if (variant === 'binding') {
      const { item, crn, hierarchicalBindingCount } = props;
      tabIcon = hierarchyIconMap[crn.type];
      tabLabelColor = crColorHierarchy[eventKey % crColorHierarchy.length];
      tabTitle = (() => {
        return (
          eventKey === hierarchicalBindingCount
            ? __(_('This %(crnType)s'), { crnType: crnTypeUiString[crn.type] })
            : item.content_resolution_node.name
        );
      })();
      tabContent = (
        <Stack hasGutter style={{ paddingTop: '15px', paddingBottom: '15px' }}>
          {
            item.binding !== null && draft ? ((() => {
              changesMade = item.binding.raw_value !== draft.value || item.binding.data_type !== draft.type;
              originalType = item.binding.data_type;
              originalValue = item.binding.raw_value;
              return (
                <ValueCardWrapper
                  variant="binding"
                  item={item.binding}
                  crn={crn}
                  isTargetNode={isTargetNode}
                  draftType={draft.type}
                  draftValue={draft.value}
                  onDraftTypeChange={type => updateDraft(tabKey, {
                    type: type,
                    value: draft.value,
                    operation: item.binding!.data_type === type ? null : 'editBinding',
                  })}
                  onDraftValueChange={value => updateDraft(tabKey, {
                    type: draft.type,
                    value: value,
                    operation: item.binding!.raw_value === value ? null : 'editBinding',
                  })}
                />
              );
            })()) : (
              <EmptyState>
                <EmptyStateHeader
                  titleText={_('Variable not bound to this node.')}
                  headingLevel="h4"
                  icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
                />
              </EmptyState>
            )
          }
        </Stack>
      );
    } else {

      const { item } = props;

      // Small easter-egg ;)
      tabIcon = (() => {
        let timezone: string = '';
        try {
          timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
          // Fall back to generic
        }

        if (timezone.startsWith('Europe')) {
          return <GlobeEuropeIcon />;
        } else if (timezone.startsWith('Asia')) {
          return <GlobeAsiaIcon />;
        } else if (timezone.startsWith('Africa')) {
          return <GlobeAfricaIcon />;
        } else if (timezone.startsWith('America')) {
          return <GlobeAmericasIcon />;
        } else {
          return <GlobeIcon />;
        }
      })();
      tabLabelColor = 'grey';
      tabTitle = _('Global value');
      tabContent = (
        <Stack hasGutter style={{ paddingTop: '15px', paddingBottom: '15px' }}>
          {
            item !== null && draft ? (() => {
              changesMade = item.data_type !== draft.type || item.raw_value !== draft.value;
              originalValue = item.raw_value;
              originalType = item.data_type;
              return (
                <ValueCardWrapper
                  variant="variable"
                  item={item}
                  isTargetNode={false}
                  draftType={draft.type}
                  draftValue={draft.value}
                  onDraftTypeChange={(type: AnsibleVariableDataType) => updateDraft(tabKey, {
                    type: type,
                    value: draft.value,
                    operation: item.data_type === type ? null : 'editVariable',
                  })}
                  onDraftValueChange={(value: string) => updateDraft(tabKey, {
                    type: draft.type,
                    value: value,
                    operation: item.raw_value === value ? null : 'editVariable',
                  })}
                />
              );
            })() : (
              <EmptyState>
                <EmptyStateHeader
                  titleText={_('Variable not bound to this node.')}
                  headingLevel="h4"
                  icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
                />
              </EmptyState>
            )
          }
        </Stack>
      );
    }

    return (
      <Tab
        eventKey={eventKey}
        title={
          <>
            <LabelGroup>
              {
                validities[tabKey] && validities[tabKey]?.state !== 'valid' && (
                  validities[tabKey] && validities[tabKey]?.state === 'invalid'
                    ? (
                      <Label
                        style={{ '--pf-v5-c-label__icon--MarginRight': 0 } as CSSProperties}
                        icon={<ExclamationCircleIcon />}
                        color={'red'}
                      />
                    )
                    : (
                      <Label
                        style={{ '--pf-v5-c-label__icon--MarginRight': 0 } as CSSProperties}
                        icon={<ExclamationTriangleIcon />}
                        color={'orange'}
                      />
                    )
                )
              }
              <Label
                icon={tabIcon}
                color={tabLabelColor}
              >
                {tabTitle}
              </Label>
              {changesMade && (
                <Label
                  onClick={() => updateDraft(tabKey, {
                    type: originalType,
                    value: originalValue,
                    operation: null,
                  })}
                  icon={<UndoIcon />}
                  color={'orange'}
                >
                  Revert
                </Label>
              )}
            </LabelGroup>
          </>
        }
        aria-label="variable and binding data tabs"
      >
        {tabContent}
      </Tab>
    );
  };

  return (

    <Modal
      variant={ModalVariant.large}
      title={`Manage variable "${variable.name}"`}
      isOpen
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant={anyWarning ? 'warning' : 'primary'}
          isDisabled={!noneInvalid}
          onClick={async () => {
            await variableCtx.handleManagementConfirm(
              Object.values(drafts).filter((draft): draft is TabDraft => draft !== null && draft.operation !== null)
            );
            onConfirmSuccess();
          }}
        >
          {anyWarning ? 'Confirm (I know what I am doing)' : 'Confirm'}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={onClose}
        >
          Cancel
        </Button>,
      ]}
    >
      {/* The itemTab function does return the correct type, but patternfly does not export the TabsChild type.
      @ts-ignore */}
      <Tabs
        isBox
        isFilled
        activeKey={selectedTab}
        onSelect={(_event, eventKey) =>
          setSelectedTab(Number(eventKey))}
        role="region"
      >
        {itemTab({
          eventKey: 0,
          variant: 'variable',
          item: variable,
          draftType: drafts.variable.type,
          draftValue: drafts.variable.value,
          onDraftTypeChange: (type: AnsibleVariableDataType) => updateDraft('variable', {
            type: type,
            value: drafts.variable.value,
            operation: drafts.variable.operation,
          }),
          onDraftValueChange: (value: string) => updateDraft('variable', {
            type: drafts.variable.type,
            value: value,
            operation: drafts.variable.operation,
          }),
        })}
        {hierarchicalBindings.map((hBinding, index) =>
          itemTab({
            eventKey: index + 1,
            variant: 'binding',
            item: hBinding,
            crn: hBinding.content_resolution_node,
            hierarchicalBindingCount: hierarchicalBindings.length,
            isTargetNode: index === hierarchicalBindings.length - 1,
            draftType: drafts[getDraftKey('binding', index + 1)]?.type || hBinding.binding?.data_type || 'string',
            draftValue: drafts[getDraftKey('binding', index + 1)]?.value || hBinding.binding?.raw_value || '',
            onDraftTypeChange: (type: AnsibleVariableDataType) => {
              const key = getDraftKey('binding', index + 1);
              updateDraft(key, {
                type: type,
                value: drafts[key]?.value || '',
                operation: drafts[key]?.operation || null,
              });
            },
            onDraftValueChange: (value: string) => {
              const key = getDraftKey('binding', index + 1);
              updateDraft(key, {
                type: drafts[key]?.type || 'string',
                value: value,
                operation: drafts[key]?.operation || null,
              });
            },
          }))}
      </Tabs>
    </Modal>
  );
};
