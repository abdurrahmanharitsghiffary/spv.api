import { error, success } from "./jsend";

const checkProperty = (
  response: any,
  fields: { key: string; value: any }[],
  status: "success" | "fail" | "error"
) => {
  if (status === "success") {
    expect(response).toHaveProperty("status", "success");
    fields.forEach((field) => {
      expect(response).toHaveProperty(field.key, field.value);
    });
  } else if (status === "fail") {
    expect(response).toHaveProperty("status", "fail");
    fields.forEach((field) => {
      expect(response).toHaveProperty(field.key, field.value);
    });
  } else {
    expect(response).toHaveProperty("status", "error");
    fields.forEach((field) => {
      expect(response).toHaveProperty(field.key, field.value);
    });
  }
};

test("Test 1", () => {
  const success1 = success(null);

  checkProperty(success1, [{ key: "data", value: null }], "success");
});

test("Test 1", () => {
  const success1 = success({
    loler: "kuntul",
    anjime: "loler",
  });

  //   expect(success1).toBe({
  //     status: "success",
  //     data: {
  //       loler: "kuntul",
  //       anjime: "loler",
  //     },
  //   });

  checkProperty(
    success1,
    [
      { key: "data.loler", value: "kuntul" },
      { key: "data.anjime", value: "loler" },
    ],
    "success"
  );
});

test("Test 1", () => {
  const success1 = success(undefined);
  checkProperty(success1, [{ key: "data", value: undefined }], "success");
});

test("Test error", () => {
  const error1 = error("Yahha hayuk");
  console.log(error1);
  checkProperty(error1, [{ key: "message", value: "Yahha hayuk" }], "error");
});

test("Test error", () => {
  const error1 = error("Yahha hayuk", 2050);
  checkProperty(
    error1,
    [
      { key: "message", value: "Yahha hayuk" },
      { key: "code", value: 2050 },
    ],
    "error"
  );
  console.log(error1);
});
