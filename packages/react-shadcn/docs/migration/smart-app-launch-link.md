# smart-app-launch-link

Upstream: `packages/react/src/SmartAppLaunchLink/SmartAppLaunchLink.tsx` (`SmartAppLaunchLinkProps extends AnchorProps`). Port: native `<a>` plus behavior props.

| Upstream                                                            | Port                                                                                           |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `AnchorProps` (`fw`, `underline`, `c`, Mantine `size`, …)           | `ComponentProps<'a'>` (`className`, standard anchor attributes)                                |
| `client`, `patient`, `encounter`, `fhirContext`, `children`         | unchanged (behavior props)                                                                     |
| `showNotification({ color: 'red', message, autoClose: false })`     | `notify.show({ color: 'red', message, autoClose: false })` (`duration: Infinity` via `notify`) |
| `fhirContext` forwarded through the Mantine `...rest` onto `Anchor` | pulled out of the rest bag so it is not passed to the DOM                                      |

`fhirContext` is still accepted and sent on the created `SmartAppLaunch`; only the accidental DOM leak is gone.
