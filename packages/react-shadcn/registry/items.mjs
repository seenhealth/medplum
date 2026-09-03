// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Aggregates the per-work-unit item lists. Each work unit adds its own file under registry/items/ so
// parallel ports never edit the same file; see registry/items/core.mjs for the field reference.
import { items as core } from './items/core.mjs';

export const items = [...core];
