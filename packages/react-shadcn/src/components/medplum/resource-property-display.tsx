// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourcePropertyDisplay/ResourcePropertyDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AddressDisplay } from '@/components/medplum/address-display';
import { AttachmentArrayDisplay } from '@/components/medplum/attachment-array-display';
import { AttachmentDisplay } from '@/components/medplum/attachment-display/attachment-display';
import { BackboneElementDisplay } from '@/components/medplum/backbone-element-display';
import { CodeableConceptDisplay } from '@/components/medplum/codeable-concept-display';
import { CodingDisplay } from '@/components/medplum/coding-display';
import { ContactDetailDisplay } from '@/components/medplum/contact-detail-display';
import { ContactPointDisplay } from '@/components/medplum/contact-point-display';
import { ExtensionDisplay } from '@/components/medplum/extension-display';
import { HumanNameDisplay } from '@/components/medplum/human-name-display';
import { IdentifierDisplay } from '@/components/medplum/identifier-display';
import { MoneyDisplay } from '@/components/medplum/money-display';
import { QuantityDisplay } from '@/components/medplum/quantity-display';
import { RangeDisplay } from '@/components/medplum/range-display';
import { RatioDisplay } from '@/components/medplum/ratio-display';
import { ReferenceDisplay } from '@/components/medplum/reference-display';
import { ResourceArrayDisplay } from '@/components/medplum/resource-array-display';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useClipboard } from '@/hooks/medplum/use-clipboard';
import type { InternalSchemaElement } from '@medplum/core';
import {
  formatDateTime,
  formatPeriod,
  formatTiming,
  formatWallTime,
  isEmpty,
  isObject,
  isString,
  PropertyType,
} from '@medplum/core';
import type { ElementDefinitionType } from '@medplum/fhirtypes';
import { IconCheck, IconCopy, IconEye, IconEyeOff } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';

export interface ResourcePropertyDisplayProps {
  readonly property?: InternalSchemaElement;
  /** The path identifies the element and is expressed as a "."-separated list of ancestor elements, beginning with the name of the resource or extension. */
  readonly path?: string;
  readonly propertyType: string;
  readonly value: any;
  readonly arrayElement?: boolean;
  readonly maxWidth?: number;
  readonly ignoreMissingValues?: boolean;
  readonly link?: boolean;
  /** (Optional) The `ElemendDefinitionType` to display the property against. Used when displaying extensions.  */
  readonly elementDefinitionType?: ElementDefinitionType;
  /** (Optional) If true and `property` is an array, output is wrapped with a DescriptionListEntry */
  readonly includeArrayDescriptionListEntry?: boolean;
}

/**
 * Low-level component that renders a property from a given resource, given type information.
 * @param props - The ResourcePropertyDisplay React props.
 * @returns The ResourcePropertyDisplay React node.
 */
