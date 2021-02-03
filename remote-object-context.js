const localVariable = 123;
const remoteObject = {
  fieldA: "a",
  fieldB: 1,
  fieldC: /\d+/,
  someMethod: (value = 0) => {
    return localVariable + value;
  },
  someMethodReturningAFunction: () => {
    return function (value) {
      return localVariable + value;
    };
  },
  objectProp: {
    name: "Baby",
    surname: "Yoda",
  },
  symbolProp: Symbol.for("cat"),
  bigIntProp: 10n,
};

module.exports = remoteObject;
