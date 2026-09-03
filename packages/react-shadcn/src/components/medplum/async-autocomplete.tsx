// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AsyncAutocomplete/AsyncAutocomplete.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AsyncAutocompleteTestIds } from '@/components/medplum/async-autocomplete-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { killEvent } from '@/lib/medplum/dom';
import { notify } from '@/lib/medplum/notify';
import { cn } from '@/lib/utils';
import { normalizeErrorString } from '@medplum/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { JSX, KeyboardEvent, ReactNode, SyntheticEvent } from 'react';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface AsyncAutocompleteOption<T> {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly resource: T;
}

export interface AsyncAutocompleteProps<T> {
  readonly name?: string;
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
  readonly defaultValue?: T | T[];
  readonly toOption: (item: T) => AsyncAutocompleteOption<T>;
  readonly loadOptions: (input: string, signal: AbortSignal) => Promise<T[]>;
  readonly itemComponent?: (props: AsyncAutocompleteOption<T>) => JSX.Element | ReactNode;
  readonly pillComponent?: (props: {
    item: AsyncAutocompleteOption<T>;
    disabled?: boolean;
    onRemove: () => void;
  }) => JSX.Element;
  readonly emptyComponent?: (props: { search: string }) => JSX.Element | ReactNode;
  readonly onChange: (item: T[]) => void;
  readonly onCreate?: (input: string) => T;
  readonly creatable?: boolean;
  readonly clearable?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly placeholder?: string;
  readonly leftSection?: ReactNode;
  readonly maxValues?: number;
  readonly optionsDropdownMaxHeight?: number;
  readonly minInputLength?: number; // minimum number of input characters required before executing loadOptions
  readonly disabled?: boolean;
}

