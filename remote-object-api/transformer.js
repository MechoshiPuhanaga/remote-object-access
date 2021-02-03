export default {
  onEmit: (value) => {
    let type = typeof value;

    let newValue = value;

    switch (type) {
      case "bigint":
        newValue = value.toString();
        break;

      case "object":
        if (value instanceof RegExp) {
          newValue = value.toString();
          type = "regexp";
        }
        break;

      case "symbol":
        newValue = Symbol.keyFor(value);
        break;
    }

    return {
      type,
      value: newValue,
    };
  },
  onReceive: ({ type, value }) => {
    switch (type) {
      case "bigint":
        return BigInt(value);

      case "regexp":
        return new RegExp(value.slice(1, -1));

      case "symbol":
        return Symbol.for(value);

      default:
        return value;
    }
  },
};
