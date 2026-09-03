// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SmartAppLaunchLink/SmartAppLaunchLink.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { notify } from '@/lib/medplum/notify';
import { cn } from '@/lib/utils';
import { ensureTrailingSlash, normalizeErrorString } from '@medplum/core';
import type { ClientApplication, Encounter, Patient, Reference, SmartAppLaunch } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import type { ComponentProps, JSX, ReactNode } from 'react';

export interface SmartAppLaunchLinkProps extends ComponentProps<'a'> {
  readonly client: ClientApplication;
  readonly patient?: Reference<Patient>;
  readonly encounter?: Reference<Encounter>;
  readonly fhirContext?: Reference[];
  readonly children?: ReactNode;
}

export function SmartAppLaunchLink(props: SmartAppLaunchLinkProps): JSX.Element | null {
  const medplum = useMedplum();
  const { client, patient, encounter, fhirContext, children, className, ...rest } = props;
  const patientResource = useResource(patient);
  const encounterResource = useResource(encounter);

  function launchApp(): void {
    // Build the patient reference, potentially including an identifier
    let patientRef: Reference<Patient> | undefined = patient;
    let encounterRef: Reference<Encounter> | undefined = encounter;

    if (client.launchIdentifierSystems?.length) {
      // Find patient identifier system configuration
      const patientIdentifierConfig = client.launchIdentifierSystems.find(
        (config) => config.resourceType === 'Patient'
      );
      if (patientRef && patientResource && patientIdentifierConfig?.system) {
        const identifier = patientResource.identifier?.find((i) => i.system === patientIdentifierConfig.system);
        if (identifier) {
          // Include both the reference and the identifier in the patient reference
          patientRef = {
            ...patient,
            identifier: identifier,
          };
        }
      }

      // Find encounter identifier system configuration
      const encounterIdentifierConfig = client.launchIdentifierSystems.find(
        (config) => config.resourceType === 'Encounter'
      );
      if (encounterRef && encounterResource && encounterIdentifierConfig?.system) {
        const identifier = encounterResource.identifier?.find((i) => i.system === encounterIdentifierConfig.system);
        if (identifier) {
          encounterRef = {
            ...encounter,
            identifier: identifier,
          };
        }
      }
    }

    medplum
      .createResource<SmartAppLaunch>({
        resourceType: 'SmartAppLaunch',
        patient: patientRef,
        encounter: encounterRef,
        fhirContext,
      })
      .then((result) => {
        const url = new URL(client.launchUri as string);
        url.searchParams.set('iss', ensureTrailingSlash(medplum.fhirUrl().toString()));
        url.searchParams.set('launch', result.id);
        window.open(url.toString(), '_blank');
      })
      .catch((err) => notify.show({ color: 'red', message: normalizeErrorString(err), autoClose: false }));
  }

  return (
    <a
      className={cn('cursor-pointer text-primary underline-offset-4 hover:underline', className)}
      onClick={() => launchApp()}
      {...rest}
    >
      {children}
    </a>
  );
}
