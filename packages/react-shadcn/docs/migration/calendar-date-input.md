# calendar-date-input

`CalendarDateInputProps` and the month-grid / `useDayRangeDrag` / `availableDates` / `earliestDate` / `range` logic are unchanged. CSS modules became Tailwind + `cva`; tests still match the `available` / `selected` / `inRange` / `rangeOpens` / `rangeCloses` class tokens.

| Upstream                                               | Port                                                                       |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| Mantine `Group` header                                 | `div` flex layout                                                          |
| Month nav `Button variant="outline"`                   | `Button variant="ghost" size="icon"`                                       |
| Day-cell `Button variant="light"` + CSS module classes | `Button variant="ghost"` + `dayButtonVariants` / `dayCellVariants` (`cva`) |
