// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Aggregates the per-work-unit item lists. Each work unit adds its own file under registry/items/ so
// parallel ports never edit the same file; see registry/items/core.mjs for the field reference.
import { items as core } from './items/core.mjs';
import { items as pending } from './items/pending.mjs';
import { items as wu10 } from './items/wu-10.mjs';
import { items as wu11 } from './items/wu-11.mjs';
import { items as wu12 } from './items/wu-12.mjs';
import { items as wu13 } from './items/wu-13.mjs';
import { items as wu14 } from './items/wu-14.mjs';
import { items as wu15 } from './items/wu-15.mjs';
import { items as wu16 } from './items/wu-16.mjs';
import { items as wu17 } from './items/wu-17.mjs';
import { items as wu20a } from './items/wu-20a.mjs';
import { items as wu20b } from './items/wu-20b.mjs';
import { items as wu21 } from './items/wu-21.mjs';
import { items as wu22 } from './items/wu-22.mjs';
import { items as wu23 } from './items/wu-23.mjs';
import { items as wu24 } from './items/wu-24.mjs';
import { items as wu25 } from './items/wu-25.mjs';
import { items as wu27 } from './items/wu-27.mjs';
import { items as wu28 } from './items/wu-28.mjs';

export const items = [
  ...core,
  ...wu10,
  ...wu11,
  ...wu12,
  ...wu13,
  ...wu14,
  ...wu15,
  ...wu16,
  ...wu17,
  ...wu20a,
  ...wu20b,
  ...wu21,
  ...wu22,
  ...wu23,
  ...wu24,
  ...wu25,
  ...wu27,
  ...wu28,
  ...pending,
];
