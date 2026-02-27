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
  GalleryItem,
  Panel,
  PanelMain,
  PanelMainBody,
} from '@patternfly/react-core';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';

import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
} from 'react';
import {
  APIOptions,
  PaginationProps,
} from 'foremanReact/common/hooks/API/APIHooks';
import Pagination from 'foremanReact/components/Pagination';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import SearchBar from 'foremanReact/components/SearchBar';

import { ExecutionEnvCard } from './components/ExecutionEnvCard';
import { GetAnsibleExecutionEnvResponse } from './components/ExecutionEnvGridWrapper';
import { ExecutionEnvCreateCard } from './components/ExecutionEnvCreateCard';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../types/AnsibleExecutionEnvTypes';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';

interface ExecutionEnvGridProps {
  apiResponse: GetAnsibleExecutionEnvResponse;
  setAPIOptions: Dispatch<SetStateAction<APIOptions>>;
  onPagination: (newPagination: PaginationProps) => void;
  search: string;
  onSearch: (search: string) => void;
  setConfirmationModalMode: Dispatch<SetStateAction<'destroy' | 'update'>>;
  setIsConfirmationModalOpen: Dispatch<SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<SetStateAction<string>>;
  selectedEnv: AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined;
  setSelectedEnv: Dispatch<
    SetStateAction<AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined>
  >;
  createEnvAction: (env: AnsibleExecutionEnvCreate) => Promise<void>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const ExecutionEnvGrid: React.FC<ExecutionEnvGridProps> = ({
  apiResponse,
  setAPIOptions,
  onPagination,
  search,
  onSearch,
  setConfirmationModalMode,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  selectedEnv,
  setSelectedEnv,
  createEnvAction,
  setIsContentUnitModalOpen,
}) => {
  const [executionEnvironments, setExecutionEnvironments] = React.useState<
    Array<AnsibleExecutionEnv>
  >();
  const [totalItemsCount, setTotalItemsCount] = React.useState<number>();
  const [showCreateCard, setShowCreateCard] = React.useState<boolean>(false);

  const userCanCreate = usePermissions([
    AdPermissions.executionEnvironments.create,
  ]);

  useEffect(() => {
    setExecutionEnvironments(apiResponse.results);
    setTotalItemsCount(apiResponse.total);
  }, [apiResponse]);

  const destroyEnv = (env: AnsibleExecutionEnv): void => {
    setConfirmationModalTitle(`Confirm deletion of ${env?.name}`);
    setConfirmationModalBody(`Are you sure you want to destroy ${env?.name}?`);
    setConfirmationModalMode('destroy');
    setIsConfirmationModalOpen(true);
  };

  const updateEnv = (env: AnsibleExecutionEnv): void => {
    setConfirmationModalTitle(`Confirm update of ${env?.name}`);
    setConfirmationModalBody(
      `Are you sure you want to update ${env?.name}? This will require a rebuild of the associated image.`
    );
    setConfirmationModalMode('update');
    setIsConfirmationModalOpen(true);
  };

  const grid = (content: ReactElement | ReactElement[]): ReactElement => (
    <div style={{ padding: '15px' }}>
      <Gallery
        hasGutter
        minWidths={{
          default: '100%',
          md: '100px',
          xl: '500px',
        }}
        maxWidths={{
          md: '300px',
          xl: '1fr',
        }}
      >
        {content}
      </Gallery>
    </div>
  );

  const createCard = (createModeOverride: boolean = false): ReactElement => (
    <ExecutionEnvCreateCard
      createEnvAction={createEnvAction}
      setIsContentUnitModalOpen={setIsContentUnitModalOpen}
      setSelectedEnv={setSelectedEnv}
      createModeOverride={createModeOverride}
    />
  );
  const gridContent = (): ReactElement | ReactElement[] | null => {
    if (executionEnvironments && executionEnvironments.length > 0) {
      return grid([
        ...(userCanCreate ? [createCard()] : []),
        ...executionEnvironments.map(ee => (
          <GalleryItem key={ee.id}>
            <ExecutionEnvCard
              executionEnv={ee}
              handleDestroy={destroyEnv}
              handleUpdate={updateEnv}
              setSelectedEnv={setSelectedEnv}
              setIsContentUnitModalOpen={setIsContentUnitModalOpen}
            />
          </GalleryItem>
        )),
      ]);
    }

    if (showCreateCard) {
      return grid([createCard(true)]);
    }

    return (
      <EmptyState variant={EmptyStateVariant.xl}>
        <EmptyStateHeader
          headingLevel="h4"
          titleText="No execution environments"
          icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
        />
        <EmptyStateBody>
          No execution environments found in this organization
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="primary"
              onClick={() => {
                setShowCreateCard(true);
              }}
            >
              Create execution environment
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  };

  return (
    <>
      <Panel>
        <PanelMain>
          <PanelMainBody style={{ width: '50%' }}>
            <SearchBar
              data={{
                autocomplete: {
                  id: 'name',
                  url:
                    '/api/v2/ansible_director/execution_environments/auto_complete_search',
                  searchQuery: search,
                },
              }}
              onSearch={onSearch}
              name="ad_ee"
            />
          </PanelMainBody>
        </PanelMain>
      </Panel>

      {gridContent()}
      {totalItemsCount !== undefined && totalItemsCount > 0 && (
        <Pagination itemCount={totalItemsCount} onChange={onPagination} />
      )}
    </>
  );
};
