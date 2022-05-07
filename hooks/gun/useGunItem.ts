
import { GunMessagePut } from "gun";
import { useEffect, useRef, useState } from "react";
import { getGun, useGun } from "./useGun";

export const useGunItem = <T>(id: string) => {
    const gun = useGun()
    const currentListener = useRef(0)

    const [value, setValue] = useState<T | undefined>(() => getCachedGunItem<T>(id));

    useEffect(() => {
        const target = gun?.get("root").get(id);

        const thisListener = ++currentListener.current
        currentListener.current = thisListener;

        console.log("subscribing", target)

        target?.on((data, key, _msg, _ev) => {
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
    }, [id, gun]);

    return { item: value, gun };
}

export const getGunItem = async <T>(id: string) => {
    const gun = getGun();
    const target = gun.get("root").get(id);
    const item = await new Promise<T>((resolve, reject) => {
        target.once((data, key) => {
            console.log("Got data", data, key);
            resolve(data);
        });
    })

    return item
}

export const getCachedGunItem = <T>(id: string) => {
    const gun = getGun();
    const target = gun.get("root").get(id);
    let item;

    // .once calls back synchronous, if the item is cached.
    target.once((data) => {
        item = data;
    });
    target.off();


    return item
}

export const setGunItem = async <T>(id: string, data: T) => {
    const gun = getGun();
    const target = gun?.get("root").get(id);
    await new Promise<void>((resolve, reject) => {
        target.put(data, (ack: GunMessagePut & { err?: string }) => {
            if (ack.err) {
                reject(new Error(ack.err))
                return
            }
            resolve()
        });
    })
}
