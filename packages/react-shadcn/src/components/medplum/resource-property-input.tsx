// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourcePropertyInput/ResourcePropertyInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AddressInput } from '@/components/medplum/address-input';
import { AnnotationInput } from '@/components/medplum/annotation-input';
import { AttachmentArrayInput } from '@/components/medplum/attachment-array-input';
import { AttachmentInput } from '@/components/medplum/attachment-input';
import { BackboneElementInput } from '@/components/medplum/backbone-element-input';
import { CodeInput } from '@/components/medplum/code-input';
import { CodeableConceptInput } from '@/components/medplum/codeable-concept-input';
import { CodingInput } from '@/components/medplum/coding-input';
import { ContactDetailInput } from '@/components/medplum/contact-detail-input';
import { ContactPointInput } from '@/components/medplum/contact-point-input';
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { ExtensionInput } from '@/components/medplum/extension-input';
import { HumanNameInput } from '@/components/medplum/human-name-input';
import { IdentifierInput } from '@/components/medplum/identifier-input';
import { MoneyInput } from '@/components/medplum/money-input';
import { PeriodInput } from '@/components/medplum/period-input';
import { QuantityInput } from '@/components/medplum/quantity-input';
import { RangeInput } from '@/components/medplum/range-input';
import { RatioInput } from '@/components/medplum/ratio-input';
import { ReferenceInput } from '@/components/medplum/reference-input';
import { ResourceArrayInput } from '@/components/medplum/resource-array-input';
import type {
  BaseInputProps,
  ComplexTypeInputProps,
  PrimitiveTypeInputProps,
} from '@/components/medplum/resource-property-input-utils';
import { SensitiveTextarea } from '@/components/medplum/sensitive-textarea';
import { TimingInput } from '@/components/medplum/timing-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { getErrorsForInput } from '@/lib/medplum/outcomes';
import type { ExtendedInternalSchemaElement } from '@medplum/core';
import {
  applyDefaultValuesToElement,
  capitalize,
  getPathDifference,
  HTTP_HL7_ORG,
  isComplexTypeCode,
  isEmpty,
  isPopulated,
  PropertyType,
} from '@medplum/core';
import type { ElementDefinitionBinding, ElementDefinitionType } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export interface ResourcePropertyInputProps extends BaseInputProps {
  readonly property: ExtendedInternalSchemaElement;
  readonly name: string;
  readonly defaultPropertyType?: string;
  readonly defaultValue: any;
  readonly arrayElement?: boolean;
  readonly onChange?: (value: any, propName?: string) => void;
}

export function ResourcePropertyInput(props: ResourcePropertyInputProps): JSX.Element {
  const { property, name, onChange, defaultValue } = props;
  const defaultPropertyType =
    props.defaultPropertyType && props.defaultPropertyType !== 'undefined'
      ? props.defaultPropertyType
      : property.type[0].code;
  const propertyTypes = property.type as ElementDefinitionType[];

  if ((property.isArray || property.max > 1) && !props.arrayElement) {
    if (defaultPropertyType === PropertyType.Attachment) {
      return (
        <AttachmentArrayInput
          name={name}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={property.readonly}
        />
      );
    }

    // Extensions are a special type of array that shouldn't be indented
    const indent = propertyTypes[0]?.code !== PropertyType.Extension;
    return (
      <ResourceArrayInput
        property={property}
        name={name}
        path={props.path}
        valuePath={props.valuePath}
        defaultValue={defaultValue}
        indent={indent}
        onChange={onChange}
        outcome={props.outcome}
      />
    );
  } else if (propertyTypes.length > 1) {
    return <ElementDefinitionInputSelector elementDefinitionTypes={propertyTypes} {...props} />;
  } else {
    return (
      <ElementDefinitionTypeInput
        name={name}
        defaultValue={defaultValue}
        onChange={(newValue: any) => {
          if (props.onChange) {
            const newPropName = props.name.replace('[x]', capitalize(propertyTypes[0].code));
            props.onChange(newValue, newPropName);
          }
        }}
        outcome={props.outcome}
        elementDefinitionType={propertyTypes[0]}
        min={property.min}
        max={property.min}
        binding={property.binding}
        path={props.path}
        valuePath={props.valuePath}
        readOnly={property.readonly}
      />
    );
  }
}

export interface ElementDefinitionSelectorProps extends ResourcePropertyInputProps {
  readonly elementDefinitionTypes: ElementDefinitionType[];
}

