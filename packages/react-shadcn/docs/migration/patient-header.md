# patient-header

Upstream `PatientHeader` passed Mantine presentation onto already-ported children.

| Upstream                                                        | Port                                                                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `<ResourceAvatar size="lg" color={getDefaultColor(patient)} />` | `<ResourceAvatar size="lg" className={…} />` — `blue` → `bg-blue-100 text-blue-800`, `pink` → `bg-pink-100 text-pink-800` |
| `<MedplumLink fw={500}>`                                        | `<MedplumLink className="font-medium">`                                                                                   |

`getDefaultColor` is unchanged (`'blue'` / `'pink'` / `undefined`).
