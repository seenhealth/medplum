// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceForm/ResourceForm.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import {
  AccessPolicyInteraction,
  applyDefaultValuesToResource,
  canWriteResourceType,
  isPopulated,
  satisfiedAccessPolicy,
  tryGetProfile,
} from '@medplum/core';
import type { OperationOutcome, Reference, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import { IconAlertCircle, IconChevronDown, IconEdit, IconTrash } from '@tabler/icons-react';
import cx from 'clsx';
import type { FormEvent, JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { BackboneElementInput } from '@/components/medplum/backbone-element-input';
import {
  FormSection,
  FormSectionError,
  FormSectionLabel,
} from '@/components/medplum/form-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export interface ResourceFormProps {
  readonly defaultValue: Partial<Resource> | Reference;
  readonly outcome?: OperationOutcome;
  readonly onSubmit: (resource: Resource) => void;
  readonly onPatch?: (resource: Resource) => void;
  readonly onDelete?: (resource: Resource) => void;
  /** (optional) URL of the resource profile used to display the form. Takes priority over schemaName. */
  readonly profileUrl?: string;
}

export function ResourceForm(props: ResourceFormProps): JSX.Element {
  const { outcome } = props;
  const medplum = useMedplum();
  const defaultValue = useResource(props.defaultValue);
  const resourceType = defaultValue?.resourceType as ResourceType;
  const [schemaLoaded, setSchemaLoaded] = useState(false);
  const [value, setValue] = useState<Resource>();
  const accessPolicy = medplum.getAccessPolicy();

  useEffect(() => {
    if (defaultValue) {
      if (props.profileUrl) {
        const profileUrl: string = props.profileUrl;
        medplum
          .requestProfileSchema(props.profileUrl, { expandProfile: true })
          .then(() => {
            const profile = tryGetProfile(profileUrl);
            if (profile) {
              setSchemaLoaded(true);
              const modifiedDefaultValue = applyDefaultValuesToResource(defaultValue, profile);
              setValue(modifiedDefaultValue);
            } else {
              console.error(`Schema not found for ${profileUrl}`);
            }
          })
          .catch((reason) => {
            console.error('Error in requestProfileSchema', reason);
          });
      } else {
        medplum
          .requestSchema(resourceType)
          .then(() => {
            setValue(defaultValue);
            setSchemaLoaded(true);
          })
          .catch(console.log);
      }
    }
  }, [medplum, defaultValue, resourceType, props.profileUrl]);

  const accessPolicyResource = useMemo(() => {
    return defaultValue && satisfiedAccessPolicy(defaultValue, AccessPolicyInteraction.READ, accessPolicy);
  }, [accessPolicy, defaultValue]);

  const canWrite = useMemo<boolean>(() => {
    if (medplum.isSuperAdmin()) {
      return true;
    }

    if (!accessPolicy) {
      return true;
    }

    if (!isPopulated(value?.resourceType)) {
      return true;
    }

    return canWriteResourceType(accessPolicy, value?.resourceType);
  }, [medplum, accessPolicy, value?.resourceType]);

  if (!schemaLoaded || !value) {
    return <div>Loading...</div>;
  }

  if (!canWrite) {
    return (
      <Alert variant="destructive">
        <IconAlertCircle />
        <AlertTitle>Permission denied</AlertTitle>
        <AlertDescription>
          Your access level prevents you from editing and creating {value.resourceType} resources.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (props.onSubmit) {
          props.onSubmit(value);
        }
      }}
    >
      <div className="mb-8 flex flex-col gap-4">
        <FormSection htmlFor="resourceType" outcome={outcome}>
          <FormSectionLabel>Resource Type</FormSectionLabel>
          <Input id="resourceType" name="resourceType" defaultValue={value.resourceType} disabled={true} />
          <FormSectionError />
        </FormSection>
        <FormSection htmlFor="id" outcome={outcome}>
          <FormSectionLabel>ID</FormSectionLabel>
          <Input id="id" name="id" defaultValue={value.id} disabled={true} />
          <FormSectionError />
        </FormSection>
      </div>
      <BackboneElementInput
        path={value.resourceType}
        valuePath={value.resourceType}
        typeName={resourceType}
        defaultValue={value}
        outcome={outcome}
        onChange={setValue}
        profileUrl={props.profileUrl}
        accessPolicyResource={accessPolicyResource}
      />
      <div className="mt-8 flex flex-nowrap justify-end gap-0">
        <Button type="submit" className={cx((props.onPatch || props.onDelete) && 'rounded-r-none')}>
          {defaultValue?.id ? 'Update' : 'Create'}
        </Button>
        {(props.onPatch || props.onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="default"
                size="icon"
                className="rounded-l-none border-0 border-l border-l-background"
                aria-label="More actions"
              >
                <IconChevronDown size={14} stroke={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {props.onPatch && (
                <DropdownMenuItem
                  onClick={() => {
                    (props.onPatch as (resource: Resource) => void)(value);
                  }}
                >
                  <IconEdit size={14} stroke={1.5} />
                  Patch
                </DropdownMenuItem>
              )}
              {props.onDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    (props.onDelete as (resource: Resource) => void)(value);
                  }}
                >
                  <IconTrash size={14} stroke={1.5} />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </form>
  );
}
