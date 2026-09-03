// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Aggregates the per-work-unit item lists. Each work unit adds its own file under registry/items/ so
// parallel ports never edit the same file; see registry/items/core.mjs for the field reference.
import { items as core } from './items/core.mjs';
import { items as wu10 } from './items/wu-10.mjs';
import { items as wu11 } from './items/wu-11.mjs';
import { items as wu12 } from './items/wu-12.mjs';
import { items as wu13 } from './items/wu-13.mjs';
import { items as wu14 } from './items/wu-14.mjs';
import { items as wu15 } from './items/wu-15.mjs';

export const items = [...core, ...wu10, ...wu11, ...wu12, ...wu13, ...wu14, ...wu15];
