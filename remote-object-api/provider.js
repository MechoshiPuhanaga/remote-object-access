import EVENTS from "./events";
import { isFunction } from "./helpers";

const createProvider = ({ channel, transformer }) => {
  const objectsCache = {};
  const functionsCache = {};

  const provider = (objectName, requestedObject) => {
    channel.on(objectName, () => {
      objectsCache[objectName] = requestedObject;

      const remoteObject = objectsCache[objectName];

      if (remoteObject) {
        const description = Object.keys(remoteObject).reduce(
          (descriptionObject, key) => {
            descriptionObject[key] = typeof remoteObject[key];

            return descriptionObject;
          },
          {}
        );

        channel.emit(`${objectName}-success`, description);
      } else {
        channel.emit(`${objectName}-error`);
      }
    });

    channel.on(EVENTS.GET_PROPERTY, (propName) => {
      if (propName === "then") {
        return;
      }

      try {
        const property = objectsCache[objectName][propName];
        channel.emit(EVENTS.GET_PROPERTY_SUCCESS, transformer.onEmit(property));
      } catch (error) {
        channel.emit(EVENTS.GET_PROPERTY_ERROR, error.message);
      }
    });

    channel.on(EVENTS.CALL_FUNCTION, ({ funcName, argumentsList }) => {
      try {
        const func = objectsCache[objectName][funcName];

        if (isFunction(func)) {
          const result = func(...argumentsList);

          if (isFunction(result)) {
            functionsCache[funcName] = result;
            channel.emit(EVENTS.GET_CACHED_FUNCTION, funcName);
          } else {
            channel.emit(EVENTS.CALL_FUNCTION_SUCCESS, result);
          }
        } else {
          channel.emit(
            EVENTS.CALL_FUNCTION_ERROR,
            `${funcName} is not a function`
          );
        }
      } catch (error) {
        channel.emit(EVENTS.CALL_FUNCTION_ERROR, error.message);
      }
    });

    channel.on(EVENTS.CALL_CACHED_FUNCTION, ({ funcName, argumentsList }) => {
      const func = functionsCache[funcName];

      if (isFunction(func)) {
        channel.emit(
          EVENTS.CALL_CACHED_FUNCTION_SUCCESS,
          func(...argumentsList)
        );
      } else {
        channel.emit(
          EVENTS.CALL_CACHED_FUNCTION_ERROR,
          `Item returned by ${funcName}'s call is not a function`
        );
      }
    });

    channel.on(EVENTS.DISPOSE_FUNCTION, (id) => {
      delete functionsCache[id];
      channel.emit(EVENTS.DISPOSE_FUNCTION_SUCCESS);
    });

    channel.on(EVENTS.DISPOSE_OBJECT, (id) => {
      delete objectsCache[id];
      channel.emit(EVENTS.DISPOSE_OBJECT_SUCCESS);
    });

    channel.on(EVENTS.SET_PROPERTY, ({ propName, value }) => {
      try {
        objectsCache[objectName][propName] = transformer.onReceive(value);
        channel.emit(EVENTS.SET_PROPERTY_SUCCESS);
      } catch (error) {
        channel.emit(EVENTS.SET_PROPERTY_ERROR, error.message);
      }
    });
  };

  return provider;
};

export default createProvider;