export function ElementDefinitionInputSelector(props: ElementDefinitionSelectorProps): JSX.Element {
  const propertyTypes = props.elementDefinitionTypes;
  let initialPropertyType: ElementDefinitionType | undefined = undefined;
  if (props.defaultPropertyType) {
    initialPropertyType = propertyTypes.find((t) => t.code === props.defaultPropertyType);
  }
  if (!initialPropertyType) {
    initialPropertyType = propertyTypes[0];
  }
  const [selectedType, setSelectedType] = useState(initialPropertyType);
  return (
    <div className="flex flex-nowrap items-start gap-2 *:flex-1">
      <NativeSelect
        disabled={props.property.readonly}
        className="w-[200px]"
        defaultValue={selectedType.code}
        data-testid={props.name && props.name + '-selector'}
        onChange={(e) => {
          setSelectedType(
            propertyTypes.find(
              (type: ElementDefinitionType) => type.code === e.currentTarget.value
            ) as ElementDefinitionType
          );
        }}
      >
        {propertyTypes.map((type: ElementDefinitionType) => (
          <NativeSelectOption key={type.code} value={type.code}>
            {type.code}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <ElementDefinitionTypeInput
        name={props.name}
        defaultValue={props.defaultValue}
        outcome={props.outcome}
        elementDefinitionType={selectedType}
        onChange={(newValue: any) => {
          if (props.onChange) {
            props.onChange(newValue, props.name.replace('[x]', capitalize(selectedType.code)));
          }
        }}
        min={props.property.min}
        max={props.property.max}
        binding={props.property.binding}
        path={props.property.path}
        valuePath={props.valuePath}
        readOnly={props.property.readonly}
      />
    </div>
  );
}

// Avoiding optional props on lower-level components like to make it more difficult to misuse
export interface ElementDefinitionTypeInputProps extends Pick<
  ResourcePropertyInputProps,
  'name' | 'path' | 'valuePath' | 'defaultValue' | 'onChange' | 'outcome'
> {
  readonly elementDefinitionType: ElementDefinitionType;
  readonly min: number;
  readonly max: number;
  readonly binding: ElementDefinitionBinding | undefined;
  readonly readOnly?: boolean;
}

export function ElementDefinitionTypeInput(props: ElementDefinitionTypeInputProps): JSX.Element {
  const { name, onChange, outcome, binding, path, valuePath, readOnly } = props;
  const required = props.min !== undefined && props.min > 0;

  const propertyType = props.elementDefinitionType.code;

  const elementsContext = useContext(ElementsContext);
  const defaultValue = useMemo(() => {
    if (!isComplexTypeCode(propertyType)) {
      return props.defaultValue;
    }

    if (!isEmpty(props.defaultValue)) {
      return props.defaultValue;
    }

    const withDefaults = Object.create(null);
    if (elementsContext.path === props.path) {
      applyDefaultValuesToElement(withDefaults, elementsContext.elements);
    } else {
      const key = getPathDifference(elementsContext.path, props.path);
      if (key === undefined) {
        return props.defaultValue;
      }
      applyDefaultValuesToElement(withDefaults, elementsContext.elements, key);
    }

    if (isPopulated(withDefaults)) {
      return withDefaults;
    }

    return props.defaultValue;
  }, [propertyType, elementsContext.path, elementsContext.elements, props.path, props.defaultValue]);

  if (!propertyType) {
    return <div>Property type not specified </div>;
  }

  function getComplexInputProps(): ComplexTypeInputProps<any> {
    return { name, defaultValue, onChange, outcome, path, valuePath, disabled: readOnly };
  }

  function getPrimitiveInputProps(): PrimitiveTypeInputProps {
    const error = getErrorsForInput(props.outcome, valuePath ?? path);
    return {
      id: name,
      name,
      'data-testid': name,
      defaultValue,
      required,
      error,
      disabled: readOnly,
    };
  }

  function getNativeInputProps(): Omit<PrimitiveTypeInputProps, 'error'> & { 'aria-invalid'?: true } {
    const { error, ...inputProps } = getPrimitiveInputProps();
    return { ...inputProps, 'aria-invalid': error ? true : undefined };
  }

  switch (propertyType) {
    // 2.24.0.1 Primitive Types
    // https://www.hl7.org/fhir/datatypes.html#primitive

    case PropertyType.SystemString:
    case PropertyType.canonical:
    case PropertyType.id:
    case PropertyType.string:
    case PropertyType.uri:
    case PropertyType.url:
      if (props.path === 'Project.secret.value[x]' || props.path === 'ClientApplication.certificateTrustStore') {
        return (
          <SensitiveTextarea
            {...getPrimitiveInputProps()}
            onChange={(e) => {
              if (props.onChange) {
                props.onChange(e.currentTarget.value);
              }
            }}
          />
        );
      }

      return (
        <Input
          {...getNativeInputProps()}
          onChange={(e) => {
            if (onChange) {
              onChange(e.currentTarget.value);
            }
          }}
        />
      );
    case PropertyType.date:
      return (
        <Input
          {...getNativeInputProps()}
          type="date"
          onChange={(e) => {
            if (onChange) {
              onChange(e.currentTarget.value);
            }
          }}
        />
      );
    case PropertyType.time:
      return (
        <Input
          {...getNativeInputProps()}
          type="time"
          step={1}
          onChange={(e) => {
            if (onChange) {
              onChange(e.currentTarget.value);
            }
          }}
        />
      );
    case PropertyType.dateTime:
    case PropertyType.instant:
      return <DateTimeInput {...getPrimitiveInputProps()} onChange={onChange} outcome={outcome} />;
    case PropertyType.decimal:
    case PropertyType.integer:
    case PropertyType.positiveInt:
    case PropertyType.unsignedInt:
      return (
        <Input
          {...getNativeInputProps()}
          type="number"
          step={propertyType === PropertyType.decimal ? 'any' : '1'}
          onChange={(e) => {
            if (onChange) {
              const num = e.currentTarget.valueAsNumber;
              onChange(Number.isNaN(num) ? undefined : num);
            }
          }}
        />
      );
    case PropertyType.code:
      // overwrite getPrimitiveInputProps().error since FormSection already shows errors
      return (
        <CodeInput
          {...getPrimitiveInputProps()}
          error={undefined}
          onChange={onChange}
          binding={binding?.valueSet}
          creatable
          maxValues={1}
        />
      );
    case PropertyType.boolean:
      return (
        <Checkbox
          {...getNativeInputProps()}
          defaultChecked={Boolean(defaultValue)}
          onCheckedChange={(checked) => {
            if (onChange) {
              onChange(checked === true);
            }
          }}
        />
      );
    case PropertyType.base64Binary:
    case PropertyType.markdown:
    case PropertyType.xhtml:
      return (
        <Textarea
          {...getNativeInputProps()}
          spellCheck={propertyType !== PropertyType.base64Binary}
          onChange={(e) => {
            if (onChange) {
              onChange(e.currentTarget.value);
            }
          }}
        />
      );

    // 2.24.0.2 Complex Types
    // https://www.hl7.org/fhir/datatypes.html#complex

    case PropertyType.Address:
      return <AddressInput {...getComplexInputProps()} />;
    case PropertyType.Annotation:
      return <AnnotationInput {...getComplexInputProps()} />;
    case PropertyType.Attachment:
      return <AttachmentInput {...getComplexInputProps()} />;
    case PropertyType.CodeableConcept:
      return <CodeableConceptInput binding={binding?.valueSet} {...getComplexInputProps()} />;
    case PropertyType.Coding:
      return <CodingInput binding={binding?.valueSet} {...getComplexInputProps()} />;
    case PropertyType.ContactDetail:
      return <ContactDetailInput {...getComplexInputProps()} />;
    case PropertyType.ContactPoint:
      return <ContactPointInput {...getComplexInputProps()} />;
    case PropertyType.Extension:
      return <ExtensionInput {...getComplexInputProps()} propertyType={props.elementDefinitionType} />;
    case PropertyType.HumanName:
      return <HumanNameInput {...getComplexInputProps()} />;
    case PropertyType.Identifier:
      return <IdentifierInput {...getComplexInputProps()} />;
    case PropertyType.Money:
      return <MoneyInput {...getComplexInputProps()} />;
    case PropertyType.Period:
      return <PeriodInput {...getComplexInputProps()} />;
    case PropertyType.Duration:
    case PropertyType.Quantity:
      return <QuantityInput {...getComplexInputProps()} />;
    case PropertyType.Range:
      return <RangeInput {...getComplexInputProps()} />;
    case PropertyType.Ratio:
      return <RatioInput {...getComplexInputProps()} />;
    case PropertyType.Reference:
      return <ReferenceInput {...getComplexInputProps()} targetTypes={getTargetTypes(props.elementDefinitionType)} />;
    case PropertyType.Timing:
      return <TimingInput {...getComplexInputProps()} />;
    case PropertyType.Dosage:
    case PropertyType.UsageContext:
    default:
      return <BackboneElementInput {...getComplexInputProps()} typeName={propertyType} />;
  }
}

const RESOURCE_TYPE_URL_PREFIXES = [
  `${HTTP_HL7_ORG}/fhir/StructureDefinition/`,
  'https://medplum.com/fhir/StructureDefinition/',
];
function getTargetTypes(elementDefinitionType?: ElementDefinitionType): string[] | undefined {
  return elementDefinitionType?.targetProfile?.map((p) => {
    const resourceTypePrefix = RESOURCE_TYPE_URL_PREFIXES.find((prefix) => p.startsWith(prefix));
    if (resourceTypePrefix) {
      return p.slice(resourceTypePrefix.length);
    } else {
      return p;
    }
  });
}
