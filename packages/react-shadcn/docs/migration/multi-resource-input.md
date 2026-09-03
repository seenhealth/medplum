# MultiResourceInput migration

`MultiResourceInputProps` is unchanged. `DefaultResourceItemComponent` still receives `AsyncAutocompleteOption<Resource>`.

| Upstream                                                                                       | Port                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mantine `Group wrap="nowrap"` + `Text` / `Text size="xs" c="dimmed"` around `ResourceAvatar`   | `div` + `div`/`div` with `flex flex-nowrap items-center gap-2` and `text-xs text-muted-foreground`                                                                              |
| Default selected-value UI from `AsyncAutocomplete` (`Pill` with a label span + remove sibling) | `pillComponent` renders the same sibling shape (`span` label + remove `button`) so the ResourceInput clear-button query (`parentElement.childNodes[1]`) still finds the control |
