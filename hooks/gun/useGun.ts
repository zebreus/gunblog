import type { GunOptions, GunSchema, IGunInstance } from "gun";
import Gun from "gun/gun";
import { useEffect } from "react";
import { getGlobalState, setGlobalState, useGlobalState } from "../useGlobalState";

// Gun need some extra modules, if it is running in node
if (typeof window === "undefined") {
    import('gun/lib/store');
    // @ts-expect-error
    import('gun/lib/rfs');
    // @ts-expect-error
    import('gun/lib/rs3');
    // @ts-expect-error
    import('gun/lib/wire');
}

//TODO: Remove global debugging gun
declare global {
    interface Window {
        gun?: IGunInstance<any>;
    }
}

const defaultGunOptions = { radisk: false, localStorage: false, peers: ["http://localhost:8765/gun"] };

/** Use the gun object configured with the given options. If it does not exists, one will be created. */
export const useGun = <Type extends Record<string, GunSchema> = any>(options: GunOptions = defaultGunOptions) => {
    const gunId = JSON.stringify(options);
    const [gun, setGun] = useGlobalState<IGunInstance<Type>>("guns", gunId, () => {
        // Gun will modify the options, so we create a deep copy this way
        const newGun = new Gun<Type>(JSON.parse(JSON.stringify(options)))
        if (typeof window !== "undefined") window.gun = newGun
        return newGun
    });

    useEffect(() => {
        setGun(prevState => {
            // Gun will modify the options, so we create a deep copy this way
            const newGun = prevState || gun || new Gun<Type>(JSON.parse(JSON.stringify(options)))
            if (typeof window !== "undefined") window.gun = newGun
            return newGun
        })
    }, [gun, gunId, setGun, options])

    return gun
}

/** Get the gun object configured with the given options. If it does not exists, one will be created. */
export const getGun = <TNode extends Record<string, GunSchema> = any>(options: GunOptions = defaultGunOptions) => {
    const gunId = JSON.stringify(options);
    const gun = getGlobalState<IGunInstance<any>>("guns", gunId);

    if (!gun) {
        setGlobalState<IGunInstance<any>>("guns", gunId, prevState => {
            // Gun will modify the options, so we create a deep copy this way
            const newGun = prevState || new Gun<TNode>(JSON.parse(JSON.stringify(options)));
            if (typeof window !== "undefined") window.gun = newGun
            return newGun
        })
        const newGun = getGlobalState<IGunInstance<any>>("guns", gunId) as IGunInstance<any>;
        return newGun
    }

    return gun
}

export const clearGun = (options: GunOptions = defaultGunOptions) => {
    const gunId = JSON.stringify(options);

    setGlobalState<undefined>("guns", gunId, () => undefined)
}