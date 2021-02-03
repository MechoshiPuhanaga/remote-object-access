import createConsumer from "./consumer";
import createProvider from "./provider";
import transformer from "./transformer";

if (typeof window !== "undefined") {
  window.createConsumer = createConsumer;
  window.createProvider = createProvider;
  window.transformer = transformer;
}

export default {
  createConsumer,
  createProvider,
  transformer,
};
