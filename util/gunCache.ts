import { FunctionComponent, useMemo } from "react";
import { getGun } from "../hooks/gun/useGun";

/** Wrap a React component to load the gun cache.
 *  You need to wrap the props in withExportCache and the page component in withImportCache.
 */
export function withImportCache<T>(
    child: FunctionComponent<T>
): FunctionComponent<{ gunjsCache: string } & T> {
    return props => {
        useMemo(() => importCache(props.gunjsCache), [props.gunjsCache]);
        return child(props)
    }
}

/** Wrap props to contain the gunjs cache. Should be used at the end of getStaticProps */
export function withExportCache<T>(props: T) {
    return { ...props, gunjsCache: exportCache() }
}

export function exportCache() {
    const gun = getGun();
    // @ts-expect-error: graph is only internal
    const cacheString = JSON.stringify(gun._.graph)
    console.log(cacheString)
    return cacheString
}

function assignDeep(cache: Record<string, unknown>, data: Record<string, unknown>) {
    const cacheKeys = Object.keys(cache);
    const dataEntries = Object.entries(data);
    dataEntries.forEach(([key, value]) => {
        if (!cacheKeys.find(v => v === "key")) {
            cache[key] = value
            return
        }
        if (value && typeof value === "object" && cache[key] && typeof cache[key] === "object") {
            assignDeep(cache[key] as Record<string, unknown>, value as Record<string, unknown>)
            return
        }
    })
}

export function importCache(newCache: string) {
    if (!newCache) {
        return
    }
    const gun = getGun();
    // @ts-expect-error: graph is only internal
    assignDeep(gun._.graph as Record<string, unknown>, JSON.parse(newCache))
}