export function ResourcePropertyDisplay(props: ResourcePropertyDisplayProps): JSX.Element | null {
  const { property, propertyType, value } = props;

  const isIdProperty = property?.path?.endsWith('.id');
  if (isIdProperty) {
    return (
      <div className="flex items-center gap-[3px]">
        {value}
        {!isEmpty(value) && <PropertyCopyButton value={value} idleLabel="Copy" copiedLabel="Copied" />}
      </div>
    );
  }

  if (property && (property.isArray || property.max > 1) && !props.arrayElement) {
    if (propertyType === PropertyType.Attachment) {
      return (
        <AttachmentArrayDisplay
          values={value}
          maxWidth={props.maxWidth}
          includeDescriptionListEntry={props.includeArrayDescriptionListEntry}
          property={property}
          path={props.path}
        />
      );
    }
    return (
      <ResourceArrayDisplay
        path={props.path}
        property={property}
        propertyType={propertyType}
        values={value}
        includeDescriptionListEntry={props.includeArrayDescriptionListEntry}
        ignoreMissingValues={props.ignoreMissingValues}
        link={props.link}
      />
    );
  }

  switch (propertyType) {
    case PropertyType.boolean:
      return <>{value === undefined ? '' : Boolean(value).toString()}</>;
    case PropertyType.SystemString:
    case PropertyType.string:
      // Check if this is a secret field that should be masked
      if (props.property?.path?.toLowerCase().includes('secret')) {
        return <SecretFieldDisplay value={value} />;
      }
      return <div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>;
    case PropertyType.code:
    case PropertyType.date:
    case PropertyType.decimal:
    case PropertyType.id:
    case PropertyType.integer:
    case PropertyType.positiveInt:
    case PropertyType.unsignedInt:
    case PropertyType.uri:
    case PropertyType.url:
    case PropertyType.xhtml:
      if (isObject(value) && !isString(value)) {
        console.warn('Non-standard FHIR data or missing primitive value with extension', {
          path: props.path,
          propertyType,
          value,
        });
        return null;
      }
      return <>{value?.toString()}</>;
    case PropertyType.canonical:
      return <ReferenceDisplay value={{ reference: value }} link={props.link} />;
    case PropertyType.dateTime:
    case PropertyType.instant:
      return <>{formatDateTime(value)}</>;
    case PropertyType.time:
      return <>{formatWallTime(value)}</>;
    case PropertyType.markdown:
      return <pre>{value}</pre>;
    case PropertyType.Address:
      return <AddressDisplay value={value} />;
    case PropertyType.Annotation:
      return <>{value?.text}</>;
    case PropertyType.Attachment:
      return <AttachmentDisplay value={value} maxWidth={props.maxWidth} />;
    case PropertyType.CodeableConcept:
      return <CodeableConceptDisplay value={value} />;
    case PropertyType.Coding:
      return <CodingDisplay value={value} />;
    case PropertyType.ContactDetail:
      return <ContactDetailDisplay value={value} />;
    case PropertyType.ContactPoint:
      return <ContactPointDisplay value={value} />;
    case PropertyType.HumanName:
      return <HumanNameDisplay value={value} />;
    case PropertyType.Identifier:
      return <IdentifierDisplay value={value} />;
    case PropertyType.Money:
      return <MoneyDisplay value={value} />;
    case PropertyType.Period:
      return <>{formatPeriod(value)}</>;
    case PropertyType.Quantity:
    case PropertyType.Duration:
      return <QuantityDisplay value={value} />;
    case PropertyType.Range:
      return <RangeDisplay value={value} />;
    case PropertyType.Ratio:
      return <RatioDisplay value={value} />;
    case PropertyType.Reference:
      return <ReferenceDisplay value={value} link={props.link} />;
    case PropertyType.Timing:
      return <>{formatTiming(value)}</>;
    case PropertyType.Dosage:
    case PropertyType.UsageContext:
      if (!props.path) {
        throw new Error(`Displaying property of type ${props.propertyType} requires path`);
      }
      return (
        <BackboneElementDisplay
          path={props.path}
          value={{ type: propertyType, value }}
          compact={true}
          ignoreMissingValues={props.ignoreMissingValues}
        />
      );
    case PropertyType.Extension:
      if (!props.path) {
        throw new Error(`Displaying property of type ${props.propertyType} requires path`);
      }
      return (
        <ExtensionDisplay
          path={props.path}
          value={value}
          compact={true}
          ignoreMissingValues={props.ignoreMissingValues}
          elementDefinitionType={props.elementDefinitionType}
        />
      );
    default:
      if (!property) {
        throw new Error(`Displaying property of type ${props.propertyType} requires element schema`);
      }
      if (!props.path) {
        throw new Error(`Displaying property of type ${props.propertyType} requires path`);
      }
      return (
        <BackboneElementDisplay
          path={props.path}
          value={{ type: property.type[0].code, value }}
          compact={true}
          ignoreMissingValues={props.ignoreMissingValues}
        />
      );
  }
}

interface SecretFieldDisplayProps {
  readonly value: string;
}

function PropertyCopyButton(props: {
  readonly value: string;
  readonly idleLabel: string;
  readonly copiedLabel: string;
}): JSX.Element {
  const { copied, copy } = useClipboard({ timeout: 2000 });
  const label = copied ? props.copiedLabel : props.idleLabel;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={label}
          aria-label={label}
          onClick={() => copy(props.value)}
        >
          {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function SecretFieldDisplay(props: SecretFieldDisplayProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const secretValue = props.value ?? '';
  const hasValue = !isEmpty(secretValue);
  const MASK = '•'.repeat(8);

  return (
    <div className="flex items-center gap-[3px]">
      {isVisible ? (
        <div style={{ whiteSpace: 'pre-wrap' }}>{secretValue}</div>
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }} aria-hidden="true">
          {hasValue ? MASK : ''}
        </div>
      )}
      {hasValue && (
        <>
          <PropertyCopyButton value={props.value} idleLabel="Copy secret" copiedLabel="Copied" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title={isVisible ? 'Hide secret' : 'Show secret'}
                aria-label={isVisible ? 'Hide secret' : 'Show secret'}
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <IconEyeOff size="1rem" /> : <IconEye size="1rem" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{isVisible ? 'Hide secret' : 'Show secret'}</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}
