import { resetContext } from 'kea'
import localStoragePlugin from 'kea-localstorage'
import { routerPlugin } from 'kea-router'
import { loadersPlugin } from 'kea-loaders'
import { windowValuesPlugin } from 'kea-window-values'
import { errorToast, identifierToHuman } from 'lib/utils'

export function initKea(): void {
    resetContext({
        plugins: [
            localStoragePlugin,
            windowValuesPlugin({ window: window }),
            routerPlugin,
            loadersPlugin({
                onFailure({ error, reducerKey, actionKey }: { error: any; reducerKey: string; actionKey: string }) {
                    // Toast if it's a fetch error or a specific API update error
                    if (
                        error?.message === 'Failed to fetch' || // Likely CORS headers errors (i.e. request failing without reaching Django)
                        (error?.status !== undefined && ![200, 201, 204].includes(error.status))
                    ) {
                        errorToast(
                            `Error on ${identifierToHuman(reducerKey)}`,
                            `Attempting to ${identifierToHuman(actionKey).toLowerCase()} returned an error:`,
                            error.status !== 0
                                ? error.detail
                                : "Check your internet connection and make sure you don't have an extension blocking our requests.",
                            error.code
                        )
                    }
                    console.error(error)
                    ;(window as any).Sentry?.captureException(error)
                },
            }),
        ],
    })
}