import React, { ReactElement } from 'react';
import {
  Button,
  DragDrop,
  Draggable,
  DraggableItemPosition,
  Droppable,
  Flex,
  FlexItem,
  Icon,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  List,
  ListItem, Panel, PanelMain, PanelMainBody,
  TextInput,
} from '@patternfly/react-core';

import GripVerticalIcon from '@patternfly/react-icons/dist/esm/icons/grip-vertical-icon';
import { TimesIcon } from '@patternfly/react-icons';
import OutlinedPlusSquareIcon from '@patternfly/react-icons/dist/esm/icons/outlined-plus-square-icon';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';

interface ArrayAdapterProps {
  isEditMode: boolean;
  value: string[];
  onChange: (value: string[]) => void;
}

const reorder = (list: string[], startIndex: number, endIndex: number): string[] => {
  const result = list;
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const ArrayAdapter = ({ value, onChange }: ArrayAdapterProps): ReactElement => {

  const [activeSeparatorIdx, setActiveSeparatorIdx] = React.useState<number | null>(null);
  const [areDividersVisible, setAreDividersVisible] = React.useState<boolean>(true);
  const [insertIdx, setInsertIdx] = React.useState<number | null>(null);
  const [insertValue, setInsertvalue] = React.useState<string>('');

  const onDrop = (source: DraggableItemPosition, dest?: DraggableItemPosition): boolean => {
    setAreDividersVisible(true);
    if (dest) {
      const newItems = reorder(value, source.index, dest.index);
      onChange(newItems);

      return true;
    }
    return false;
  };

  const removeAtIndex = (index: number): string[] => {
    return value.filter((_, idx) => idx !== index);
  };

  const updateAtIndex = (index: number, newValue: string): string[] => {
    return value.map((value, idx) => idx === index ? newValue : value);
  };

  const insertAtIndex = (index: number, valueToInsert: string): string[] => {
    return [...value.slice(0, index), valueToInsert, ...value.slice(index)];
  };

  const separator = (idx: number): ReactElement => {

    if (insertIdx !== null && insertIdx === idx) {
      return (
        <InputGroup style={{ padding: '0.75rem 0 0.75rem 0' }}>
          <InputGroupItem isFill>
            <TextInput
              value={insertValue}
              onChange={(_, value) => setInsertvalue(value)}
              id="textInput-with-dropdown"
              aria-label="input with dropdown and button"
              placeholder={`Insert value at index ${idx}`}
            />
          </InputGroupItem>
          <InputGroupItem>
            <Button
              id="inputDropdownButton1"
              variant="control"
              onClick={() => {
                onChange(insertAtIndex(idx, insertValue));
                setInsertIdx(null);
                setInsertvalue('');
              }}
            >
              <CheckIcon />
            </Button>
          </InputGroupItem>
          <InputGroupItem>
            <Button id="inputDropdownButton1" variant="control" onClick={() => setInsertIdx(null)}>
              <TimesIcon />
            </Button>
          </InputGroupItem>
        </InputGroup>
      );
    }

    return (
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        columnGap={{ default: 'columnGapXs' }}
        style={activeSeparatorIdx === idx ? {
          // 100% (column width) + 2x gap between icons and rule + 2x icon size
          width: 'calc(100% + (var(--pf-v5-global--icon--FontSize--sm) * 2) + (var(--pf-v5-l-flex--ColumnGap) * 2))',
          // Shift the thing to the left by half the value added above to center it.
          marginLeft: 'calc((((var(--pf-v5-global--icon--FontSize--sm) * 2) + (var(--pf-v5-l-flex--ColumnGap) * 2)) / 2) * -1)',
        } : { minHeight: '1.5rem' }}
        onMouseEnter={() => setActiveSeparatorIdx(idx)}
        onMouseLeave={() => setActiveSeparatorIdx(null)}
        onClick={() => setInsertIdx(idx)}
      >
        <>
          {activeSeparatorIdx === idx && (
            <FlexItem>
              <Icon size={'sm'}>
                <OutlinedPlusSquareIcon color={'var(--pf-v5-global--primary-color--100)'} />
              </Icon>
            </FlexItem>
          )}
          <FlexItem grow={{ default: 'grow' }}>
            <hr
              style={{
                marginTop: 5,
                marginBottom: 5,
                marginLeft: 0,
                marginRight: 0,
                padding: 0,
                height: 5,
                backgroundColor: activeSeparatorIdx === idx
                  ? 'var(--pf-v5-global--primary-color--100)'
                  : 'var(--pf-v5-global--disabled-color--200)',
                border: 0,
              }}
            />
          </FlexItem>
          {activeSeparatorIdx === idx && (
            <FlexItem>
              <Icon size={'sm'}>
                <OutlinedPlusSquareIcon color={'var(--pf-v5-global--primary-color--100)'} />
              </Icon>
            </FlexItem>
          )}
        </>
      </Flex>
    );
  };

  return (
    <Panel isScrollable>
      <PanelMain tabIndex={0}>
        <PanelMainBody>
          <DragDrop
            onDrop={onDrop}
            onDrag={() => {
              setAreDividersVisible(false);
              return true;
            }}
          >
            <List isPlain style={{ width: '100%' }}>
              <Droppable>
                {value.map((itm, idx) => {
                  return (
                    <>
                      {areDividersVisible && idx === 0 && (separator(idx))}
                      <Draggable key={idx}>
                        <ListItem>
                          <InputGroup>
                            <InputGroupText>
                              <Icon style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                                <GripVerticalIcon />
                              </Icon>
                            </InputGroupText>
                            <InputGroupItem isFill>
                              <TextInput
                                value={itm}
                                onChange={(_, value) => onChange(updateAtIndex(idx, value))}
                                id="textInput-with-dropdown"
                                aria-label="input with dropdown and button"
                              />
                            </InputGroupItem>
                            <InputGroupItem>
                              <Button
                                id="inputDropdownButton1"
                                variant="control"
                                onClick={() => onChange(removeAtIndex(idx))}
                              >
                                <TimesIcon />
                              </Button>
                            </InputGroupItem>
                          </InputGroup>
                        </ListItem>
                      </Draggable>
                      {areDividersVisible && idx < value.length && (separator(idx + 1))}
                    </>
                  );
                })}
              </Droppable>
            </List>
          </DragDrop>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};
