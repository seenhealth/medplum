// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchFieldEditor/SearchFieldEditor.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AsyncAutocomplete } from '@/components/medplum/async-autocomplete';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { buildFieldNameString } from '@/components/medplum/search-control/search-utils';
import { Button } from '@/components/ui/button';
import type { InternalTypeSchema, SearchRequest } from '@medplum/core';
import { getDataType, getSearchParameters, sortStringArray, stringify } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface SearchFieldEditorProps {
  readonly visible: boolean;
  readonly search: SearchRequest;
  readonly onOk: (search: SearchRequest) => void;
  readonly onCancel: () => void;
}

export function SearchFieldEditor(props: SearchFieldEditorProps): JSX.Element | null {
  const wasDropdownOpen = useRef(false);
  const [state, setState] = useState({
    search: JSON.parse(stringify(props.search)) as SearchRequest,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setState({ search: props.search });
  }, [props.search]);

  const allFields = useMemo(() => {
    if (!props.visible) {
      return [];
    }

    const resourceType = props.search.resourceType;
    const typeSchema = getDataType(resourceType);
    const searchParams = getSearchParameters(resourceType);
    return sortStringArray(getFieldsList(typeSchema, searchParams)).map((field) => {
      return { value: field, label: buildFieldNameString(field) };
    });
  }, [props.visible, props.search.resourceType]);

  function handleChange(newFields: string[]): void {
    setState({ search: { ...state.search, fields: newFields } });
  }

  return (
    <Modal
      open={props.visible}
      onOpenChange={(open) => !open && props.onCancel()}
      size="lg"
      onOpenAutoFocus={(event) => event.preventDefault()}
      /*
      By default, the MultiSelect dropdown does not interact well with Modal's closeOnClickOutside:
      When the MultiSelect's dropdown is opened and the user clicks outside of the dropdown to close it
      (and outside the modal, i.e. clicks on the Modal's overlay), the Modal is undesirably also closed
      from the same click.

      Due to the sequencing of the events fired during a click on the overlay and when React
      rerenders of various components occur, it is not possible to simply do something such as setting
      closeOnClickOutside={!isDropdownOpened}:

      * user begins a click on the overlay which triggers
      * mousedown event on the overlay which triggers
      * blur event on the MultiSelect's input element which invokes
      * the MultiSelect.onDropdownClose callback which calls setIsDropdownOpen(false) which causes
      * rerender of SearchFieldEditor with isDropdownOpen set to false
      * the user ends the click which triggers
      * click event on the Modal which activates the closeOnClickOutside logic
      * since isDropdownOpen is false, closeOnClickOutside is true, so the Modal closes

      Instead, emulate closeOnClickOutside's behavior only when the MultiSelect dropdown
      was not open at the beginning of the click
      */
      closeOnClickOutside={false}
    >
      <div
        data-testid="overlay-child"
        className="fixed inset-0 -z-10"
        onMouseDownCapture={() => {
          wasDropdownOpen.current = isDropdownOpen;
        }}
        onClick={() => {
          if (!wasDropdownOpen.current) {
            props.onCancel();
          }
          wasDropdownOpen.current = false;
        }}
      />
      <ModalHeader>
        <ModalTitle>Fields</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div
          onFocusCapture={() => setIsDropdownOpen(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsDropdownOpen(false);
            }
          }}
        >
          <AsyncAutocomplete
            placeholder="Select fields to display"
            defaultValue={state.search.fields ?? []}
            toOption={(field) => ({
              value: field,
              label: allFields.find((option) => option.value === field)?.label ?? buildFieldNameString(field),
              resource: field,
            })}
            loadOptions={async (input) =>
              allFields
                .filter((option) => option.label.toLowerCase().includes(input.toLowerCase()))
                .map((option) => option.value)
            }
            onChange={handleChange}
            optionsDropdownMaxHeight={250}
            clearable
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => props.onOk(state.search)}>OK</Button>
      </ModalFooter>
    </Modal>
  );
}

/**
 * Returns a list of fields/columns available for a type.
 * The result is the union of properties and search parameters.
 * @param typeSchema - The type definition.
 * @param searchParams - The search parameters.
 * @returns A list of fields/columns available for a resource type.
 */
function getFieldsList(
  typeSchema: InternalTypeSchema,
  searchParams: Record<string, SearchParameter> | undefined
): string[] {
  const result = [] as string[];
  const keys = new Set<string>();
  const names = new Set<string>();

  // Add properties first
  for (const key of Object.keys(typeSchema.elements)) {
    result.push(key);
    keys.add(key.toLowerCase());
    names.add(buildFieldNameString(key));
  }

  // Add search parameters if unique
  if (searchParams) {
    for (const code of Object.keys(searchParams)) {
      const name = buildFieldNameString(code);
      if (!keys.has(code) && !names.has(name)) {
        result.push(code);
        keys.add(code);
        names.add(name);
      }
    }
  }

  return result;
}
