// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/PharmacyDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { notify } from '@/lib/medplum/notify';
import { cn } from '@/lib/utils';
import type { AddFavoriteParams, AddPharmacyResponse, PharmacySearchParams } from '@medplum/core';
import { formatAddress, normalizeErrorString } from '@medplum/core';
import type { Organization, Patient } from '@medplum/fhirtypes';
import type { JSX, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Placeholder text for each pharmacy search field. Vendors can override these to
 * reflect their own API constraints (e.g. DoseSpot requires a 3-character minimum
 * on text searches, whereas ScriptSure expects a 2-letter state and 5-digit ZIP).
 */
export interface PharmacySearchFieldPlaceholders {
  readonly name?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zip?: string;
  readonly phoneOrFax?: string;
  readonly address?: string;
  readonly ncpdpID?: string;
}

const DEFAULT_SEARCH_PLACEHOLDERS: Required<PharmacySearchFieldPlaceholders> = {
  name: 'Enter pharmacy name (min 3 chars)',
  city: 'City (min 3 chars)',
  state: 'State (min 3 chars)',
  zip: 'Zip code (min 3 chars)',
  phoneOrFax: 'Phone or fax number',
  address: 'Street address (min 3 chars)',
  ncpdpID: 'National Council for Prescription Drug Programs ID',
};

export interface PharmacyDialogProps {
  readonly patient: Patient;
  readonly onSubmit: (pharmacy: Organization) => void;
  readonly onClose: () => void;
  readonly onSearch: (params: PharmacySearchParams & Record<string, unknown>) => Promise<Organization[]>;
  readonly onAddToFavorites: (params: AddFavoriteParams) => Promise<AddPharmacyResponse>;
  /** Optional fields rendered inside the search form above the submit button. */
  readonly renderBeforeSearchButton?: ReactNode;
  /**
   * Extra search parameters merged into the bot request (e.g. vendor-specific filters).
   * `handleSearch` depends on this callback, so callers should memoize it (e.g. `useCallback`)
   * to avoid re-creating the search handler on every render.
   */
  readonly getExtraSearchParams?: () => Record<string, unknown>;
  /** Optional per-field placeholder overrides for the search form. */
  readonly searchPlaceholders?: PharmacySearchFieldPlaceholders;
}

/**
 * Gets a unique key for a pharmacy based on its identifier or index.
 * @param pharmacy - The pharmacy Organization resource.
 * @param index - The index of the pharmacy in the list.
 * @returns A unique key string for the pharmacy.
 */
function getPharmacyKey(pharmacy: Organization, index: number): string {
  return pharmacy.identifier?.[0]?.value || `pharmacy-${index}`;
}

/**
 * Search form component for finding pharmacies
 */
interface SearchFormProps {
  readonly onSearch: (formData: FormData) => void;
  readonly searching: boolean;
  readonly renderBeforeSearchButton?: ReactNode;
  readonly placeholders: Required<PharmacySearchFieldPlaceholders>;
}

function SearchForm({ onSearch, searching, renderBeforeSearchButton, placeholders }: SearchFormProps): JSX.Element {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSearch(formData);
      }}
    >
      <div className="flex flex-col gap-4">
        <FormSection htmlFor="name">
          <FormSectionLabel>Pharmacy Name</FormSectionLabel>
          <Input id="name" name="name" placeholder={placeholders.name} />
        </FormSection>
        <div className="flex flex-nowrap gap-4 *:flex-1">
          <FormSection htmlFor="city">
            <FormSectionLabel>City</FormSectionLabel>
            <Input id="city" name="city" placeholder={placeholders.city} />
          </FormSection>
          <FormSection htmlFor="state">
            <FormSectionLabel>State</FormSectionLabel>
            <Input id="state" name="state" placeholder={placeholders.state} />
          </FormSection>
        </div>
        <div className="flex flex-nowrap gap-4 *:flex-1">
          <FormSection htmlFor="zip">
            <FormSectionLabel>Zip Code</FormSectionLabel>
            <Input id="zip" name="zip" placeholder={placeholders.zip} />
          </FormSection>
          <FormSection htmlFor="phoneOrFax">
            <FormSectionLabel>Phone or Fax</FormSectionLabel>
            <Input id="phoneOrFax" name="phoneOrFax" placeholder={placeholders.phoneOrFax} />
          </FormSection>
        </div>
        <FormSection htmlFor="address">
          <FormSectionLabel>Address</FormSectionLabel>
          <Input id="address" name="address" placeholder={placeholders.address} />
        </FormSection>
        <FormSection htmlFor="ncpdpID">
          <FormSectionLabel>NCPDP ID</FormSectionLabel>
          <Input id="ncpdpID" name="ncpdpID" placeholder={placeholders.ncpdpID} />
        </FormSection>

        {renderBeforeSearchButton}

        <Button type="submit" disabled={searching}>
          {searching && <Spinner />}
          Search
        </Button>
      </div>
    </form>
  );
}

