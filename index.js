window.onload = async () => {
  if (
    typeof createConsumer !== "function" ||
    typeof transformer !== "object" ||
    typeof io !== "function"
  ) {
    return;
  }

  const socket = io();

  const { consumer, dispose } = createConsumer({
    channel: socket,
    transformer,
  });

  let remoteObject = null;

  try {
    remoteObject = await consumer("remoteObject");
    console.log(await remoteObject.fieldA);
    await (remoteObject.fieldA = "b");
    console.log(await remoteObject.fieldA);
    console.log(await remoteObject.fieldB);
    console.log("123".match(await remoteObject.fieldC));
    console.log(await remoteObject.someMethod(5));
    const remoteFunction = await remoteObject.someMethodReturningAFunction();
    console.log(await remoteFunction(5));
    await dispose(remoteFunction);
    console.log(await remoteObject.objectProp);
    console.log(await remoteObject.undefinedProp);
    console.log(typeof (await remoteObject.symbolProp));
    console.log(await remoteObject.bigIntProp);
    await dispose(remoteObject);
    console.log(await remoteObject.fieldA);
  } catch (error) {
    console.error(error);
    remoteObject = await consumer("remoteObject");
    console.log(await remoteObject.fieldA);
  }
};
