const g = `# yaml-language-server: $schema=node_modules/@sdeverywhere/check-core/schema/check.schema.json

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
  "../../../../../stock-flow-version31.check.yaml": g
}), y = [];
for (const s of Object.keys(f)) {
  const a = f[s];
  y.push(a);
}
const k = /* @__PURE__ */ new Map([
  // ['Model_old_name', 'Model_new_name']
]);
async function w(s, a, t) {
  let c;
  if (s && s.version === a.version) {
    const u = _(s, a);
    c = {
      baseline: {
        name: (t == null ? void 0 : t.bundleNameL) || "baseline",
        bundle: s
      },
      thresholds: [1, 5, 10],
      specs: [u],
      datasets: {
        renamedDatasetKeys: k
      }
    };
  }
  return {
    current: {
      name: (t == null ? void 0 : t.bundleNameR) || "current",
      bundle: a
    },
    check: {
      tests: y
    },
    comparison: c
  };
}
function _(s, a) {
  const t = /* @__PURE__ */ new Set(), c = (n, i) => {
    for (const e of n.modelSpec.inputVars.values())
      t.add(e.inputId), i.set(e.inputId, e);
  }, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  c(s, u), c(a, d);
  const l = [];
  l.push({
    kind: "scenario-with-all-inputs",
    id: "all_inputs_at_default",
    title: "All inputs",
    subtitle: "at default",
    position: "default"
  });
  const m = (n, i) => {
    var h;
    const e = u.get(n), o = d.get(n);
    if (e === void 0 || o === void 0)
      return;
    if (i === "min") {
      if (e.minValue === e.defaultValue && o.minValue === o.defaultValue)
        return;
    } else if (e.maxValue === e.defaultValue && o.maxValue === o.defaultValue)
      return;
    const p = o || e, r = (h = p.relatedItem) == null ? void 0 : h.locationPath, v = r ? r[r.length - 1] : p.varName;
    l.push({
      kind: "scenario-with-inputs",
      id: `id_${n}_at_${i}`,
      title: v,
      subtitle: `at ${i}`,
      inputs: [
        {
          kind: "input-at-position",
          inputName: `id ${n}`,
          position: i
        }
      ]
    });
  }, b = [...t];
  for (const n of b)
    m(n, "min"), m(n, "max");
  return {
    scenarios: l,
    scenarioGroups: [],
    viewGroups: []
  };
}
export {
  w as getConfigOptions
};
