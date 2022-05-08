
import { GunMessagePut, IGunChain } from "gun";
import { useEffect, useRef, useState } from "react";
import { getGun, useGun } from "./useGun";

export const useGunElements = <T>(chain?: IGunChain<any>) => {
    const currentListener = useRef(0)

    const [value, setValue] = useState<Record<string, T | undefined> | undefined>(() => (chain && getCachedGunElements<T>(chain)));

    useEffect(() => {

        const thisListener = ++currentListener.current
        currentListener.current = thisListener;

        console.log("subscribing", chain)

        chain?.on((data, key, _msg, _ev) => {
            console.log(`(${thisListener}) Got data`, data, key);
            if (currentListener.current !== thisListener) {
                _ev.off();
                return;
            }
            console.log("parrot")
            setValue(items => data ?
                (items ? { ...items, [key]: data } : { [key]: data }) :
                items ? (() => { return Object.fromEntries(Object.entries(items).filter(([oldKey, value]) => key !== oldKey)) })() : {}
            );
        });

        return () => {
            console.log("unsubscribing")
            // gun.off is quite broken, as it sometimes breaks all listeners for this object
            //target?.off();
        }
    }, [chain?._.$]);
    console.log("VALUE:", value)
    return value;
}

export const useGunElement = <T>(chain?: IGunChain<any>) => {
    const currentListener = useRef(0)

    const [value, setValue] = useState<T | undefined>(() => chain && getCachedGunElement<T>(chain));

    useEffect(() => {

        const thisListener = ++currentListener.current
        currentListener.current = thisListener;

        console.log("subscribing", chain)

        chain?.on((data, key, _msg, _ev) => {
            console.log(`(${thisListener}) Got data`, data, key);
            if (currentListener.current !== thisListener) {
                _ev.off();
                return;
            }
            setValue(data);
        });

        return () => {
            console.log("unsubscribing")
            // gun.off is quite broken, as it sometimes breaks all listeners for this object
            //target?.off();
        }
    }, [chain?._.$]);

    return value;
}


export const getGunElement = async <T>(chain: IGunChain<any>) => {
    const item = await new Promise<T>((resolve, reject) => {
        chain.once((data, key) => {
            console.log("Got data", data, key);
            resolve(data);
        });
    })

    return item
}

export const getCachedGunElements = <T>(chain: IGunChain<any>) => {
    // .once calls back synchronous, if the item is cached.
    const items: Record<string, T> = {}
    chain.once((data, key) => {
        items[key] = data;
    });

    return Object.keys(items).length ? items : undefined;
}

export const getCachedGunElement = <T>(chain: IGunChain<any>) => {
    let item;

    // .once calls back synchronous, if the item is cached.
    chain.once((data) => {
        item = data;
    });

    return item
}

export const setGunElement = async <T>(chain: IGunChain<any>, data: T) => {
    await new Promise<void>((resolve, reject) => {
        chain.put(data, (ack: GunMessagePut & { err?: string }) => {
            if (ack.err) {
                reject(new Error(ack.err))
                return
            }
            resolve()
        });
    })
}
