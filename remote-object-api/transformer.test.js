import transformer from "./transformer";

test("transformer transforms the values in the expected way", () => {
  const testCases = [
    1,
    "a",
    /\d+/,
    { name: "Baby", surname: "Yoda" },
    Symbol.for("cat"),
    10n,
  ];

  testCases.forEach((value) => {
    expect(transformer.onReceive(transformer.onEmit(value))).toEqual(value);
  });
});
