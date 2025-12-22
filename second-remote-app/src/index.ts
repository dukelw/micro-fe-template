if (process.env.NODE_ENV === "development") {
  import("./bootstrap").then(({ devMount }) => devMount());
}
