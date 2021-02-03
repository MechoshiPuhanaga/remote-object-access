import EVENTS from "./events";

const createConsumer = ({ channel, transformer }) => {
  const consumer = (objectName) => {
    return new Promise((resolve, reject) => {
      // Request the remote object:
      channel.emit(objectName);

      channel.on(`${objectName}-success`, (description) => {
        const proxy = new Proxy(
          {},
          {
            get: (_, prop) => {
              // Used in dispose:
              if (prop === "id") {
                return objectName;
              }

              // If calling a function:
              if (description[prop] === "function") {
                return new Proxy(() => {}, {
                  apply: (_, __, argumentsList) => {
                    return new Promise((resolve, reject) => {
                      channel.emit(EVENTS.CALL_FUNCTION, {
                        funcName: prop,
                        argumentsList,
                      });

                      channel.on(EVENTS.CALL_FUNCTION_SUCCESS, resolve);
                      channel.on(EVENTS.CALL_FUNCTION_ERROR, () =>
                        reject(`${prop} is not a function`)
                      );

                      // If the returned value is another function:
                      channel.on(EVENTS.GET_CACHED_FUNCTION, (funcName) => {
                        const functionProxy = new Proxy(() => {}, {
                          apply: (_, __, argumentsList) => {
                            return new Promise((resolve, reject) => {
                              channel.emit(EVENTS.CALL_CACHED_FUNCTION, {
                                funcName,
                                argumentsList,
                              });

                              channel.on(
                                EVENTS.CALL_CACHED_FUNCTION_SUCCESS,
                                resolve
                              );
                              channel.on(
                                EVENTS.CALL_CACHED_FUNCTION_ERROR,
                                (error) => reject(error)
                              );
                            });
                          },
                        });

                        // Used when disposing the function:
                        functionProxy.id = funcName;
                        functionProxy.type = "function";

                        resolve(functionProxy);
                      });
                    });
                  },
                });
              } else {
                return new Promise((resolve, reject) => {
                  channel.emit(EVENTS.GET_PROPERTY, prop);
                  channel.on(EVENTS.GET_PROPERTY_SUCCESS, (data) =>
                    resolve(transformer.onReceive(data))
                  );
                  channel.on(EVENTS.GET_PROPERTY_ERROR, reject);
                });
              }
            },
            set: (_, propName, value) => {
              return new Promise((resolve, reject) => {
                channel.emit(EVENTS.SET_PROPERTY, {
                  propName,
                  value: transformer.onEmit(value),
                });
                channel.on(EVENTS.SET_PROPERTY_SUCCESS, resolve);
                channel.on(EVENTS.SET_PROPERTY_ERROR, reject);
              });
            },
          }
        );

        // Used for disposing the object:
        proxy.id = objectName;

        resolve(proxy);
      });

      channel.on(`${objectName}-error`, reject);
    });
  };

  // Clean cached remote functions:
  const dispose = (remoteItem) => {
    if (!remoteItem) {
      return;
    }

    return new Promise((resolve, reject) => {
      if (remoteItem.type === "function") {
        channel.emit(EVENTS.DISPOSE_FUNCTION, remoteItem.id);
        channel.on(EVENTS.DISPOSE_FUNCTION_SUCCESS, resolve);
      } else {
        channel.emit(EVENTS.DISPOSE_OBJECT, remoteItem.id);
        channel.on(EVENTS.DISPOSE_OBJECT_SUCCESS, resolve);
      }
    });
  };

  return {
    consumer,
    dispose,
  };
};

export default createConsumer;
