import { Dispatch, useCallback, useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"

const globalMap: Record<string, Record<string, unknown>> = {}

/**
 * Get a global value by map and key
 *
 * @param map The name of the map that contains the value
 * @param key The key of the map that contains the value
 * @returns The value or undefined
 */
export function getGlobalState<Type>(map: string, key: string) {
  return globalMap[map]?.[key] as Type | undefined
}

/**
 * Set a global value by map and key.
 * Does nothing, if newValue is equal to the current value.
 * Will trigger all useGlobalValue hooks with the same map and key
 *
 * @param map The name of the map that contains the value
 * @param key The key of the map that contains the value
 * @param newValue The new value.
 */
export function setGlobalState<T>(map: string, key: string, newValue: SetValueAction<T>) {
  const oldValue = globalMap[map]?.[key] as T | undefined
  const realNewValue = typeof newValue === "function" ? newValue(oldValue) : newValue

  if (oldValue === realNewValue) {
    return
  }
  if (!globalMap[map]) {
    globalMap[map] = {}
  }
  globalMap[map][key] = realNewValue
  if (!map.startsWith("_cb")) {
    console.log("aaa")
    const callbackMap = "_cb" + map
    const callbacks = getGlobalState<Array<(value: T) => void>>(callbackMap, key) || []
    // This function is recommended by the react team https://github.com/facebook/react/issues/16377
    unstable_batchedUpdates(() => callbacks.forEach(callback => callback(realNewValue)))
  }
}

// Callable things can only be set with a function, because of ambiguity
type SetValueAction<Type> = Type extends Function ? (prevState: Type) => Type : Type | ((prevState: Type) => Type)

/**
 * Listens to a global value addressed by map and key.
 * Works similar to useState, but all useGlobalValues with the same key on the same map share their data.
 *
 * @param map The name of the map that contains the value
 * @param key The key of the map that contains the value
 * @param defaultValue A default value that is used if no value is set for the map/key pair. The default value is not global
 * @returns An array with the value and a setter. If Type is a function type, this only takes a function, that produces a new value
 */
export function useGlobalState<Type>(
  map: string,
  key: string,
  defaultValue: Type | (() => Type)
): [Type, Dispatch<SetValueAction<Type>>]
export function useGlobalState<Type>(
  map: string,
  key: string,
  defaultValue?: Type | (() => (Type | undefined))
): [Type | undefined, Dispatch<SetValueAction<Type>>]
export function useGlobalState<Type>(
  map: string,
  key: string,
  defaultValue: Type | (() => (Type | undefined))
): [Type | undefined, Dispatch<SetValueAction<Type>>] {
  const [, setRealValue] = useState<Type | undefined>()
  const value = getGlobalState<Type>(map, key) || ((defaultValue instanceof Function) ? defaultValue() : defaultValue)

  const setter: Dispatch<SetValueAction<Type>> = useCallback(
    newValue => {
      if (typeof newValue === "function") {
        const oldValue = getGlobalState<Type>(map, key)
        setGlobalState(map, key, newValue(oldValue))
        return
      }
      setGlobalState(map, key, newValue)
    },
    [map, key]
  )

  useEffect(() => {
    const callbackMap = "_cb" + map

    const callback = (newValue: Type) => {
      console.log("callback called")
      setRealValue(newValue)
    }
    const addCallback = () => {
      //const callbacks = [...(getGlobalState<Array<(value: Type) => void>>(callbackMap, key) || []), callback]
      console.log(`Adding callback to ${callbackMap}/${key}`)
      setGlobalState<Array<typeof callback>>(callbackMap, key, callbacks => [...(callbacks ?? []), callback])
    }
    const removeCallback = () => {
      const callbacks =
        getGlobalState<Array<(value: Type) => void>>(callbackMap, key)?.filter(
          otherCallback => otherCallback !== callback
        ) || []
      setGlobalState(callbackMap, key, callbacks)
    }

    addCallback()
    return removeCallback
  }, [map, key])

  return [value, setter]
}
