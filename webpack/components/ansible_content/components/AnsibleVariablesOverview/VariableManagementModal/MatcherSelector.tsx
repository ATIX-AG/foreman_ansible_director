import React, {
  ReactElement,
  useEffect,
} from 'react';
import {
  Button,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

interface MatcherSelectorProps {
  matcherOptions: SelectOptionProps[];
  matcherValue: string; // Because lookup_keys validate existence of a matcher value, this should never make trouble
  setMatcherValue: (matcherValue: string) => void;
}

export const MatcherSelector = ({
  matcherOptions,
  matcherValue,
  setMatcherValue,
}: MatcherSelectorProps): ReactElement => {
  const [
    isMatcherValueSelectOpen,
    setIsMatcherValueSelectOpen,
  ] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [filterValue, setFilterValue] = React.useState<string>('');

  const [selectOptions, setSelectOptions] = React.useState<SelectOptionProps[]>(
    matcherOptions
  );
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(
    null
  );
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);

  const textInputRef = React.useRef<HTMLInputElement>();

  const NO_RESULTS = 'no results';

  useEffect(() => {
    setInputValue(matcherValue);
  }, [matcherValue]);

  React.useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = matcherOptions;

    if (filterValue) {
      newSelectOptions = matcherOptions.filter(menuItem =>
        String(menuItem.children)
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );

      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isAriaDisabled: true,
            children: `No results found for "${filterValue}"`,
            value: NO_RESULTS,
          },
        ];
      }

      if (!isMatcherValueSelectOpen) {
        setIsMatcherValueSelectOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
  }, [filterValue]);

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

  const selectOption = (
    value: string | number,
    content: string | number
  ): void => {
    setInputValue(String(content));
    setFilterValue('');
    setMatcherValue(String(value));
    closeMenu();
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ): void => {
    if (value && value !== NO_RESULTS) {
      const optionText = selectOptions.find(option => option.value === value)
        ?.children;
      selectOption(value, optionText as string);
    }
  };

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ): void => {
    setInputValue(value);
    setFilterValue(value);

    setFocusedItemIndex(null);
    setActiveItemId(null);

    if (value !== matcherValue) {
      setMatcherValue('');
    }
  };

  const onToggleClick = (): void => {
    setIsMatcherValueSelectOpen(!isMatcherValueSelectOpen);
    if (textInputRef?.current) {
      textInputRef.current.focus();
    }
  };

  const onClearButtonClick = (): void => {
    setMatcherValue('');
    setInputValue('');
    setFilterValue('');
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
      aria-label="Typeahead menu toggle"
      onClick={onToggleClick}
      isExpanded={isMatcherValueSelectOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder="Select a matcher value"
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
            aria-label="Clear input value"
          >
            <TimesIcon aria-hidden />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <>
      <Select
        id="typeahead-select"
        isOpen={isMatcherValueSelectOpen}
        selected={matcherValue}
        onSelect={onSelect}
        onOpenChange={isOpen => {
          !isOpen && closeMenu();
        }}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList id="select-typeahead-listbox">
          {selectOptions.map((option, index) => (
            <SelectOption
              key={option.value || option.children}
              isFocused={focusedItemIndex === index}
              className={option.className}
              id={`select-typeahead-${option.value}`}
              {...option}
              ref={null}
            />
          ))}
        </SelectList>
      </Select>
    </>
  );
};