export function AsyncAutocomplete<T>(props: AsyncAutocompleteProps<T>): JSX.Element {
  const {
    name,
    label,
    description,
    error,
    defaultValue,
    toOption,
    loadOptions,
    itemComponent,
    pillComponent,
    emptyComponent,
    onChange,
    onCreate,
    creatable,
    clearable,
    required,
    placeholder,
    leftSection,
    maxValues,
    optionsDropdownMaxHeight = 320,
    minInputLength = 0,
    className,
    disabled,
  } = props;
  const defaultItems = toDefaultItems(defaultValue);
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [highlightedValue, setHighlightedValue] = useState('');
  const [search, setSearch] = useState('');
  const [timer, setTimer] = useState<number>();
  const [abortController, setAbortController] = useState<AbortController>();
  const [selected, setSelected] = useState(defaultItems.map(toOption));
  const [options, setOptions] = useState<AsyncAutocompleteOption<T>[]>([]);
  const ItemComponent = itemComponent ?? DefaultItemComponent;
  const PillComponent = pillComponent ?? DefaultPillComponent;
  const EmptyComponent = emptyComponent ?? DefaultEmptyComponent;

  const searchRef = useRef(search);
  const lastLoadOptionsRef = useRef<AsyncAutocompleteProps<T>['loadOptions']>(undefined);
  const lastValueRef = useRef<string>(undefined);
  const timerRef = useRef<number>(timer);
  const abortControllerRef = useRef<AbortController>(abortController);
  const autoSubmitRef = useRef<boolean>(false);
  const selectedRef = useRef(selected);
  useLayoutEffect(() => {
    searchRef.current = search;
    timerRef.current = timer;
    abortControllerRef.current = abortController;
    selectedRef.current = selected;
  });

  const closeDropdown = useCallback((): void => {
    setOpen(false);
    setHighlightedValue('');
  }, []);

  const openDropdown = useCallback((): void => {
    setOpen(true);
    setHighlightedValue(
      options.find((option) => selectedRef.current.some((v) => v.value === option.value))?.value ?? ''
    );
  }, [options]);

  const handleValueAdd = useCallback(
    (item: AsyncAutocompleteOption<T>): void => {
      const selected = selectedRef.current;
      if (selected.some((v) => v.value === item.value)) {
        return;
      }

      // when maxValues is 0, still fire the onChange when an item is selected
      if (maxValues === 0) {
        onChange([item.resource]);
        setSelected([]);
        return;
      }

      const newSelected = [...selected, item];

      if (maxValues !== undefined) {
        while (newSelected.length > maxValues) {
          // Remove from the front
          newSelected.shift();
        }

        if (newSelected.length >= maxValues) {
          // The search input is about to be hidden now that the cap is reached; reset the dropdown
          // state so it doesn't linger with stale options and no input left to dismiss it.
          setSearch('');
          setOptions([]);
          closeDropdown();
        }
      }

      onChange(newSelected.map((v) => v.resource));
      setSelected(newSelected);
    },
    [maxValues, onChange, closeDropdown, setSearch, setOptions]
  );

  const handleTimer = useCallback((): void => {
    setTimer(undefined);

    if (searchRef.current === lastValueRef.current && loadOptions === lastLoadOptionsRef.current) {
      // Same search input and loadOptions function, move on
      return;
    }
    if ((searchRef.current?.length ?? 0) < minInputLength) {
      return;
    }

    lastValueRef.current = searchRef.current;
    lastLoadOptionsRef.current = loadOptions;

    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    loadOptions(searchRef.current ?? '', newAbortController.signal)
      .then((newValues: T[]) => {
        if (!newAbortController.signal.aborted) {
          const newOptions = newValues.map(toOption);
          setOptions(newOptions);
          if (autoSubmitRef.current) {
            if (newOptions.length > 0) {
              handleValueAdd(newOptions[0]);
            }
            autoSubmitRef.current = false;
          } else if (newValues.length > 0) {
            setOpen(true);
            setHighlightedValue(
              newOptions.find((option) => selectedRef.current.some((v) => v.value === option.value))?.value ?? ''
            );
          }
        }
      })
      .catch((err) => {
        if (!(newAbortController.signal.aborted || err.message.includes('aborted'))) {
          notify.error(normalizeErrorString(err));
        }
      })
      .finally(() => {
        if (!newAbortController.signal.aborted) {
          setAbortController(undefined);
        }
      });
  }, [loadOptions, handleValueAdd, toOption, minInputLength, setTimer, setAbortController]);

  const handleSearchChange = useCallback(
    (e: SyntheticEvent): void => {
      if ((options && options.length > 0) || creatable) {
        openDropdown();
      }

      setHighlightedValue('');
      setSearch((e.currentTarget as HTMLInputElement).value);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setAbortController(undefined);
      }

      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }

      const newTimer = window.setTimeout(() => handleTimer(), 100);
      setTimer(newTimer);
    },
    [options, creatable, handleTimer, openDropdown, setTimer, setSearch, setAbortController]
  );

  const toggleSelected = useCallback(
    (newValue: string): void => {
      const alreadySelected = selected.some((v) => v.value === newValue);
      if (alreadySelected) {
        const newSelected = selected.filter((v) => v.value !== newValue);
        onChange(newSelected.map((v) => v.resource));
        setSelected(newSelected);
      } else {
        let option = options?.find((option) => option.value === newValue);
        if (!option && creatable !== false && onCreate) {
          const createdResource = onCreate(newValue);
          option = toOption(createdResource);
        }
        if (option) {
          handleValueAdd(option);
        }
      }
    },
    [selected, onChange, handleValueAdd, onCreate, toOption, options, creatable]
  );

  const handleValueSelect = useMemo(() => {
    if (disabled) {
      return undefined;
    }

    return (val: string): void => {
      if (disabled) {
        return;
      }
      lastValueRef.current = undefined;
      if (val === '$create') {
        setSearch('');
        toggleSelected(search);
      } else {
        toggleSelected(val);
      }
    };
  }, [toggleSelected, disabled, search, setSearch]);

  const handleValueRemove = useCallback(
    (item: AsyncAutocompleteOption<T>): void => {
      const newSelected = selected.filter((v) => v.value !== item.value);
      onChange(newSelected.map((v) => v.resource));
      setSelected(newSelected);
    },
    [selected, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Enter') {
        if (timer || abortController) {
          // The user pressed enter, but we don't have results yet.
          // We need to wait for the results to come in.
          autoSubmitRef.current = true;
        } else if (highlightedValue) {
          killEvent(e);
          handleValueSelect?.(highlightedValue);
        }
      } else if (e.key === 'Backspace' && search.length === 0) {
        const lastSelected = selected[selected.length - 1];
        if (lastSelected) {
          killEvent(e);
          handleValueRemove(lastSelected);
        }
      } else if (e.key === 'Escape' || e.key === 'Tab') {
        closeDropdown();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
        killEvent(e);
        const values = options.filter((option) => !option.disabled).map((option) => option.value);
        if (creatable && search.trim().length > 0) {
          values.push('$create');
        }
        if (values.length === 0) {
          return;
        }
        setOpen(true);
        const currentIndex = values.indexOf(highlightedValue);
        if (e.key === 'Home') {
          setHighlightedValue(values[0]);
        } else if (e.key === 'End') {
          setHighlightedValue(values[values.length - 1]);
        } else if (e.key === 'ArrowDown') {
          setHighlightedValue(values[currentIndex < values.length - 1 ? currentIndex + 1 : 0]);
        } else {
          setHighlightedValue(values[currentIndex > 0 ? currentIndex - 1 : values.length - 1]);
        }
      }
    },
    [
      abortController,
      closeDropdown,
      creatable,
      handleValueRemove,
      handleValueSelect,
      highlightedValue,
      options,
      search,
      selected,
      timer,
    ]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Based on Mantine MultiSelect:
  // https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/core/src/components/MultiSelect/MultiSelect.tsx
  const clearButton = !disabled && clearable && selected.length > 0 && (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title="Clear all"
      onClick={() => {
        setSearch('');
        setSelected([]);
        onChange([]);
        closeDropdown();
      }}
    >
      <IconX />
    </Button>
  );

  const createVisible = creatable && search.trim().length > 0;
  const comboboxVisible = options.length > 0 || createVisible;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          openDropdown();
        } else {
          closeDropdown();
        }
      }}
    >
      <Field
        data-slot="async-autocomplete"
        data-invalid={error ? true : undefined}
        data-disabled={disabled ? true : undefined}
        className={cn('gap-1', className)}
      >
        {label && (
          <FieldLabel htmlFor={inputId}>
            {label}
            {required && (
              <span aria-hidden className="text-destructive">
                *
              </span>
            )}
          </FieldLabel>
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
        <PopoverAnchor asChild>
          <div
            className={cn(
              'flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-[color,box-shadow]',
              'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
              disabled && 'cursor-not-allowed opacity-50',
              error && 'border-destructive ring-destructive/20'
            )}
          >
            {leftSection}
            <div
              className="flex min-w-0 flex-1 flex-wrap items-center gap-1"
              data-testid={AsyncAutocompleteTestIds.selectedItems}
            >
              {selected.map((item) => (
                <PillComponent
                  key={item.value}
                  item={item}
                  disabled={disabled}
                  onRemove={() => handleValueRemove(item)}
                />
              ))}
              {!disabled && (maxValues === undefined || maxValues === 0 || selected.length < maxValues) && (
                <input
                  id={inputId}
                  role="searchbox"
                  name={name}
                  value={search}
                  placeholder={placeholder}
                  className="h-7 min-w-16 flex-1 border-0 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
                  onFocus={handleSearchChange}
                  onBlur={() => {
                    closeDropdown();
                    setSearch('');
                  }}
                  onKeyDown={handleKeyDown}
                  onChange={handleSearchChange}
                />
              )}
            </div>
            {abortController ? <Spinner /> : clearButton}
          </div>
        </PopoverAnchor>
        <FieldError>{error}</FieldError>
      </Field>

      {!open && (
        <div hidden data-hidden="true" data-testid={AsyncAutocompleteTestIds.options}>
          {!creatable && search.trim().length > 0 && options.length === 0 && <EmptyComponent search={search} />}
        </div>
      )}
      <PopoverContent
        forceMount
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        hidden={!open || !comboboxVisible}
        data-hidden={(!open || !comboboxVisible).toString()}
        data-testid={AsyncAutocompleteTestIds.options}
      >
        <Command shouldFilter={false} value={highlightedValue} onValueChange={setHighlightedValue}>
          <CommandList className="max-h-none overflow-hidden">
            <ScrollArea style={{ maxHeight: optionsDropdownMaxHeight }}>
              <div className="p-1">
                {options.map((item) => {
                  const active = selected.some((v) => v.value === item.value);
                  return (
                    <CommandItem
                      value={item.value}
                      key={item.value}
                      disabled={item.disabled}
                      role="option"
                      onSelect={handleValueSelect}
                    >
                      <ItemComponent {...item} active={active} />
                    </CommandItem>
                  );
                })}

                {createVisible && (
                  <CommandItem value="$create" role="option" onSelect={handleValueSelect}>
                    + Create {search}
                  </CommandItem>
                )}

                {!creatable && search.trim().length > 0 && options.length === 0 && <EmptyComponent search={search} />}
              </div>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function toDefaultItems<T>(defaultValue: T | T[] | undefined): T[] {
  if (!defaultValue) {
    return [];
  }
  if (Array.isArray(defaultValue)) {
    return defaultValue;
  }
  return [defaultValue];
}

function DefaultItemComponent<T>(props: AsyncAutocompleteOption<T>): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      {props.active && <IconCheck size={12} />}
      <span>{props.label}</span>
    </div>
  );
}

function DefaultPillComponent<T>({
  item,
  disabled,
  onRemove,
}: {
  readonly item: AsyncAutocompleteOption<T>;
  readonly disabled?: boolean;
  readonly onRemove: () => void;
}): JSX.Element {
  return (
    <Badge variant="secondary" className="gap-1">
      {item.label}
      {!disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove ${item.label}`}
          className="-mr-1 size-4 rounded-full"
          onClick={onRemove}
        >
          <IconX />
        </Button>
      )}
    </Badge>
  );
}

function DefaultEmptyComponent(): JSX.Element {
  return <div className="py-6 text-center text-sm">Nothing found</div>;
}