/**
 * Individual pharmacy item in search results
 */
interface PharmacyItemProps {
  readonly pharmacy: Organization;
  readonly pharmacyKey: string;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

function PharmacyItem({ pharmacy, pharmacyKey, isSelected, onSelect }: PharmacyItemProps): JSX.Element {
  return (
    <div
      key={pharmacyKey}
      className={cn(
        'cursor-pointer rounded-md p-3 transition-[border-color,box-shadow] duration-200',
        isSelected ? 'border-2 border-blue-600' : 'border border-gray-300 hover:border-blue-400'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        <RadioGroupItem value={pharmacyKey} id={`pharmacy-${pharmacyKey}`} />
        <Label htmlFor={`pharmacy-${pharmacyKey}`} onClick={onSelect}>
          <div>
            <p className="text-sm font-medium">{pharmacy.name}</p>
            {pharmacy.address?.[0] && (
              <p className="text-xs text-muted-foreground">{formatAddress(pharmacy.address[0])}</p>
            )}
            {pharmacy.telecom?.find((t) => t.system === 'phone') && (
              <p className="text-xs text-muted-foreground">
                Phone: {pharmacy.telecom.find((t) => t.system === 'phone')?.value}
              </p>
            )}
            {pharmacy.telecom?.find((t) => t.system === 'fax') && (
              <p className="text-xs text-muted-foreground">
                Fax: {pharmacy.telecom.find((t) => t.system === 'fax')?.value}
              </p>
            )}
          </div>
        </Label>
      </div>
    </div>
  );
}

/**
 * Search results section with pharmacy list and action buttons
 */
interface SearchResultsProps {
  readonly searchResults: Organization[];
  readonly selectedPharmacy: Organization | undefined;
  readonly onSelectPharmacy: (pharmacy: Organization) => void;
  readonly setAsPrimary: boolean;
  readonly onSetAsPrimary: (value: boolean) => void;
  readonly onAddFavorite: () => void;
  readonly onClose: () => void;
  readonly adding: boolean;
}

function SearchResults({
  searchResults,
  selectedPharmacy,
  onSelectPharmacy,
  setAsPrimary,
  onSetAsPrimary,
  onAddFavorite,
  onClose,
  adding,
}: SearchResultsProps): JSX.Element {
  return (
    <div className="mt-8">
      <p className="mb-4 font-semibold">Search Results ({searchResults.length})</p>
      <RadioGroup
        value={selectedPharmacy ? getPharmacyKey(selectedPharmacy, searchResults.indexOf(selectedPharmacy)) : ''}
        onValueChange={(value) => {
          const selected = searchResults.find((p, i) => getPharmacyKey(p, i) === value);
          if (selected) {
            onSelectPharmacy(selected);
          }
        }}
      >
        <div className="flex flex-col gap-3">
          {searchResults.map((pharmacy, index) => {
            const pharmacyKey = getPharmacyKey(pharmacy, index);
            const isSelected = selectedPharmacy
              ? getPharmacyKey(selectedPharmacy, searchResults.indexOf(selectedPharmacy)) === pharmacyKey
              : false;

            return (
              <PharmacyItem
                key={pharmacyKey}
                pharmacy={pharmacy}
                pharmacyKey={pharmacyKey}
                isSelected={isSelected}
                onSelect={() => onSelectPharmacy(pharmacy)}
              />
            );
          })}
        </div>
      </RadioGroup>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Field orientation="horizontal">
          <Checkbox
            id="set-as-primary"
            checked={setAsPrimary}
            onCheckedChange={(checked) => onSetAsPrimary(checked === true)}
          />
          <FieldLabel htmlFor="set-as-primary">Set as primary pharmacy</FieldLabel>
        </Field>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAddFavorite} disabled={!selectedPharmacy || adding}>
            {adding && <Spinner />}
            Add to Favorites
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a dialog for searching and adding pharmacies to a patient's favorites.
 * This is a generic component that accepts search and add callbacks.
 * @param props - The dialog props.
 * @returns The pharmacy dialog component.
 */
export function PharmacyDialog(props: PharmacyDialogProps): JSX.Element {
  const {
    patient,
    onSubmit,
    onClose,
    onSearch,
    onAddToFavorites,
    renderBeforeSearchButton,
    getExtraSearchParams,
    searchPlaceholders,
  } = props;

  const placeholders = useMemo<Required<PharmacySearchFieldPlaceholders>>(
    () => ({ ...DEFAULT_SEARCH_PLACEHOLDERS, ...searchPlaceholders }),
    [searchPlaceholders]
  );

  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Organization | undefined>();
  const [setAsPrimary, setSetAsPrimary] = useState(false);
  const [adding, setAdding] = useState(false);

  const selectPharmacy = useCallback((pharmacy: Organization | undefined) => {
    flushSync(() => {
      setSelectedPharmacy(pharmacy);
    });
  }, []);

  const handleSearch = useCallback(
    async (formData: FormData) => {
      const searchParams: PharmacySearchParams = {
        name: (formData.get('name') as string) || undefined,
        city: (formData.get('city') as string) || undefined,
        state: (formData.get('state') as string) || undefined,
        zip: (formData.get('zip') as string) || undefined,
        address: (formData.get('address') as string) || undefined,
        phoneOrFax: (formData.get('phoneOrFax') as string) || undefined,
        ncpdpID: (formData.get('ncpdpID') as string) || undefined,
      };

      // Remove empty values
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, v]) => typeof v === 'string' && v.trim() !== '')
      ) as PharmacySearchParams;

      const extraParams = getExtraSearchParams?.() ?? {};
      const mergedParams = { ...cleanParams, ...extraParams };

      const hasTextCriteria = Object.keys(cleanParams).length > 0;
      const hasExtraCriteria = Object.entries(extraParams).some(([, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== '';
      });

      if (!hasTextCriteria && !hasExtraCriteria) {
        notify.show({
          color: 'yellow',
          title: 'Search Required',
          message: 'Please enter at least one search criterion',
        });
        return;
      }

      setSearching(true);
      selectPharmacy(undefined);
      try {
        const results = await onSearch(mergedParams);
        setSearchResults(results);
        if (results.length === 0) {
          notify.show({
            color: 'blue',
            title: 'No Results',
            message: 'No pharmacies found matching your search criteria',
          });
        }
      } catch (error) {
        notify.show({
          color: 'red',
          title: 'Search Error',
          message: normalizeErrorString(error),
        });
      } finally {
        setSearching(false);
      }
    },
    [getExtraSearchParams, onSearch, selectPharmacy]
  );

  const handleAddFavorite = useCallback(async () => {
    if (!selectedPharmacy || !patient.id) {
      return;
    }

    setAdding(true);
    try {
      const response = await onAddToFavorites({
        patientId: patient.id,
        pharmacy: selectedPharmacy,
        setAsPrimary,
      });

      if (response.success) {
        notify.show({
          color: 'green',
          title: 'Success',
          message: response.message,
        });
        // Return the persisted Organization if available, otherwise the selected one
        onSubmit(response.organization || selectedPharmacy);
      } else {
        notify.show({
          color: 'red',
          title: 'Error',
          message: response.message,
        });
      }
    } catch (error) {
      notify.show({
        color: 'red',
        title: 'Error',
        message: normalizeErrorString(error),
      });
    } finally {
      setAdding(false);
    }
  }, [selectedPharmacy, patient.id, setAsPrimary, onAddToFavorites, onSubmit]);

  return (
    <div>
      <SearchForm
        onSearch={(formData) => handleSearch(formData).catch(console.error)}
        searching={searching}
        renderBeforeSearchButton={renderBeforeSearchButton}
        placeholders={placeholders}
      />

      {searching && (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      )}

      {searchResults.length > 0 && !searching && (
        <SearchResults
          searchResults={searchResults}
          selectedPharmacy={selectedPharmacy}
          onSelectPharmacy={selectPharmacy}
          setAsPrimary={setAsPrimary}
          onSetAsPrimary={setSetAsPrimary}
          onAddFavorite={handleAddFavorite}
          onClose={onClose}
          adding={adding}
        />
      )}
    </div>
  );
}
