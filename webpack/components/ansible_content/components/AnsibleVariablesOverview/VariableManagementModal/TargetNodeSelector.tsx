import React, { ReactElement, useEffect } from 'react';
import {
  Button,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { useHybridSearch } from '../../../../../helpers/hooks/useHybridSearch';
import { Host, HostGroup } from '../../../../../types/common';
import { ContentResolutionNodeType } from '../../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUiString } from '../../../../common/AnsibleContentAssignment/helpers';

interface TargetNodeSelectorProps {
  selectedNode: { id: number; name: string; type: 'host' | 'hostgroup' } | null;
  onNodeSelect: (selectedItem: { id: number; name: string; type: 'host' | 'hostgroup' } | null) => void;
  nodeType: ContentResolutionNodeType;
}

const urlMap: Record<ContentResolutionNodeType, string> = {
  Host: '/api/v2/hosts',
  Hostgroup: '/api/v2/hostgroups',
};

type ApiResponseMap = {
  Host: Host;
  Hostgroup: HostGroup;
};

export const TargetNodeSelector = ({
  selectedNode,
  onNodeSelect,
  nodeType,
}: TargetNodeSelectorProps): ReactElement | null => {
  const [
    isMatcherValueSelectOpen,
    setIsMatcherValueSelectOpen,
  ] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');

  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(
    null
  );
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);

  useEffect(() => {
    selectedNode !== null && (setInputValue(selectedNode?.name));
  }, [selectedNode]);

  const matcherRequest = useHybridSearch<
    ApiResponseMap[typeof nodeType],
    SelectOptionProps
  >({
    url: urlMap[nodeType],
    localSearchFn: (items, term) => {
      switch (nodeType) {
        case 'Host':
          return (items as Host[]).filter(i => i.name.includes(term));
        case 'Hostgroup':
          return (items as HostGroup[]).filter(i => i.title.includes(term));
        default:
          return [];
      }
    },
    transformationFn: items => {
      switch (nodeType) {
        case 'Host':
          return (items as Host[]).map(matcher => ({
            value: matcher.id,
            children: matcher.name,
          }));
        case 'Hostgroup':
          return (items as HostGroup[]).map(matcher => ({
            value: matcher.id,
            children: matcher.title,
          }));
        default:
          return [];
      }
    },
    debounce: true,
    search: inputValue,
  });

  const textInputRef = React.useRef<HTMLInputElement>(null);

  const closeMenu = (): void => {
    setIsMatcherValueSelectOpen(false);
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const onInputClick = (): void => {
    if (!isMatcherValueSelectOpen) {
      setIsMatcherValueSelectOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  };

  const onToggleClick = (): void => {
    setIsMatcherValueSelectOpen(!isMatcherValueSelectOpen);
    if (textInputRef?.current) {
      textInputRef.current.focus();
    }
  };

  const onClearButtonClick = (): void => {
    onNodeSelect(null);
    setInputValue('');
    setFocusedItemIndex(null);
    setActiveItemId(null);
    if (textInputRef?.current) {
      textInputRef.current.focus();
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label={_('Typeahead matcher select toggle')}
      onClick={onToggleClick}
      isExpanded={isMatcherValueSelectOpen}
      isFullWidth
      isDisabled={matcherRequest.status === 'PENDING'}
      badge={
        matcherRequest.status === 'PENDING' && (
          <Spinner
            style={{ margin: 'auto' }}
            isInline
            size="md"
            aria-label={_('API loading')}
          />
        )
      }
    >
      <TextInputGroup
        isPlain
        onKeyDown={event => {
          if (event.key === 'Enter') {
            matcherRequest.triggerApiSearch();
          }
        }}
      >
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={(_event, v) => {
            setInputValue(v);
          }}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={_(`Select a ${crnTypeUiString[nodeType]}`)}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          role="combobox"
          isExpanded={isMatcherValueSelectOpen}
          aria-controls="select-typeahead-listbox"
        />

        <TextInputGroupUtilities
          {...(!inputValue ? { style: { display: 'none' } } : {})}
        >
          <Button
            variant="plain"
            onClick={onClearButtonClick}
            aria-label={_('Clear input value')}
          >
            <TimesIcon aria-hidden />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  if (matcherRequest.status === 'ERROR') {
    // TOOD: Handle error
  } else if (
    matcherRequest.status === 'RESOLVED' ||
    matcherRequest.status === 'PENDING'
  ) {
    let renderOptions = [...matcherRequest.options];

    if (matcherRequest.options.length === 0) {
      renderOptions = [
        {
          isAriaDisabled: true,
          children: __('No results found for "%(inputValue)s"', { inputValue }),
          value: 'no_results',
        },
      ];
    } else if (matcherRequest.overflow) {
      renderOptions.push({
        isAriaDisabled: true,
        children: __(
          '%(overflowCount)s results are hidden due to the search cache size limit (%(effectiveCacheSize)s). Increase this limit in the settings or refine your search.',
          {
            overflowCount: matcherRequest.overflowCount,
            effectiveCacheSize: matcherRequest.effectiveCacheSize,
          }
        ),
        value: 'overflow',
      });
    }

    const onSelect = (
      _event: React.MouseEvent<Element, MouseEvent> | undefined,
      value: string | number | undefined
    ): void => {
      value && selectOption(value as number);
    };

    const selectOption = (value: number): void => {
      const selected = renderOptions.find(option => option.value === value)?.children as string;
      setInputValue(selected);
      onNodeSelect({
        id: value,
        type: nodeType === 'Host' ? 'host' : 'hostgroup',
        name: renderOptions.find(option => option.value === value)?.children as string,
      });
      closeMenu();
    };

    return (
      <>
        <Select
          id="typeahead-select"
          isOpen={isMatcherValueSelectOpen}
          selected={selectedNode}
          onSelect={onSelect}
          onOpenChange={isOpen => {
            !isOpen && closeMenu();
          }}
          toggle={toggle}
          isScrollable
          maxMenuHeight="25vh"
        >
          <SelectList id="select-typeahead-listbox">
            {renderOptions.map((option, index) => (
              <SelectOption
                key={option.value}
                isFocused={focusedItemIndex === index}
                className={option.className}
                id={`select-typeahead-${option.value}`}
                {...option}
              />
            ))}
          </SelectList>
        </Select>
      </>
    );
  }
  return null;
};
