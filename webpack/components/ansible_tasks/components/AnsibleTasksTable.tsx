/* eslint-disable no-console */
import React, { ReactElement } from 'react';
import {
  Timestamp,


} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ActionsColumn,

} from '@patternfly/react-table';

import { AnsibleTask } from '../../../types/AnsibleTasksTypes';
import { TaskModal } from './components/TaskModal';

interface AnsibleTasksTableProps {
  tasks: AnsibleTask[];
}
export const AnsibleTasksTable = ({
  tasks,
}: AnsibleTasksTableProps): ReactElement => {
  const [selectedTask, setSelectedTask] = React.useState<AnsibleTask | null>(
    null
  );

  const columnNames = {
    label: 'Label',
    state: 'State',
    started_at: 'Started at',
    ended_at: 'Ended at',
  };

  const onRowClick = (task: AnsibleTask): void => {
    setSelectedTask(task);
  };

  const onModalClose = (): void => {
    setSelectedTask(null);
  };

  const getTimestamp = (time: string): ReactElement => {
    const isoString = time.replace(' ', 'T').replace(' UTC', 'Z');
    const date = new Date(isoString);

    return (
      <Timestamp
        date={date}
        shouldDisplayUTC
        timeFormat="long"
        dateFormat="long"
      />
    );
  };

  return (
    <React.Fragment>
      <Table aria-label="Actions table" isStriped>
        <Thead>
          <Tr>
            <Th>{columnNames.label}</Th>
            <Th>{columnNames.state}</Th>
            <Th>{columnNames.started_at}</Th>
            <Th>{columnNames.ended_at}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task: AnsibleTask, i) => (
            <Tr
              key={task.id}
              isSelectable
              isClickable
              onRowClick={() => onRowClick(task)}
              isRowSelected={selectedTask?.label === task.label}
            >
              <Td dataLabel={columnNames.label}>{task.label}</Td>
              <Td dataLabel={columnNames.state}>{task.state}</Td>
              <Td dataLabel={columnNames.started_at}>
                {getTimestamp(task.started_at)}
              </Td>
              <Td dataLabel={columnNames.ended_at}>
                {getTimestamp(task.ended_at)}
              </Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    {
                      title: 'Some action',
                      onClick: () => {},
                    },
                  ]}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {selectedTask && (
        <TaskModal task={selectedTask} onModalClose={onModalClose} />
      )}
    </React.Fragment>
  );
};
