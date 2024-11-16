const b = `# yaml-language-server: $schema=node_modules/@sdeverywhere/check-core/schema/check.schema.json

# NOTE: This is just a simple check to get you started.  Replace "Some output" with
# the name of some variable you'd like to test.  Additional tests can be developed
# in the "playground" (beta) inside the model-check report.
- describe: Some output
  tests:
    - it: should be > 0 for all input scenarios
      scenarios:
        - preset: matrix
      datasets:
        - name: Some output
      predicates:
        - gt: 0
`, v = `# yaml-language-server: $schema=node_modules/@sdeverywhere/check-core/schema/check.schema.json

# NOTE: This is just a simple check to get you started.  Replace "Some output" with
# the name of some variable you'd like to test.  Additional tests can be developed
# in the "playground" (beta) inside the model-check report.
- describe: Some output
  tests:
    - it: should be > 0 for all input scenarios
      scenarios:
        - preset: matrix
      datasets:
        - name: Some output
      predicates:
        - gt: 0
`, g = `# yaml-language-server: $schema=node_modules/@sdeverywhere/check-core/schema/check.schema.json

# NOTE: This is just a simple check to get you started.  Replace "Some output" with
# the name of some variable you'd like to test.  Additional tests can be developed
# in the "playground" (beta) inside the model-check report.
- describe: Some output
  tests:
    - it: should be > 0 for all input scenarios
      scenarios:
        - preset: matrix
      datasets:
        - name: Some output
      predicates:
        - gt: 0
`, w = `# yaml-language-server: $schema=node_modules/@sdeverywhere/check-core/schema/check.schema.json

# NOTE: This is just a simple check to get you started.  Replace "Some output" with
# the name of some variable you'd like to test.  Additional tests can be developed
# in the "playground" (beta) inside the model-check report.
- describe: Some output
  tests:
    - it: should be > 0 for all input scenarios
      scenarios:
        - preset: matrix
      datasets:
        - name: Some output
      predicates:
        - gt: 0
`, f = /* @__PURE__ */ Object.assign({
  "../../../../../stock-flow-version31.check.yaml": b,
  "../../../../../updated/Updated-stock-flow-v2.check.yaml": v,
  "../../../../../updated_2/Updated-stock-flow-v3.check.yaml": g,
  "../../../../../updated_test/Updated-stock-flow-v3.check.yaml": w
}), k = [];
for (const s of Object.keys(f)) {
  const a = f[s];
  k.push(a);
}
const S = /* @__PURE__ */ new Map([
  // ['Model_old_name', 'Model_new_name']
]);
async function V(s, a, t) {
  let c;
  if (s && s.version === a.version) {
    const l = j(s, a);
    c = {
      baseline: {
        name: (t == null ? void 0 : t.bundleNameL) || "baseline",
        bundle: s
      },
      thresholds: [1, 5, 10],
      specs: [l],
      datasets: {
        renamedDatasetKeys: S
      }
    };
  }
  return {
    current: {
      name: (t == null ? void 0 : t.bundleNameR) || "current",
      bundle: a
    },
    check: {
      tests: k
    },
    comparison: c
  };
}
function j(s, a) {
  const t = /* @__PURE__ */ new Set(), c = (n, o) => {
    for (const e of n.modelSpec.inputVars.values())
      t.add(e.inputId), o.set(e.inputId, e);
  }, l = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  c(s, l), c(a, d);
  const r = [];
  r.push({
    kind: "scenario-with-all-inputs",
    id: "all_inputs_at_default",
    title: "All inputs",
    subtitle: "at default",
    position: "default"
  });
  const m = (n, o) => {
    var h;
    const e = l.get(n), i = d.get(n);
    if (e === void 0 || i === void 0)
      return;
    if (o === "min") {
      if (e.minValue === e.defaultValue && i.minValue === i.defaultValue)
        return;
    } else if (e.maxValue === e.defaultValue && i.maxValue === i.defaultValue)
      return;
    const p = i || e, u = (h = p.relatedItem) == null ? void 0 : h.locationPath, _ = u ? u[u.length - 1] : p.varName;
    r.push({
      kind: "scenario-with-inputs",
      id: `id_${n}_at_${o}`,
      title: _,
      subtitle: `at ${o}`,
      inputs: [
        {
          kind: "input-at-position",
          inputName: `id ${n}`,
          position: o
        }
      ]
    });
  }, y = [...t];
  for (const n of y)
    m(n, "min"), m(n, "max");
  return {
    scenarios: r,
    scenarioGroups: [],
    viewGroups: []
  };
}
export {
  V as getConfigOptions
};
