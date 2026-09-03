# measure-report-display

Upstream: `packages/react/src/MeasureReportDisplay` (Mantine `RingProgress`, `Paper`, `SimpleGrid`). Port: `RingProgress` from `@/components/ui/ring-progress`, `Card`-style panels, CSS grid.

| Upstream                                                | Port                                                                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `MeasureReportDisplayProps`                             | unchanged                                                                                                        |
| internal `MeasureReportGroupDisplay` and `MeasureTitle` | now exported from `measure-report-group-display.tsx` so consumers can compose a single group; behavior unchanged |
