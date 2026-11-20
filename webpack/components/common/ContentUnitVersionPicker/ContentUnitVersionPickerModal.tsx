import React, { ReactElement } from 'react';
import {
  Bullseye,
  Button,
  EmptyState, EmptyStateActions, EmptyStateBody, EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon, EmptyStateVariant,
  Modal, ModalVariant,
  Spinner, Stack, StackItem,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';
import { useHybridSearch } from '../../../helpers/hooks/useHybridSearch';
import { AnsibleContentUnit } from '../../../types/AnsibleContentTypes';
import { ContentUnitVersionPicker } from './ContentUnitVersionPicker';
import { HybridSearchInput } from '../HybridSearchInput';

interface ContentUnitVersionPickerModalProps {
  isOpen: boolean;
  selectedContent: Record<string, number>;
  title: string;
  onSubmit: (cuvIds: number[]) => void;
  onClose: () => void;
  onAbort: () => void;
  isSubmitLoading: boolean;
}

export interface SelectionMapWorkingObject {
  cuv_id: number | null;
  changed: boolean;
  original_value: number | null;
}

export const ContentUnitVersionPickerModal = ({
  isOpen,
  selectedContent,
  title,
  onSubmit,
  onClose,
  onAbort,
  isSubmitLoading,
} : ContentUnitVersionPickerModalProps): ReactElement => {

  const [contentUnitSearchValue, setContentUnitSearchValue] = React.useState<string>('');

  const [selectionMap, setSelectionMap] = React.useState<Record<string, SelectionMapWorkingObject>>(
    (() => {
      const workingObjectsMap: Record<string, SelectionMapWorkingObject> = {};
      Object.keys(selectedContent).forEach(key => {
        workingObjectsMap[key] = {
          cuv_id: selectedContent[key],
          changed: false,
          original_value: selectedContent[key],
        };
      });
      return workingObjectsMap;
    })()
  );

  const contentUnitRequest = useHybridSearch<AnsibleContentUnit, AnsibleContentUnit>({
    url: '/api/v2/ansible_director/ansible_content',
    localSearchFn: (items, term) => items.filter(acu => acu.identifier.includes(term)),
    transformationFn: items => items,
    debounce: true,
    search: contentUnitSearchValue,
  });

  const handleVersionChange = (cuId: number, cuvId: number | null): void => {
    setSelectionMap(prevState => (
      {
        ...prevState,
        [cuId]: {
          cuv_id: cuvId,
          // TODO: Sloppy, evaluate this once
          changed: (prevState[cuId] !== undefined ? prevState[cuId].original_value : null) !== cuvId,
          // if prevState[cuId] === undefined, the CU was not previously assigned.
          original_value: prevState[cuId] !== undefined ? prevState[cuId].original_value : null,
        } satisfies SelectionMapWorkingObject,
      }
    ));
  };

  const handleRevert = (cuId: number): void => {
    setSelectionMap(prevState => (
      {
        ...prevState,
        [cuId]: {
          cuv_id: prevState[cuId].original_value,
          changed: false,
          original_value: prevState[cuId].original_value,
        } satisfies SelectionMapWorkingObject,
      }
    ));
  };

  const modalContent = (): ReactElement => {

    if (contentUnitRequest.status === 'ERROR') {
      // TODO: Handle
    }
    else if (contentUnitRequest.status === 'RESOLVED') {
      if (contentUnitRequest.options.length > 0) {
        return (
          <ContentUnitVersionPicker
            availableContentUnits={contentUnitRequest.options}
            selectedContent={selectionMap}
            onVersionSelect={handleVersionChange}
            onVersionClear={cuId => handleVersionChange(cuId, null)}
            onRevertClick={cuId => handleRevert(cuId)}
          />
        ); }
      return (
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.xl}>
            <EmptyStateHeader
              headingLevel="h4"
              titleText={_('No Ansible content')}
              icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
            />
            <EmptyStateBody>
              {contentUnitRequest.total > 0
                ? _('Foreman did not find any Ansible content matching the filter criteria.')
                : _('This organization does not contain any Ansible content.')}
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button
                  variant="primary"
                  onClick={() => {
                    { contentUnitRequest.total > 0
                      ? setContentUnitSearchValue('')
                      : window.open('/ansible/content'); }
                  }}
                  icon={contentUnitRequest.total > 0 ? undefined : <ExternalLinkSquareAltIcon />}
                >
                  {contentUnitRequest.total > 0
                    ? _('Reset filter')
                    : _('Import Ansible content')}
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </Bullseye>
      );
    }
    return (
      <Bullseye>
        <EmptyState>
          <EmptyStateHeader
            titleText={_('Loading Ansible content...')}
            headingLevel="h4"
            icon={<EmptyStateIcon icon={Spinner} />}
          />
        </EmptyState>
      </Bullseye>
    );
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      onEscapePress={onAbort}
      actions={[
        <Button
          key="assign"
          variant="primary"
          isLoading={isSubmitLoading}
          onClick={() => {
            const assignedCuvIds: number[] = [];
            Object.values(selectionMap).forEach(wo => {
              const cuvId = wo.cuv_id;
              if (cuvId !== null) assignedCuvIds.push(cuvId);
            });
            onSubmit(assignedCuvIds);
          }}
        >
          {_('Submit')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onAbort}>
          {_('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <HybridSearchInput
            hybridSearchResult={contentUnitRequest}
            placeholder={_('Filter by identifier')}
            searchValue={contentUnitSearchValue}
            onSearchValueChange={setContentUnitSearchValue}
          />
        </StackItem>
        <StackItem style={{ height: '60vh' }}>
          {modalContent()}
        </StackItem>
      </Stack>
    </Modal>
  );
};
