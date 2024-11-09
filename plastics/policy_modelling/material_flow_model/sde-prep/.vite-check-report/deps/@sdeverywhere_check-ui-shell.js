import {
  require_assert_never
} from "./chunk-TXE6GINL.js";
import {
  require_ajv
} from "./chunk-SNXAAGME.js";
import {
  err,
  ok
} from "./chunk-YM6J6BRZ.js";
import {
  browser_default
} from "./chunk-JUCZWH7P.js";
import {
  require_fontfaceobserver_standalone
} from "./chunk-E2TJVGLP.js";
import {
  copyTextToClipboard
} from "./chunk-VCY2NOKE.js";
import {
  require_Chart
} from "./chunk-XOJYZOUK.js";
import {
  __toESM
} from "./chunk-PLDDJCW6.js";

// node_modules/@sdeverywhere/check-core/dist/index.js
var import_assert_never = __toESM(require_assert_never());
var import_assert_never2 = __toESM(require_assert_never());
var import_assert_never3 = __toESM(require_assert_never());
var import_ajv = __toESM(require_ajv());
var import_assert_never4 = __toESM(require_assert_never());
var import_assert_never5 = __toESM(require_assert_never());
var import_assert_never6 = __toESM(require_assert_never());
var import_assert_never7 = __toESM(require_assert_never());
var import_assert_never8 = __toESM(require_assert_never());
var import_ajv2 = __toESM(require_ajv());
var import_assert_never9 = __toESM(require_assert_never());
var import_assert_never10 = __toESM(require_assert_never());
var import_assert_never11 = __toESM(require_assert_never());
var import_assert_never12 = __toESM(require_assert_never());
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b2) => {
  for (var prop in b2 || (b2 = {}))
    if (__hasOwnProp.call(b2, prop))
      __defNormalProp(a, prop, b2[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b2)) {
      if (__propIsEnum.call(b2, prop))
        __defNormalProp(a, prop, b2[prop]);
    }
  return a;
};
var __spreadProps = (a, b2) => __defProps(a, __getOwnPropDescs(b2));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var TaskQueue = class {
  constructor(processor) {
    this.processor = processor;
    this.taskKeyQueue = [];
    this.taskMap = /* @__PURE__ */ new Map();
    this.processing = false;
    this.stopped = false;
  }
  addTask(key, input, onComplete) {
    if (this.stopped) {
      return;
    }
    if (this.taskMap.has(key)) {
      throw new Error(`Task already added for key ${key}`);
    }
    this.taskKeyQueue.push(key);
    this.taskMap.set(key, {
      input,
      onComplete
    });
    this.processTasksIfNeeded();
  }
  cancelTask(taskKey) {
    const index = this.taskKeyQueue.indexOf(taskKey);
    if (index >= 0) {
      this.taskKeyQueue.splice(index, 1);
    }
    this.taskMap.delete(taskKey);
  }
  shutdown() {
    this.stopped = true;
    this.processing = false;
    this.taskKeyQueue.length = 0;
    this.taskMap.clear();
  }
  processTasksIfNeeded() {
    if (!this.stopped && !this.processing) {
      this.processing = true;
      setTimeout(() => {
        this.processNextTask();
      });
    }
  }
  processNextTask() {
    return __async(this, null, function* () {
      var _a, _b;
      const taskKey = this.taskKeyQueue.shift();
      if (!taskKey) {
        return;
      }
      const task = this.taskMap.get(taskKey);
      if (task) {
        this.taskMap.delete(taskKey);
      } else {
        return;
      }
      let output;
      try {
        output = yield this.processor.process(task.input);
      } catch (e) {
        if (!this.stopped) {
          this.shutdown();
          (_a = this.onIdle) == null ? void 0 : _a.call(this, e);
        }
        return;
      }
      task.onComplete(output);
      if (this.taskKeyQueue.length > 0) {
        setTimeout(() => {
          this.processNextTask();
        });
      } else {
        this.processing = false;
        if (!this.stopped) {
          (_b = this.onIdle) == null ? void 0 : _b.call(this);
        }
      }
    });
  }
};
var CheckDataCoordinator = class {
  constructor(bundleModel) {
    this.bundleModel = bundleModel;
    this.taskQueue = new TaskQueue({
      process: (request) => __async(this, null, function* () {
        const result = yield this.bundleModel.getDatasetsForScenario(request.scenarioSpec, [request.datasetKey]);
        const dataset = result.datasetMap.get(request.datasetKey);
        return {
          dataset
        };
      })
    });
  }
  requestDataset(requestKey, scenarioSpec, datasetKey, onResponse) {
    const request = {
      scenarioSpec,
      datasetKey
    };
    this.taskQueue.addTask(requestKey, request, (response) => {
      onResponse(response.dataset);
    });
  }
  cancelRequest(key) {
    this.taskQueue.cancelTask(key);
  }
};
function symbolForPredicateOp(op) {
  switch (op) {
    case "gt":
      return ">";
    case "gte":
      return ">=";
    case "lt":
      return "<";
    case "lte":
      return "<=";
    case "eq":
      return "==";
    case "approx":
      return "≈";
    default:
      (0, import_assert_never2.default)(op);
  }
}
function buildCheckReport(checkPlan, checkResults) {
  const groupReports = [];
  for (const groupPlan of checkPlan.groups) {
    const testReports = [];
    for (const testPlan of groupPlan.tests) {
      let testStatus = "passed";
      const scenarioReports = [];
      for (const scenarioPlan of testPlan.scenarios) {
        let scenarioStatus = "passed";
        if (scenarioPlan.checkScenario.spec === void 0) {
          testStatus = "error";
          scenarioStatus = "error";
        }
        const datasetReports = [];
        for (const datasetPlan of scenarioPlan.datasets) {
          let datasetStatus = "passed";
          if (datasetPlan.checkDataset.datasetKey === void 0) {
            testStatus = "error";
            scenarioStatus = "error";
            datasetStatus = "error";
          }
          const predicateReports = [];
          for (const predicatePlan of datasetPlan.predicates) {
            const checkKey = predicatePlan.checkKey;
            const checkResult = checkResults.get(checkKey);
            if (checkResult) {
              if (checkResult.status !== "passed") {
                if (checkResult.status === "error") {
                  testStatus = "error";
                  scenarioStatus = "error";
                  datasetStatus = "error";
                } else if (checkResult.status === "failed" && testStatus !== "error") {
                  testStatus = "failed";
                  scenarioStatus = "failed";
                  datasetStatus = "failed";
                }
              }
              predicateReports.push(predicateReport(predicatePlan, checkKey, checkResult));
            } else {
              predicateReports.push(predicateReport(predicatePlan, checkKey, { status: "passed" }));
            }
          }
          datasetReports.push({
            checkDataset: datasetPlan.checkDataset,
            status: datasetStatus,
            predicates: predicateReports
          });
        }
        scenarioReports.push({
          checkScenario: scenarioPlan.checkScenario,
          status: scenarioStatus,
          datasets: datasetReports
        });
      }
      testReports.push({
        name: testPlan.name,
        status: testStatus,
        scenarios: scenarioReports
      });
    }
    groupReports.push({
      name: groupPlan.name,
      tests: testReports
    });
  }
  return {
    groups: groupReports
  };
}
function predicateReport(predicatePlan, checkKey, result) {
  if (result.status === "error") {
    return {
      checkKey,
      result,
      opRefs: /* @__PURE__ */ new Map(),
      opValues: []
    };
  }
  const predicateSpec = predicatePlan.action.predicateSpec;
  const opRefs = /* @__PURE__ */ new Map();
  const opValues = [];
  function addOp(op) {
    var _a, _b;
    const sym = symbolForPredicateOp(op);
    const predOp = predicateSpec[op];
    if (predOp !== void 0) {
      let opRef;
      let opValue;
      if (typeof predOp === "number") {
        const opConstantRef = {
          kind: "constant",
          value: predOp
        };
        opRef = opConstantRef;
        opValue = `${sym} ${predOp}`;
      } else {
        const dataRef = (_a = predicatePlan.dataRefs) == null ? void 0 : _a.get(op);
        if (!dataRef) {
          return;
        }
        const opDataRef = {
          kind: "data",
          dataRef
        };
        opRef = opDataRef;
        opValue = `${sym} '${dataRef.dataset.name}'`;
        const refScenarioSpec = (_b = dataRef.scenario) == null ? void 0 : _b.spec;
        if (!refScenarioSpec) {
          return;
        }
        if (predOp.scenario === "inherit") {
          opValue += ` (w/ same scenario)`;
        } else {
          if (refScenarioSpec.kind === "all-inputs" && refScenarioSpec.position === "at-default") {
            opValue += ` (w/ default scenario)`;
          } else {
            opValue += ` (w/ configured scenario)`;
          }
        }
      }
      if (op === "approx") {
        const tolerance = predicateSpec.tolerance || 0.1;
        opValue += ` ±${tolerance}`;
      }
      opRefs.set(op, opRef);
      opValues.push(opValue);
    }
  }
  addOp("gt");
  addOp("gte");
  addOp("lt");
  addOp("lte");
  addOp("eq");
  addOp("approx");
  if (opValues.length === 0) {
    opValues.push("INVALID PREDICATE");
  }
  return {
    checkKey,
    result,
    opRefs,
    opValues,
    time: predicateSpec.time,
    tolerance: predicateSpec.tolerance
  };
}
function scenarioMessage(scenario, bold) {
  const checkScenario = scenario.checkScenario;
  if (checkScenario.spec === void 0) {
    if (checkScenario.error) {
      switch (checkScenario.error.kind) {
        case "unknown-input-group":
          return `error: input group ${bold(checkScenario.error.name)} is unknown`;
        case "empty-input-group":
          return `error: input group ${bold(checkScenario.error.name)} is empty`;
        default:
          (0, import_assert_never.default)(checkScenario.error.kind);
      }
    } else {
      const badInputNames = checkScenario.inputDescs.filter((d) => d.inputVar === void 0).map((d) => bold(d.name));
      const label = badInputNames.length === 1 ? "input" : "inputs";
      return `error: unknown ${label} ${badInputNames.join(", ")}`;
    }
  }
  function positionName(position) {
    switch (position) {
      case "at-default":
        return "default";
      case "at-minimum":
        return "minimum";
      case "at-maximum":
        return "maximum";
      default:
        (0, import_assert_never.default)(position);
    }
  }
  function inputMessage(inputDesc) {
    let msg = bold(inputDesc.name);
    if (inputDesc.position) {
      msg += ` is at ${bold(positionName(inputDesc.position))}`;
      if (inputDesc.value !== void 0) {
        msg += ` (${inputDesc.value})`;
      }
    } else if (inputDesc.value !== void 0) {
      msg += ` is ${bold(inputDesc.value.toString())}`;
    }
    return msg;
  }
  if (checkScenario.spec.kind === "all-inputs") {
    const position = checkScenario.spec.position;
    return `when ${bold("all inputs")} are at ${bold(positionName(position))}...`;
  } else if (checkScenario.inputGroupName) {
    let position = "at-default";
    if (checkScenario.spec.settings[0].kind === "position") {
      position = checkScenario.spec.settings[0].position;
    }
    const groupName = checkScenario.inputGroupName;
    return `when all inputs in ${bold(groupName)} are at ${bold(positionName(position))}...`;
  } else {
    const inputMessages = checkScenario.inputDescs.map(inputMessage).join(" and ");
    return `when ${inputMessages}...`;
  }
}
function datasetMessage(dataset, bold) {
  const checkDataset = dataset.checkDataset;
  if (checkDataset.datasetKey === void 0) {
    return `error: ${bold(checkDataset.name)} did not match any datasets`;
  } else {
    return `then ${bold(checkDataset.name)}...`;
  }
}
function predicateMessage(predicate, bold) {
  const result = predicate.result;
  if (result.status === "error") {
    if (result.message) {
      return `error: ${predicate.result.message}`;
    } else if (result.errorInfo) {
      switch (result.errorInfo.kind) {
        case "unknown-dataset":
          return `error: referenced dataset ${bold(result.errorInfo.name)} is unknown`;
        case "unknown-input":
          return `error: referenced input ${bold(result.errorInfo.name)} is unknown`;
        case "unknown-input-group":
          return `error: referenced input group ${bold(result.errorInfo.name)} is unknown`;
        case "empty-input-group":
          return `error: referenced input group ${bold(result.errorInfo.name)} is empty`;
        default:
          (0, import_assert_never.default)(result.errorInfo.kind);
      }
    } else {
      return `unknown error`;
    }
  }
  const predicateParts = predicate.opValues.map(bold).join(" and ");
  let msg = `should be ${predicateParts}`;
  if (predicate.time !== void 0) {
    if (typeof predicate.time === "number") {
      msg += ` in ${bold(predicate.time.toString())}`;
    } else {
      let minTime;
      let maxTime;
      let minIncl;
      let maxIncl;
      if (Array.isArray(predicate.time)) {
        const timeSpec = predicate.time;
        minTime = timeSpec[0];
        maxTime = timeSpec[1];
        minIncl = true;
        maxIncl = true;
      } else {
        const timeSpec = predicate.time;
        if (timeSpec.after_excl !== void 0) {
          minTime = timeSpec.after_excl;
          minIncl = false;
        } else if (timeSpec.after_incl !== void 0) {
          minTime = timeSpec.after_incl;
          minIncl = true;
        }
        if (timeSpec.before_excl !== void 0) {
          maxTime = timeSpec.before_excl;
          maxIncl = false;
        } else if (timeSpec.before_incl !== void 0) {
          maxTime = timeSpec.before_incl;
          maxIncl = true;
        }
      }
      if (minTime !== void 0 && maxTime !== void 0) {
        const prefix = minIncl ? "[" : "(";
        const suffix = maxIncl ? "]" : ")";
        const range = `${prefix}${minTime}, ${maxTime}${suffix}`;
        msg += ` in ${bold(range)}`;
      } else if (minTime !== void 0) {
        const prefix = minIncl ? "in/after" : "after";
        msg += ` ${prefix} ${bold(minTime.toString())}`;
      } else if (maxTime !== void 0) {
        const prefix = maxIncl ? "in/before" : "before";
        msg += ` ${prefix} ${bold(maxTime.toString())}`;
      }
    }
  }
  if (predicate.result.status === "failed") {
    if (predicate.result.failValue !== void 0) {
      msg += ` but got ${bold(predicate.result.failValue.toString())}`;
      if (predicate.result.failRefValue !== void 0) {
        const failSym = symbolForPredicateOp(predicate.result.failOp);
        const refValue = `${failSym} ${predicate.result.failRefValue.toString()}`;
        msg += ` (expected ${bold(refValue)})`;
      }
    } else if (predicate.result.message) {
      msg += ` but got ${bold(predicate.result.message)}`;
    }
    if (predicate.result.failTime !== void 0) {
      msg += ` in ${bold(predicate.result.failTime.toString())}`;
    }
  } else if (predicate.result.status === "error" && predicate.result.message) {
    msg += ` but got error: ${bold(predicate.result.message)}`;
  }
  return msg;
}
var check_schema_default = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Model Check Test",
  type: "array",
  description: "A group of tests.",
  items: {
    $ref: "#/$defs/group"
  },
  $defs: {
    group: {
      type: "object",
      additionalProperties: false,
      properties: {
        describe: {
          type: "string"
        },
        tests: {
          type: "array",
          items: {
            $ref: "#/$defs/test"
          }
        }
      },
      required: ["describe", "tests"]
    },
    test: {
      type: "object",
      additionalProperties: false,
      properties: {
        it: {
          type: "string"
        },
        scenarios: {
          type: "array",
          items: {
            $ref: "#/$defs/scenario"
          },
          minItems: 1
        },
        datasets: {
          type: "array",
          items: {
            $ref: "#/$defs/dataset"
          },
          minItems: 1
        },
        predicates: {
          type: "array",
          items: {
            $ref: "#/$defs/predicate"
          },
          minItems: 1
        }
      },
      required: ["it", "datasets", "predicates"]
    },
    scenario: {
      oneOf: [
        { $ref: "#/$defs/scenario_with_input_at_position" },
        { $ref: "#/$defs/scenario_with_input_at_value" },
        { $ref: "#/$defs/scenario_with_multiple_input_settings" },
        { $ref: "#/$defs/scenario_with_inputs_in_preset_at_position" },
        { $ref: "#/$defs/scenario_with_inputs_in_group_at_position" },
        { $ref: "#/$defs/scenario_preset" },
        { $ref: "#/$defs/scenario_expand_for_each_input_in_group" }
      ]
    },
    scenario_position: {
      type: "string",
      enum: ["min", "max", "default"]
    },
    scenario_with_input_at_position: {
      type: "object",
      additionalProperties: false,
      properties: {
        with: {
          type: "string"
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["with", "at"]
    },
    scenario_with_input_at_value: {
      type: "object",
      additionalProperties: false,
      properties: {
        with: {
          type: "string"
        },
        at: {
          type: "number"
        }
      },
      required: ["with", "at"]
    },
    scenario_input_at_position: {
      type: "object",
      additionalProperties: false,
      properties: {
        input: {
          type: "string"
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["input", "at"]
    },
    scenario_input_at_value: {
      type: "object",
      additionalProperties: false,
      properties: {
        input: {
          type: "string"
        },
        at: {
          type: "number"
        }
      },
      required: ["input", "at"]
    },
    scenario_input_setting: {
      oneOf: [{ $ref: "#/$defs/scenario_input_at_position" }, { $ref: "#/$defs/scenario_input_at_value" }]
    },
    scenario_input_setting_array: {
      type: "array",
      items: {
        $ref: "#/$defs/scenario_input_setting"
      },
      minItems: 1
    },
    scenario_with_multiple_input_settings: {
      type: "object",
      additionalProperties: false,
      properties: {
        with: {
          $ref: "#/$defs/scenario_input_setting_array"
        }
      },
      required: ["with"]
    },
    scenario_with_inputs_in_preset_at_position: {
      type: "object",
      additionalProperties: false,
      properties: {
        with_inputs: {
          type: "string",
          enum: ["all"]
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["with_inputs", "at"]
    },
    scenario_with_inputs_in_group_at_position: {
      type: "object",
      additionalProperties: false,
      properties: {
        with_inputs_in: {
          type: "string"
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["with_inputs_in", "at"]
    },
    scenario_preset: {
      type: "object",
      additionalProperties: false,
      properties: {
        preset: {
          type: "string",
          enum: ["matrix"]
        }
      },
      required: ["preset"]
    },
    scenario_expand_for_each_input_in_group: {
      type: "object",
      additionalProperties: false,
      properties: {
        scenarios_for_each_input_in: {
          type: "string"
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["scenarios_for_each_input_in", "at"]
    },
    dataset: {
      oneOf: [{ $ref: "#/$defs/dataset_name" }, { $ref: "#/$defs/dataset_group" }, { $ref: "#/$defs/dataset_matching" }]
    },
    dataset_name: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string"
        },
        source: {
          type: "string"
        }
      },
      required: ["name"]
    },
    dataset_group: {
      type: "object",
      additionalProperties: false,
      properties: {
        group: {
          type: "string"
        }
      },
      required: ["group"]
    },
    dataset_matching: {
      type: "object",
      additionalProperties: false,
      properties: {
        matching: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: {
              type: "string"
            }
          },
          required: ["type"]
        }
      },
      required: ["matching"]
    },
    predicate: {
      type: "object",
      oneOf: [
        { $ref: "#/$defs/predicate_gt" },
        { $ref: "#/$defs/predicate_gte" },
        { $ref: "#/$defs/predicate_lt" },
        { $ref: "#/$defs/predicate_lte" },
        { $ref: "#/$defs/predicate_gt_lt" },
        { $ref: "#/$defs/predicate_gt_lte" },
        { $ref: "#/$defs/predicate_gte_lt" },
        { $ref: "#/$defs/predicate_gte_lte" },
        { $ref: "#/$defs/predicate_eq" },
        { $ref: "#/$defs/predicate_approx" }
      ]
    },
    predicate_gt: {
      type: "object",
      additionalProperties: false,
      properties: {
        gt: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["gt"]
    },
    predicate_gte: {
      type: "object",
      additionalProperties: false,
      properties: {
        gte: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["gte"]
    },
    predicate_lt: {
      type: "object",
      additionalProperties: false,
      properties: {
        lt: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["lt"]
    },
    predicate_lte: {
      type: "object",
      additionalProperties: false,
      properties: {
        lte: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["lte"]
    },
    predicate_gt_lt: {
      type: "object",
      additionalProperties: false,
      properties: {
        gt: { $ref: "#/$defs/predicate_ref" },
        lt: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["gt", "lt"]
    },
    predicate_gt_lte: {
      type: "object",
      additionalProperties: false,
      properties: {
        gt: { $ref: "#/$defs/predicate_ref" },
        lte: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["gt", "lte"]
    },
    predicate_gte_lt: {
      type: "object",
      additionalProperties: false,
      properties: {
        gte: { $ref: "#/$defs/predicate_ref" },
        lt: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["gte", "lt"]
    },
    predicate_gte_lte: {
      type: "object",
      additionalProperties: false,
      properties: {
        gte: { $ref: "#/$defs/predicate_ref" },
        lte: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["gte", "lte"]
    },
    predicate_eq: {
      type: "object",
      additionalProperties: false,
      properties: {
        eq: { $ref: "#/$defs/predicate_ref" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["eq"]
    },
    predicate_approx: {
      type: "object",
      additionalProperties: false,
      properties: {
        approx: { $ref: "#/$defs/predicate_ref" },
        tolerance: { type: "number" },
        time: { $ref: "#/$defs/predicate_time" }
      },
      required: ["approx"]
    },
    predicate_ref: {
      oneOf: [{ $ref: "#/$defs/predicate_ref_constant" }, { $ref: "#/$defs/predicate_ref_data" }]
    },
    predicate_ref_constant: {
      type: "number"
    },
    predicate_ref_data: {
      type: "object",
      additionalProperties: false,
      properties: {
        dataset: { $ref: "#/$defs/predicate_ref_data_dataset" },
        scenario: { $ref: "#/$defs/predicate_ref_data_scenario" }
      },
      required: ["dataset"]
    },
    predicate_ref_data_dataset: {
      oneOf: [{ $ref: "#/$defs/dataset_name" }, { $ref: "#/$defs/predicate_ref_data_dataset_special" }]
    },
    predicate_ref_data_dataset_special: {
      type: "string",
      enum: ["inherit"]
    },
    predicate_ref_data_scenario: {
      oneOf: [
        { $ref: "#/$defs/scenario_with_input_at_position" },
        { $ref: "#/$defs/scenario_with_input_at_value" },
        { $ref: "#/$defs/scenario_with_multiple_input_settings" },
        { $ref: "#/$defs/scenario_with_inputs_in_preset_at_position" },
        { $ref: "#/$defs/scenario_with_inputs_in_group_at_position" },
        { $ref: "#/$defs/predicate_ref_data_scenario_special" }
      ]
    },
    predicate_ref_data_scenario_special: {
      type: "string",
      enum: ["inherit"]
    },
    predicate_time: {
      oneOf: [
        { $ref: "#/$defs/predicate_time_single" },
        { $ref: "#/$defs/predicate_time_pair" },
        { $ref: "#/$defs/predicate_time_gt" },
        { $ref: "#/$defs/predicate_time_gte" },
        { $ref: "#/$defs/predicate_time_lt" },
        { $ref: "#/$defs/predicate_time_lte" },
        { $ref: "#/$defs/predicate_time_gt_lt" },
        { $ref: "#/$defs/predicate_time_gt_lte" },
        { $ref: "#/$defs/predicate_time_gte_lt" },
        { $ref: "#/$defs/predicate_time_gte_lte" }
      ]
    },
    predicate_time_single: {
      type: "number"
    },
    predicate_time_pair: {
      type: "array",
      items: [{ type: "number" }, { type: "number" }],
      minItems: 2,
      maxItems: 2
    },
    predicate_time_gt: {
      type: "object",
      additionalProperties: false,
      properties: {
        after_excl: { type: "number" }
      },
      required: ["after_excl"]
    },
    predicate_time_gte: {
      type: "object",
      additionalProperties: false,
      properties: {
        after_incl: { type: "number" }
      },
      required: ["after_incl"]
    },
    predicate_time_lt: {
      type: "object",
      additionalProperties: false,
      properties: {
        before_excl: { type: "number" }
      },
      required: ["before_excl"]
    },
    predicate_time_lte: {
      type: "object",
      additionalProperties: false,
      properties: {
        before_incl: { type: "number" }
      },
      required: ["before_incl"]
    },
    predicate_time_gt_lt: {
      type: "object",
      additionalProperties: false,
      properties: {
        after_excl: { type: "number" },
        before_excl: { type: "number" }
      },
      required: ["after_excl", "before_excl"]
    },
    predicate_time_gt_lte: {
      type: "object",
      additionalProperties: false,
      properties: {
        after_excl: { type: "number" },
        before_incl: { type: "number" }
      },
      required: ["after_excl", "before_incl"]
    },
    predicate_time_gte_lt: {
      type: "object",
      additionalProperties: false,
      properties: {
        after_incl: { type: "number" },
        before_excl: { type: "number" }
      },
      required: ["after_incl", "before_excl"]
    },
    predicate_time_gte_lte: {
      type: "object",
      additionalProperties: false,
      properties: {
        after_incl: { type: "number" },
        before_incl: { type: "number" }
      },
      required: ["after_incl", "before_incl"]
    }
  }
};
function parseTestYaml(yamlStrings) {
  const groups = [];
  const ajv = new import_ajv.default();
  const validate = ajv.compile(check_schema_default);
  for (const yamlString of yamlStrings) {
    const parsed = browser_default.parse(yamlString);
    if (validate(parsed)) {
      for (const group of parsed) {
        groups.push(group);
      }
    } else {
      let msg = "Failed to parse YAML check definitions";
      for (const error of validate.errors || []) {
        if (error.message) {
          msg += `
${error.message}`;
        }
      }
      return err(new Error(msg));
    }
  }
  const checkSpec = {
    groups
  };
  return ok(checkSpec);
}
var passed = {
  status: "passed"
};
var gt = (a, b2) => a > b2;
var gte = (a, b2) => a >= b2;
var lt = (a, b2) => a < b2;
var lte = (a, b2) => a <= b2;
var eq = (a, b2) => a === b2;
var approx = (tolerance) => {
  const f = (a, b2) => {
    return a >= b2 - tolerance && a <= b2 + tolerance;
  };
  return f;
};
function checkFunc(spec) {
  function addCheckValueFunc(op, compareFunc) {
    const refSpec = spec[op];
    if (refSpec === void 0) {
      return;
    }
    if (typeof refSpec === "number") {
      checkValueFuncs.push((value, time) => {
        if (compareFunc(value, refSpec)) {
          return passed;
        } else {
          return {
            status: "failed",
            failValue: value,
            failTime: time
          };
        }
      });
    } else {
      checkValueFuncs.push((value, time, refDatasets) => {
        const refDataset = refDatasets == null ? void 0 : refDatasets.get(op);
        if (refDataset === void 0) {
          return {
            status: "error",
            message: "unhandled data reference"
          };
        }
        const refValue = refDataset.get(time);
        if (refValue !== void 0) {
          if (compareFunc(value, refValue)) {
            return passed;
          } else {
            return {
              status: "failed",
              failValue: value,
              failOp: op,
              failRefValue: refValue,
              failTime: time
            };
          }
        } else {
          return {
            status: "failed",
            message: "no reference value",
            failTime: time
          };
        }
      });
    }
  }
  const checkValueFuncs = [];
  addCheckValueFunc("gt", gt);
  addCheckValueFunc("gte", gte);
  addCheckValueFunc("lt", lt);
  addCheckValueFunc("lte", lte);
  addCheckValueFunc("eq", eq);
  if (spec.approx !== void 0) {
    const tolerance = spec.tolerance || 0.1;
    addCheckValueFunc("approx", approx(tolerance));
  }
  const checkValue = (value, time, refDatasets) => {
    for (const f of checkValueFuncs) {
      const result = f(value, time, refDatasets);
      if (result.status !== "passed") {
        return result;
      }
    }
    return passed;
  };
  if (spec.time !== void 0 && typeof spec.time === "number") {
    const time = spec.time;
    return (dataset, refDatasets) => {
      const value = dataset.get(time);
      if (value !== void 0) {
        return checkValue(value, time, refDatasets);
      } else {
        return {
          status: "failed",
          message: "no value",
          failTime: time
        };
      }
    };
  } else {
    let checkTime;
    if (spec.time !== void 0) {
      if (Array.isArray(spec.time)) {
        const timeSpec = spec.time;
        checkTime = (time) => time >= timeSpec[0] && time <= timeSpec[1];
      } else {
        const checkTimeFuncs = [];
        const timeSpec = spec.time;
        if (timeSpec.after_excl !== void 0) {
          checkTimeFuncs.push((time) => time > timeSpec.after_excl);
        }
        if (timeSpec.after_incl !== void 0) {
          checkTimeFuncs.push((time) => time >= timeSpec.after_incl);
        }
        if (timeSpec.before_excl !== void 0) {
          checkTimeFuncs.push((time) => time < timeSpec.before_excl);
        }
        if (timeSpec.before_incl !== void 0) {
          checkTimeFuncs.push((time) => time <= timeSpec.before_incl);
        }
        checkTime = (time) => {
          for (const f of checkTimeFuncs) {
            if (!f(time)) {
              return false;
            }
          }
          return true;
        };
      }
    } else {
      checkTime = () => true;
    }
    return (dataset, refDatasets) => {
      for (const [time, value] of dataset) {
        if (checkTime(time)) {
          const result = checkValue(value, time, refDatasets);
          if (result.status !== "passed") {
            return result;
          }
        }
      }
      return passed;
    };
  }
}
function actionForPredicate(predicateSpec) {
  return {
    predicateSpec,
    run: checkFunc(predicateSpec)
  };
}
function cartesianProductOf(arr) {
  return arr.reduce(
    (a, b2) => {
      return a.map((x) => b2.map((y) => x.concat([y]))).reduce((v, w2) => v.concat(w2), []);
    },
    [[]]
  );
}
function expandDatasets(modelSpec, datasetSpec) {
  var _a;
  let result;
  if (datasetSpec.name) {
    result = matchByName(modelSpec, datasetSpec.name, datasetSpec.source);
  } else if (datasetSpec.group) {
    result = matchByGroup(modelSpec, datasetSpec.group);
  } else if ((_a = datasetSpec.matching) == null ? void 0 : _a.type) {
    result = matchByType(modelSpec, datasetSpec.matching.type);
  }
  if (result.error) {
    return [
      {
        name: result.error.name,
        error: result.error.kind
      }
    ];
  }
  const matches = result.matches;
  const checkDatasets = [];
  for (const match of matches) {
    if (match.outputVar) {
      checkDatasets.push({
        datasetKey: match.datasetKey,
        name: match.outputVar.varName
      });
    } else if (match.implVar) {
      const implVar = match.implVar;
      if (implVar.dimensions.length > 0) {
        const baseDatasetKey = match.datasetKey;
        const subscripts = [...implVar.dimensions.map((dim) => dim.subscripts)];
        const subscriptCombos = cartesianProductOf(subscripts);
        for (const subscriptCombo of subscriptCombos) {
          const subIdParts = subscriptCombo.map((sub) => `[${sub.id}]`).join("");
          const subNameParts = subscriptCombo.map((sub) => sub.name).join(",");
          checkDatasets.push({
            datasetKey: `${baseDatasetKey}${subIdParts}`,
            name: `${implVar.varName}[${subNameParts}]`
          });
        }
      } else {
        checkDatasets.push({
          datasetKey: match.datasetKey,
          name: implVar.varName
        });
      }
    }
  }
  return checkDatasets;
}
function matchByName(modelSpec, datasetName, datasetSource) {
  var _a;
  const varNameToMatch = datasetName.toLowerCase();
  const sourceToMatch = datasetSource == null ? void 0 : datasetSource.toLowerCase();
  for (const [datasetKey, outputVar] of modelSpec.outputVars) {
    if (((_a = outputVar.sourceName) == null ? void 0 : _a.toLowerCase()) === sourceToMatch && outputVar.varName.toLowerCase() === varNameToMatch) {
      return {
        matches: [
          {
            datasetKey,
            outputVar
          }
        ]
      };
    }
  }
  for (const [datasetKey, implVar] of modelSpec.implVars) {
    if (implVar.varName.toLowerCase() === varNameToMatch) {
      return {
        matches: [
          {
            datasetKey,
            implVar
          }
        ]
      };
    }
  }
  return {
    matches: [],
    error: {
      kind: "no-matches-for-dataset",
      name: datasetName
    }
  };
}
function matchByGroup(modelSpec, groupName) {
  let matchedGroupName;
  let matchedGroupDatasetKeys;
  if (modelSpec.datasetGroups) {
    const groupToMatch = groupName.toLowerCase();
    for (const [group, datasetKeys] of modelSpec.datasetGroups) {
      if (group.toLowerCase() === groupToMatch) {
        matchedGroupName = group;
        matchedGroupDatasetKeys = datasetKeys;
        break;
      }
    }
  }
  if (matchedGroupName === void 0) {
    return {
      matches: [],
      error: {
        kind: "no-matches-for-group",
        name: groupName
      }
    };
  }
  const matches = [];
  for (const datasetKey of matchedGroupDatasetKeys) {
    const outputVar = modelSpec.outputVars.get(datasetKey);
    if (outputVar) {
      matches.push({
        datasetKey,
        outputVar
      });
      continue;
    }
    const implVar = modelSpec.implVars.get(datasetKey);
    if (implVar) {
      matches.push({
        datasetKey,
        implVar
      });
      continue;
    }
    return {
      matches: [],
      error: {
        kind: "no-matches-for-dataset",
        name: datasetKey
      }
    };
  }
  if (matches.length === 0) {
    return {
      matches: [],
      error: {
        kind: "no-matches-for-group",
        name: matchedGroupName
      }
    };
  }
  return {
    matches
  };
}
function matchByType(modelSpec, varTypeToMatch) {
  const matches = [];
  for (const [datasetKey, implVar] of modelSpec.implVars) {
    if (implVar.varType === varTypeToMatch) {
      matches.push({
        datasetKey,
        implVar
      });
    }
  }
  if (matches.length === 0) {
    return {
      matches: [],
      error: {
        kind: "no-matches-for-type",
        name: varTypeToMatch
      }
    };
  }
  return {
    matches
  };
}
function positionSetting(inputVarId, position) {
  return {
    kind: "position",
    inputVarId,
    position
  };
}
function valueSetting(inputVarId, value) {
  return {
    kind: "value",
    inputVarId,
    value
  };
}
function inputSettingsSpec(settings) {
  const uidParts = settings.map((setting) => {
    switch (setting.kind) {
      case "position":
        return `${setting.inputVarId}_at_${keyForInputPosition(setting.position)}`;
      case "value":
        return `${setting.inputVarId}_at_${setting.value}`;
      default:
        (0, import_assert_never6.assertNever)(setting);
    }
  });
  const uid = `inputs_${uidParts.sort().join("_")}`;
  return {
    kind: "input-settings",
    uid,
    settings
  };
}
function inputAtPositionSpec(inputVarId, position) {
  return inputSettingsSpec([positionSetting(inputVarId, position)]);
}
function allInputsAtPositionSpec(position) {
  return {
    kind: "all-inputs",
    uid: `all_inputs_at_${keyForInputPosition(position)}`,
    position
  };
}
function keyForInputPosition(position) {
  switch (position) {
    case "at-default":
      return "default";
    case "at-minimum":
      return "min";
    case "at-maximum":
      return "max";
    default:
      (0, import_assert_never6.assertNever)(position);
  }
}
function expandScenarios(modelSpec, scenarioSpecs, simplify) {
  if (scenarioSpecs.length === 0) {
    const scenarioSpec = {
      with_inputs: "all",
      at: "default"
    };
    return checkScenariosFromSpec(modelSpec, scenarioSpec, simplify);
  }
  const checkScenarios = [];
  for (const scenarioSpec of scenarioSpecs) {
    checkScenarios.push(...checkScenariosFromSpec(modelSpec, scenarioSpec, simplify));
  }
  return checkScenarios;
}
function inputPosition(position) {
  switch (position) {
    case "default":
      return "at-default";
    case "min":
      return "at-minimum";
    case "max":
      return "at-maximum";
    default:
      return void 0;
  }
}
function inputValueAtPosition(inputVar, position) {
  switch (position) {
    case "at-default":
      return inputVar.defaultValue;
    case "at-minimum":
      return inputVar.minValue;
    case "at-maximum":
      return inputVar.maxValue;
    default:
      (0, import_assert_never5.default)(position);
  }
}
function inputDescAtPosition(inputVar, position) {
  return {
    name: inputVar.varName,
    inputVar,
    position,
    value: inputValueAtPosition(inputVar, position)
  };
}
function inputDescAtValue(inputVar, value) {
  return {
    name: inputVar.varName,
    inputVar,
    value
  };
}
function inputDescForVar(inputVar, at2) {
  if (typeof at2 === "number") {
    const value = at2;
    return inputDescAtValue(inputVar, value);
  } else {
    const position = inputPosition(at2);
    return inputDescAtPosition(inputVar, position);
  }
}
function inputDescForName(modelSpec, inputName, at2) {
  const inputNameToMatch = inputName.toLowerCase();
  const inputVar = [...modelSpec.inputVars.values()].find((inputVar2) => {
    return inputVar2.varName.toLowerCase() === inputNameToMatch;
  });
  if (inputVar) {
    return inputDescForVar(inputVar, at2);
  } else {
    return {
      name: inputName
    };
  }
}
function groupForName(modelSpec, groupName) {
  if (modelSpec.inputGroups) {
    const groupToMatch = groupName.toLowerCase();
    for (const [group, inputVars] of modelSpec.inputGroups) {
      if (group.toLowerCase() === groupToMatch) {
        return [group, inputVars];
      }
    }
  }
  return void 0;
}
function errorScenarioForInputGroup(kind, groupName) {
  return {
    inputDescs: [],
    error: {
      kind,
      name: groupName
    }
  };
}
function checkScenarioWithAllInputsAtPosition(position) {
  return {
    spec: allInputsAtPositionSpec(position),
    inputDescs: []
  };
}
function checkScenarioWithInputAtPosition(inputVar, position) {
  const varId = inputVar.varId;
  return {
    spec: inputAtPositionSpec(varId, position),
    inputDescs: [inputDescAtPosition(inputVar, position)]
  };
}
function checkScenarioForInputDescs(groupName, inputDescs) {
  let spec;
  if (inputDescs.every((desc) => desc.inputVar !== void 0)) {
    const settings = inputDescs.map((inputDesc) => {
      const varId = inputDesc.inputVar.varId;
      if (inputDesc.position) {
        return positionSetting(varId, inputDesc.position);
      } else {
        return valueSetting(varId, inputDesc.value);
      }
    });
    spec = inputSettingsSpec(settings);
  } else {
    spec = void 0;
  }
  return {
    spec,
    inputGroupName: groupName,
    inputDescs
  };
}
function checkScenarioForInputSpecs(modelSpec, inputSpecs) {
  const inputDescs = inputSpecs.map((inputSpec) => {
    return inputDescForName(modelSpec, inputSpec.input, inputSpec.at);
  });
  return checkScenarioForInputDescs(void 0, inputDescs);
}
function checkScenarioMatrix(modelSpec, simplify) {
  const checkScenarios = [];
  checkScenarios.push(checkScenarioWithAllInputsAtPosition("at-default"));
  if (!simplify) {
    checkScenarios.push(checkScenarioWithAllInputsAtPosition("at-minimum"));
    checkScenarios.push(checkScenarioWithAllInputsAtPosition("at-maximum"));
    for (const inputVar of modelSpec.inputVars.values()) {
      checkScenarios.push(checkScenarioWithInputAtPosition(inputVar, "at-minimum"));
      checkScenarios.push(checkScenarioWithInputAtPosition(inputVar, "at-maximum"));
    }
  }
  return checkScenarios;
}
function checkScenarioWithAllInputsInGroupAtPosition(modelSpec, groupName, position) {
  const result = groupForName(modelSpec, groupName);
  if (result === void 0) {
    return errorScenarioForInputGroup("unknown-input-group", groupName);
  }
  const [matchedGroupName, inputVars] = result;
  if (inputVars.length === 0) {
    return errorScenarioForInputGroup("empty-input-group", matchedGroupName);
  }
  const inputDescs = [];
  for (const inputVar of inputVars) {
    inputDescs.push(inputDescForVar(inputVar, position));
  }
  return checkScenarioForInputDescs(matchedGroupName, inputDescs);
}
function checkScenariosForEachInputInGroup(modelSpec, groupName, position) {
  const result = groupForName(modelSpec, groupName);
  if (result === void 0) {
    return [errorScenarioForInputGroup("unknown-input-group", groupName)];
  }
  const [matchedGroupName, inputVars] = result;
  if (inputVars.length === 0) {
    return [errorScenarioForInputGroup("empty-input-group", matchedGroupName)];
  }
  const checkScenarios = [];
  for (const inputVar of inputVars) {
    const inputDesc = inputDescForVar(inputVar, position);
    checkScenarios.push(checkScenarioForInputDescs(void 0, [inputDesc]));
  }
  return checkScenarios;
}
function checkScenariosFromSpec(modelSpec, scenarioSpec, simplify) {
  if (scenarioSpec.preset === "matrix") {
    return checkScenarioMatrix(modelSpec, simplify);
  }
  if (scenarioSpec.scenarios_for_each_input_in !== void 0) {
    const groupName = scenarioSpec.scenarios_for_each_input_in;
    const position = scenarioSpec.at;
    return checkScenariosForEachInputInGroup(modelSpec, groupName, position);
  }
  if (scenarioSpec.with !== void 0) {
    if (Array.isArray(scenarioSpec.with)) {
      const inputSpecs = scenarioSpec.with;
      return [checkScenarioForInputSpecs(modelSpec, inputSpecs)];
    } else {
      const inputSpec = {
        input: scenarioSpec.with,
        at: scenarioSpec.at
      };
      return [checkScenarioForInputSpecs(modelSpec, [inputSpec])];
    }
  }
  if (scenarioSpec.with_inputs === "all") {
    const position = inputPosition(scenarioSpec.at);
    return [checkScenarioWithAllInputsAtPosition(position)];
  }
  if (scenarioSpec.with_inputs_in !== void 0) {
    const groupName = scenarioSpec.with_inputs_in;
    const position = scenarioSpec.at;
    return [checkScenarioWithAllInputsInGroupAtPosition(modelSpec, groupName, position)];
  }
  throw new Error(`Unhandled scenario spec: ${JSON.stringify(scenarioSpec)}`);
}
var CheckPlanner = class {
  constructor(modelSpec) {
    this.modelSpec = modelSpec;
    this.groups = [];
    this.tasks = /* @__PURE__ */ new Map();
    this.dataRefs = /* @__PURE__ */ new Map();
    this.checkKey = 1;
  }
  addAllChecks(checkSpec, simplifyScenarios) {
    for (const groupSpec of checkSpec.groups) {
      const groupName = groupSpec.describe;
      const planTests = [];
      for (const testSpec of groupSpec.tests) {
        const testName = testSpec.it;
        const checkScenarios = expandScenarios(this.modelSpec, testSpec.scenarios || [], simplifyScenarios);
        const checkDatasets = [];
        for (const datasetSpec of testSpec.datasets) {
          checkDatasets.push(...expandDatasets(this.modelSpec, datasetSpec));
        }
        const checkActions = [];
        for (const predicateSpec of testSpec.predicates) {
          checkActions.push(actionForPredicate(predicateSpec));
        }
        const planScenarios = [];
        for (const checkScenario of checkScenarios) {
          if (checkScenario.spec === void 0) {
            planScenarios.push({
              checkScenario,
              datasets: []
            });
            continue;
          }
          const planDatasets = [];
          for (const checkDataset of checkDatasets) {
            if (checkDataset.datasetKey === void 0) {
              planDatasets.push({
                checkDataset,
                predicates: []
              });
              continue;
            }
            const planPredicates = [];
            for (const checkAction of checkActions) {
              const dataRefs = this.addDataRefs(checkAction.predicateSpec, checkScenario, checkDataset);
              const key = this.checkKey++;
              planPredicates.push({
                checkKey: key,
                action: checkAction,
                dataRefs
              });
              this.tasks.set(key, {
                scenario: checkScenario,
                dataset: checkDataset,
                action: checkAction,
                dataRefs
              });
            }
            planDatasets.push({
              checkDataset,
              predicates: planPredicates
            });
          }
          planScenarios.push({
            checkScenario,
            datasets: planDatasets
          });
        }
        planTests.push({
          name: testName,
          scenarios: planScenarios
        });
      }
      this.groups.push({
        name: groupName,
        tests: planTests
      });
    }
  }
  buildPlan() {
    return {
      groups: this.groups,
      tasks: this.tasks,
      dataRefs: this.dataRefs
    };
  }
  /**
   * Record any references to additional datasets contained in the given predicate.
   * For example, if the predicate is:
   * ```
   *   gt:
   *     dataset:
   *       name: 'XYZ'
   *     scenario:
   *       inputs: all
   *       at: default
   * ```
   * this will add a reference to the scenario/dataset pair so that the data can
   * be fetched in a later stage.
   *
   * @param predicateSpec The predicate spec.
   * @param checkScenario The scenario in which the dataset is being checked.
   * @param checkDataset The dataset that is being checked.
   */
  addDataRefs(predicateSpec, checkScenario, checkDataset) {
    let dataRefs;
    const addDataRef = (op) => {
      const predOp = predicateSpec[op];
      if (predOp === void 0 || typeof predOp === "number") {
        return;
      }
      let refDataset;
      if (typeof predOp.dataset === "string") {
        switch (predOp.dataset) {
          case "inherit":
            refDataset = checkDataset;
            break;
          default:
            (0, import_assert_never4.default)(predOp.dataset);
        }
      } else {
        const refDatasetSpec = { name: predOp.dataset.name };
        const matchedRefDatasets = expandDatasets(this.modelSpec, refDatasetSpec);
        if (matchedRefDatasets.length === 1) {
          refDataset = matchedRefDatasets[0];
        } else {
          refDataset = {
            name: predOp.dataset.name
          };
        }
      }
      let refScenario;
      if (typeof predOp.scenario === "string") {
        switch (predOp.scenario) {
          case "inherit":
            refScenario = checkScenario;
            break;
          default:
            (0, import_assert_never4.default)(predOp.scenario);
        }
      } else {
        const refScenarioSpecs = predOp.scenario ? [predOp.scenario] : [];
        const matchedRefScenarios = expandScenarios(this.modelSpec, refScenarioSpecs, true);
        if (matchedRefScenarios.length === 1) {
          refScenario = matchedRefScenarios[0];
        }
        if (refScenario === void 0) {
          refScenario = {
            inputDescs: []
          };
        }
      }
      let dataRefKey;
      if (refScenario.spec && refDataset.datasetKey) {
        dataRefKey = `${refScenario.spec.uid}::${refDataset.datasetKey}`;
      }
      const dataRef = {
        key: dataRefKey,
        dataset: refDataset,
        scenario: refScenario
      };
      if (dataRefKey) {
        this.dataRefs.set(dataRefKey, dataRef);
      }
      if (dataRefs === void 0) {
        dataRefs = /* @__PURE__ */ new Map();
      }
      dataRefs.set(op, dataRef);
    };
    addDataRef("gt");
    addDataRef("gte");
    addDataRef("lt");
    addDataRef("lte");
    addDataRef("eq");
    addDataRef("approx");
    return dataRefs;
  }
};
function checkReportFromSummary(checkConfig, checkSummary) {
  const checkSpecResult = parseTestYaml(checkConfig.tests);
  if (checkSpecResult.isErr()) {
    return void 0;
  }
  const checkSpec = checkSpecResult.value;
  const checkPlanner = new CheckPlanner(checkConfig.bundle.model.modelSpec);
  checkPlanner.addAllChecks(checkSpec, false);
  const checkPlan = checkPlanner.buildPlan();
  const checkResults = /* @__PURE__ */ new Map();
  for (const predicateSummary of checkSummary.predicateSummaries) {
    checkResults.set(predicateSummary.checkKey, predicateSummary.result);
  }
  return buildCheckReport(checkPlan, checkResults);
}
var ComparisonDataCoordinator = class {
  constructor(bundleModelL, bundleModelR) {
    this.bundleModelL = bundleModelL;
    this.bundleModelR = bundleModelR;
    this.taskQueue = new TaskQueue({
      process: (request) => __async(this, null, function* () {
        switch (request.kind) {
          case "dataset":
            return this.processDatasetRequest(request);
          case "graph-data":
            return this.processGraphDataRequest(request);
          default:
            (0, import_assert_never7.assertNever)(request);
        }
      })
    });
  }
  processDatasetRequest(request) {
    return __async(this, null, function* () {
      function fetchDatasets(bundleModel, scenarioSpec) {
        return __async(this, null, function* () {
          if (scenarioSpec) {
            return bundleModel.getDatasetsForScenario(scenarioSpec, request.datasetKeys);
          } else {
            return void 0;
          }
        });
      }
      const [resultL, resultR] = yield Promise.all([
        fetchDatasets(this.bundleModelL, request.scenarioSpecL),
        fetchDatasets(this.bundleModelR, request.scenarioSpecR)
      ]);
      return {
        kind: "dataset",
        datasetMapL: resultL == null ? void 0 : resultL.datasetMap,
        datasetMapR: resultR == null ? void 0 : resultR.datasetMap
      };
    });
  }
  processGraphDataRequest(request) {
    return __async(this, null, function* () {
      function fetchGraphData(bundleModel, scenarioSpec) {
        return __async(this, null, function* () {
          if (scenarioSpec) {
            return bundleModel.getGraphDataForScenario(scenarioSpec, request.graphId);
          } else {
            return void 0;
          }
        });
      }
      const [graphDataL, graphDataR] = yield Promise.all([
        fetchGraphData(this.bundleModelL, request.scenarioSpecL),
        fetchGraphData(this.bundleModelR, request.scenarioSpecR)
      ]);
      return {
        kind: "graph-data",
        graphDataL,
        graphDataR
      };
    });
  }
  requestDatasetMaps(requestKey, scenarioSpecL, scenarioSpecR, datasetKeys, onResponse) {
    const request = {
      kind: "dataset",
      scenarioSpecL,
      scenarioSpecR,
      datasetKeys
    };
    this.taskQueue.addTask(requestKey, request, (response) => {
      if (response.kind === "dataset") {
        onResponse(response.datasetMapL, response.datasetMapR);
      }
    });
  }
  requestGraphData(requestKey, scenarioSpecL, scenarioSpecR, graphId, onResponse) {
    const request = {
      kind: "graph-data",
      scenarioSpecL,
      scenarioSpecR,
      graphId
    };
    this.taskQueue.addTask(requestKey, request, (response) => {
      if (response.kind === "graph-data") {
        onResponse(response.graphDataL, response.graphDataR);
      }
    });
  }
  cancelRequest(key) {
    this.taskQueue.cancelTask(key);
  }
};
function diffDatasets(datasetL, datasetR) {
  let minValueL = Number.MAX_VALUE;
  let maxValueL = Number.MIN_VALUE;
  let minValueR = Number.MAX_VALUE;
  let maxValueR = Number.MIN_VALUE;
  let minValue = Number.MAX_VALUE;
  let maxValue = Number.MIN_VALUE;
  let minRawDiff = Number.MAX_VALUE;
  let maxRawDiff = -1;
  let maxDiffPoint;
  let diffCount = 0;
  let totalRawDiff = 0;
  if (datasetL && datasetR) {
    const times = /* @__PURE__ */ new Set([...datasetL.keys(), ...datasetR.keys()]);
    for (const t of times) {
      const valueL = datasetL.get(t);
      if (valueL !== void 0) {
        if (valueL < minValueL) minValueL = valueL;
        if (valueL > maxValueL) maxValueL = valueL;
        if (valueL < minValue) minValue = valueL;
        if (valueL > maxValue) maxValue = valueL;
      }
      const valueR = datasetR.get(t);
      if (valueR !== void 0) {
        if (valueR < minValueR) minValueR = valueR;
        if (valueR > maxValueR) maxValueR = valueR;
        if (valueR < minValue) minValue = valueR;
        if (valueR > maxValue) maxValue = valueR;
      }
      if (valueL === void 0 || valueR === void 0) {
        continue;
      }
      const rawDiff = Math.abs(valueR - valueL);
      if (rawDiff < minRawDiff) {
        minRawDiff = rawDiff;
      }
      if (rawDiff > maxRawDiff) {
        maxRawDiff = rawDiff;
        maxDiffPoint = {
          time: t,
          valueL,
          valueR
        };
      }
      diffCount++;
      totalRawDiff += rawDiff;
    }
  }
  function pct(x) {
    return x * 100;
  }
  let minDiff;
  let maxDiff;
  let avgDiff;
  if (minValueL === maxValueL && minValueR === maxValueR) {
    const diff = pct(maxValueL !== 0 ? Math.abs((maxValueR - maxValueL) / maxValueL) : 1);
    minDiff = diff;
    maxDiff = diff;
    avgDiff = diff;
  } else {
    const spread = maxValue - minValue;
    minDiff = pct(spread > 0 ? minRawDiff / spread : 0);
    maxDiff = pct(spread > 0 ? maxRawDiff / spread : 0);
    const avgRawDiff = totalRawDiff / diffCount;
    avgDiff = pct(spread > 0 ? avgRawDiff / spread : 0);
  }
  let validity;
  if (datasetL && datasetR) {
    validity = "both";
  } else if (datasetL) {
    validity = "left-only";
  } else if (datasetR) {
    validity = "right-only";
  } else {
    validity = "neither";
  }
  return {
    validity,
    minValue,
    maxValue,
    avgDiff,
    minDiff,
    maxDiff,
    maxDiffPoint
  };
}
function diffGraphs(graphL, graphR, scenarioKey, testSummaries) {
  let inclusion;
  if (graphL && graphR) {
    inclusion = "both";
  } else if (graphL) {
    inclusion = "left-only";
  } else if (graphR) {
    inclusion = "right-only";
  } else {
    inclusion = "neither";
  }
  const metadataReports = [];
  if ((graphL == null ? void 0 : graphL.metadata) && (graphR == null ? void 0 : graphR.metadata)) {
    const metaKeys = /* @__PURE__ */ new Set();
    for (const key of graphL.metadata.keys()) {
      metaKeys.add(key);
    }
    for (const key of graphR.metadata.keys()) {
      metaKeys.add(key);
    }
    for (const key of metaKeys) {
      const valueL = graphL.metadata.get(key);
      const valueR = graphR.metadata.get(key);
      if (valueL !== valueR) {
        metadataReports.push({
          key,
          valueL,
          valueR
        });
      }
    }
  }
  const datasetReports = [];
  if (graphL && graphR) {
    const datasetKeys = /* @__PURE__ */ new Set();
    for (const dataset of graphL.datasets) {
      datasetKeys.add(dataset.datasetKey);
    }
    for (const dataset of graphR.datasets) {
      datasetKeys.add(dataset.datasetKey);
    }
    for (const datasetKey of datasetKeys) {
      const testSummary = testSummaries.find((summary) => summary.d === datasetKey && summary.s === scenarioKey);
      const maxDiff = testSummary == null ? void 0 : testSummary.md;
      datasetReports.push({
        datasetKey,
        maxDiff
      });
    }
  }
  return {
    inclusion,
    metadataReports,
    datasetReports
  };
}
function comparisonSummaryFromReport(comparisonReport) {
  const terseSummaries = [];
  for (const r of comparisonReport.testReports) {
    if (r.diffReport.validity === "both" && r.diffReport.maxDiff > 0) {
      terseSummaries.push({
        s: r.scenarioKey,
        d: r.datasetKey,
        md: r.diffReport.maxDiff
      });
    }
  }
  return {
    testSummaries: terseSummaries,
    perfReportL: comparisonReport.perfReportL,
    perfReportR: comparisonReport.perfReportR
  };
}
function restoreFromTerseSummaries(comparisonConfig, terseSummaries) {
  const existingSummaries = /* @__PURE__ */ new Map();
  for (const summary of terseSummaries) {
    const key = `${summary.s}::${summary.d}`;
    existingSummaries.set(key, summary);
  }
  const allTestSummaries = [];
  for (const scenario of comparisonConfig.scenarios.getAllScenarios()) {
    const datasetKeys = comparisonConfig.datasets.getDatasetKeysForScenario(scenario);
    for (const datasetKey of datasetKeys) {
      const key = `${scenario.key}::${datasetKey}`;
      const existingSummary = existingSummaries.get(key);
      const maxDiff = (existingSummary == null ? void 0 : existingSummary.md) || 0;
      allTestSummaries.push({
        s: scenario.key,
        d: datasetKey,
        md: maxDiff
      });
    }
  }
  return allTestSummaries;
}
function getBucketIndex(diffPct, thresholds) {
  if (diffPct === 0) {
    return 0;
  }
  for (let i = 0; i < thresholds.length; i++) {
    if (diffPct < thresholds[i]) {
      return i + 1;
    }
  }
  return thresholds.length + 1;
}
function getScoresForTestSummaries(testSummaries, thresholds) {
  const diffCountByBucket = Array(thresholds.length + 2).fill(0);
  const totalMaxDiffByBucket = Array(thresholds.length + 2).fill(0);
  let totalDiffCount = 0;
  for (const testSummary of testSummaries) {
    const bucketIndex = getBucketIndex(testSummary.md, thresholds);
    diffCountByBucket[bucketIndex]++;
    totalMaxDiffByBucket[bucketIndex] += testSummary.md;
    totalDiffCount++;
  }
  let diffPercentByBucket;
  if (totalDiffCount > 0) {
    diffPercentByBucket = diffCountByBucket.map((count) => count / totalDiffCount * 100);
  } else {
    diffPercentByBucket = [];
  }
  return {
    totalDiffCount,
    totalMaxDiffByBucket,
    diffCountByBucket,
    diffPercentByBucket
  };
}
function categorizeComparisonTestSummaries(comparisonConfig, terseSummaries) {
  const allTestSummaries = restoreFromTerseSummaries(comparisonConfig, terseSummaries);
  const groupsByScenario = groupComparisonTestSummaries(allTestSummaries, "by-scenario");
  const byScenario = categorizeComparisonGroups(comparisonConfig, [...groupsByScenario.values()]);
  const groupsByDataset = groupComparisonTestSummaries(allTestSummaries, "by-dataset");
  const byDataset = categorizeComparisonGroups(comparisonConfig, [...groupsByDataset.values()]);
  return {
    allTestSummaries,
    byScenario,
    byDataset
  };
}
function groupComparisonTestSummaries(testSummaries, groupKind) {
  const groups = /* @__PURE__ */ new Map();
  for (const testSummary of testSummaries) {
    let groupKey;
    switch (groupKind) {
      case "by-dataset":
        groupKey = testSummary.d;
        break;
      case "by-scenario":
        groupKey = testSummary.s;
        break;
      default:
        (0, import_assert_never8.assertNever)(groupKind);
    }
    const group = groups.get(groupKey);
    if (group) {
      group.testSummaries.push(testSummary);
    } else {
      groups.set(groupKey, {
        kind: groupKind,
        key: groupKey,
        testSummaries: [testSummary]
      });
    }
  }
  return groups;
}
function categorizeComparisonGroups(comparisonConfig, allGroups) {
  const allGroupSummaries = /* @__PURE__ */ new Map();
  const withErrors = [];
  const onlyInLeft = [];
  const onlyInRight = [];
  let withDiffs = [];
  const withoutDiffs = [];
  function addSummaryForGroup(group, root, validInL, validInR) {
    let scores;
    if (validInL && validInR) {
      scores = getScoresForTestSummaries(group.testSummaries, comparisonConfig.thresholds);
    }
    const groupSummary = {
      root,
      group,
      scores
    };
    allGroupSummaries.set(group.key, groupSummary);
    if (validInL && validInR) {
      if (scores.totalDiffCount !== scores.diffCountByBucket[0]) {
        withDiffs.push(groupSummary);
      } else {
        withoutDiffs.push(groupSummary);
      }
    } else if (validInL) {
      onlyInLeft.push(groupSummary);
    } else if (validInR) {
      onlyInRight.push(groupSummary);
    } else {
      withErrors.push(groupSummary);
    }
  }
  for (const group of allGroups.values()) {
    switch (group.kind) {
      case "by-dataset": {
        const dataset = comparisonConfig.datasets.getDataset(group.key);
        const validInL = (dataset == null ? void 0 : dataset.outputVarL) !== void 0;
        const validInR = (dataset == null ? void 0 : dataset.outputVarR) !== void 0;
        addSummaryForGroup(group, dataset, validInL, validInR);
        break;
      }
      case "by-scenario": {
        const scenario = comparisonConfig.scenarios.getScenario(group.key);
        const validInL = (scenario == null ? void 0 : scenario.specL) !== void 0;
        const validInR = (scenario == null ? void 0 : scenario.specR) !== void 0;
        addSummaryForGroup(group, scenario, validInL, validInR);
        break;
      }
      default:
        (0, import_assert_never8.assertNever)(group.kind);
    }
  }
  if (withDiffs.length > 1) {
    if (withDiffs[0].group.kind === "by-dataset") {
      withDiffs = sortDatasetGroupSummaries(withDiffs);
    } else if (withDiffs[0].group.kind === "by-scenario") {
      withDiffs = sortScenarioGroupSummaries(withDiffs);
    }
  }
  return {
    allGroupSummaries,
    withErrors,
    onlyInLeft,
    onlyInRight,
    withDiffs,
    withoutDiffs
  };
}
function sortDatasetGroupSummaries(summaries) {
  return summaries.sort((a, b2) => {
    var _a, _b;
    const scoreResult = compareScores(a.scores, b2.scores);
    if (scoreResult !== 0) {
      return -scoreResult;
    } else {
      const aVar = a.root.outputVarL;
      const bVar = b2.root.outputVarR;
      const aSource = ((_a = aVar.sourceName) == null ? void 0 : _a.toLowerCase()) || "";
      const bSource = ((_b = bVar.sourceName) == null ? void 0 : _b.toLowerCase()) || "";
      if (aSource !== bSource) {
        return aSource.localeCompare(bSource);
      } else {
        const aName = aVar.varName.toLowerCase();
        const bName = bVar.varName.toLowerCase();
        return aName.localeCompare(bName);
      }
    }
  });
}
function sortScenarioGroupSummaries(summaries) {
  return summaries.sort((a, b2) => {
    var _a, _b;
    const scoreResult = compareScores(a.scores, b2.scores);
    if (scoreResult !== 0) {
      return -scoreResult;
    } else {
      const aScenario = a.root;
      const bScenario = b2.root;
      const aTitle = aScenario.title.toLowerCase();
      const bTitle = bScenario.title.toLowerCase();
      if (aTitle !== bTitle) {
        return aTitle.localeCompare(bTitle);
      } else {
        const aSubtitle = ((_a = aScenario.subtitle) == null ? void 0 : _a.toLowerCase()) || "";
        const bSubtitle = ((_b = bScenario.subtitle) == null ? void 0 : _b.toLowerCase()) || "";
        return aSubtitle.localeCompare(bSubtitle);
      }
    }
  });
}
function compareScores(a, b2) {
  if (a.totalMaxDiffByBucket.length !== b2.totalMaxDiffByBucket.length) {
    return 0;
  }
  const len = a.totalMaxDiffByBucket.length;
  for (let i = len - 1; i >= 0; i--) {
    const aTotal = a.totalMaxDiffByBucket[i];
    const bTotal = b2.totalMaxDiffByBucket[i];
    if (aTotal > bTotal) {
      return 1;
    } else if (aTotal < bTotal) {
      return -1;
    }
  }
  return 0;
}
var comparison_schema_default = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Model Comparison Test",
  type: "array",
  description: "A group of model comparison scenarios and views.",
  items: {
    $ref: "#/$defs/top_level_array_item"
  },
  $defs: {
    //
    // TOP-LEVEL
    //
    top_level_array_item: {
      oneOf: [
        { $ref: "#/$defs/scenario_array_item" },
        { $ref: "#/$defs/scenario_group_array_item" },
        { $ref: "#/$defs/graph_group_array_item" },
        { $ref: "#/$defs/view_group_array_item" }
      ]
    },
    //
    // DATASETS
    //
    dataset: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string"
        },
        source: {
          type: "string"
        }
      },
      required: ["name"]
    },
    //
    // SCENARIOS
    //
    scenario_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        scenario: {
          $ref: "#/$defs/scenario"
        }
      },
      required: ["scenario"]
    },
    scenario: {
      oneOf: [
        { $ref: "#/$defs/scenario_with_input_at_position" },
        { $ref: "#/$defs/scenario_with_input_at_value" },
        { $ref: "#/$defs/scenario_with_multiple_input_settings" },
        { $ref: "#/$defs/scenario_with_inputs_in_preset_at_position" },
        // { $ref: '#/$defs/scenario_with_inputs_in_group_at_position' }
        { $ref: "#/$defs/scenario_preset" }
        // { $ref: '#/$defs/scenario_expand_for_each_input_in_group' }
      ]
    },
    scenario_position: {
      type: "string",
      enum: ["min", "max", "default"]
    },
    scenario_with_input_at_position: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string"
        },
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        with: {
          type: "string"
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["with", "at"]
    },
    scenario_with_input_at_value: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string"
        },
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        with: {
          type: "string"
        },
        at: {
          type: "number"
        }
      },
      required: ["with", "at"]
    },
    scenario_input_at_position: {
      type: "object",
      additionalProperties: false,
      properties: {
        input: {
          type: "string"
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["input", "at"]
    },
    scenario_input_at_value: {
      type: "object",
      additionalProperties: false,
      properties: {
        input: {
          type: "string"
        },
        at: {
          type: "number"
        }
      },
      required: ["input", "at"]
    },
    scenario_input_setting: {
      oneOf: [{ $ref: "#/$defs/scenario_input_at_position" }, { $ref: "#/$defs/scenario_input_at_value" }]
    },
    scenario_input_setting_array: {
      type: "array",
      items: {
        $ref: "#/$defs/scenario_input_setting"
      },
      minItems: 1
    },
    scenario_with_multiple_input_settings: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string"
        },
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        with: {
          $ref: "#/$defs/scenario_input_setting_array"
        }
      },
      required: ["with"]
    },
    scenario_with_inputs_in_preset_at_position: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string"
        },
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        with_inputs: {
          type: "string",
          enum: ["all"]
        },
        at: {
          $ref: "#/$defs/scenario_position"
        }
      },
      required: ["with_inputs", "at"]
    },
    scenario_preset: {
      type: "object",
      additionalProperties: false,
      properties: {
        preset: {
          type: "string",
          enum: ["matrix"]
        }
      },
      required: ["preset"]
    },
    //
    // SCENARIO GROUPS
    //
    scenario_group_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        scenario_group: {
          $ref: "#/$defs/scenario_group"
        }
      },
      required: ["scenario_group"]
    },
    scenario_group: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string"
        },
        title: {
          type: "string"
        },
        scenarios: {
          type: "array",
          items: {
            $ref: "#/$defs/scenario_group_scenarios_array_item"
          },
          minItems: 1
        }
      },
      required: ["title", "scenarios"]
    },
    scenario_group_scenarios_array_item: {
      oneOf: [{ $ref: "#/$defs/scenario_array_item" }, { $ref: "#/$defs/scenario_ref_array_item" }]
    },
    scenario_ref_id: {
      type: "string"
    },
    scenario_ref_object: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string"
        },
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        }
      },
      required: ["id"]
    },
    scenario_ref: {
      oneOf: [{ $ref: "#/$defs/scenario_ref_id" }, { $ref: "#/$defs/scenario_ref_object" }]
    },
    scenario_ref_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        scenario_ref: {
          $ref: "#/$defs/scenario_ref"
        }
      },
      required: ["scenario_ref"]
    },
    scenario_group_ref: {
      type: "object",
      additionalProperties: false,
      properties: {
        scenario_group_ref: {
          type: "string"
        }
      },
      required: ["scenario_group_ref"]
    },
    //
    // GRAPHS
    //
    graphs_preset: {
      type: "string",
      enum: ["all"]
    },
    graphs_array: {
      type: "array",
      items: {
        type: "string"
      },
      minItems: 1
    },
    graph_group_ref: {
      type: "object",
      additionalProperties: false,
      properties: {
        graph_group_ref: {
          type: "string"
        }
      },
      required: ["graph_group_ref"]
    },
    //
    // GRAPH GROUPS
    //
    graph_group_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        graph_group: {
          $ref: "#/$defs/graph_group"
        }
      },
      required: ["graph_group"]
    },
    graph_group: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "string"
        },
        graphs: {
          $ref: "#/$defs/graphs_array"
        }
      },
      required: ["id", "graphs"]
    },
    //
    // VIEWS
    //
    view: {
      oneOf: [{ $ref: "#/$defs/view_with_scenario" }, { $ref: "#/$defs/view_with_rows" }]
    },
    view_with_scenario: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        scenario_ref: {
          type: "string"
        },
        graphs: {
          $ref: "#/$defs/view_graphs"
        },
        graph_order: {
          $ref: "#/$defs/view_graph_order"
        }
      },
      required: ["scenario_ref"]
    },
    view_with_rows: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        rows: {
          $ref: "#/$defs/view_rows_array"
        }
      },
      required: ["title", "rows"]
    },
    view_rows_array: {
      type: "array",
      items: {
        $ref: "#/$defs/view_rows_array_item"
      },
      minItems: 1
    },
    view_rows_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        row: {
          $ref: "#/$defs/view_row"
        }
      }
    },
    view_row: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        boxes: {
          $ref: "#/$defs/view_boxes_array"
        }
      },
      required: ["title", "boxes"]
    },
    view_boxes_array: {
      type: "array",
      items: {
        $ref: "#/$defs/view_boxes_array_item"
      },
      minItems: 1
    },
    view_boxes_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        box: {
          $ref: "#/$defs/view_box"
        }
      }
    },
    view_box: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string"
        },
        subtitle: {
          type: "string"
        },
        dataset: {
          $ref: "#/$defs/dataset"
        },
        scenario_ref: {
          $ref: "#/$defs/scenario_ref_id"
        }
      },
      required: ["title", "dataset", "scenario_ref"]
    },
    view_graphs: {
      oneOf: [{ $ref: "#/$defs/graphs_preset" }, { $ref: "#/$defs/graphs_array" }, { $ref: "#/$defs/graph_group_ref" }]
    },
    view_graph_order: {
      type: "string",
      enum: ["default", "grouped-by-diffs"]
    },
    //
    // VIEW GROUPS
    //
    view_group_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        view_group: {
          $ref: "#/$defs/view_group"
        }
      },
      required: ["view_group"]
    },
    view_group: {
      oneOf: [
        { $ref: "#/$defs/view_group_with_views_array" },
        { $ref: "#/$defs/view_group_shorthand_with_scenarios_array" }
      ]
    },
    view_group_with_views_array: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string"
        },
        views: {
          type: "array",
          items: {
            $ref: "#/$defs/view_group_views_array_item"
          },
          minItems: 1
        }
      },
      required: ["title", "views"]
    },
    view_group_views_array_item: {
      type: "object",
      additionalProperties: false,
      properties: {
        view: {
          $ref: "#/$defs/view"
        }
      }
    },
    view_group_shorthand_with_scenarios_array: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string"
        },
        scenarios: {
          type: "array",
          items: {
            $ref: "#/$defs/view_group_scenarios_array_item"
          },
          minItems: 1
        },
        graphs: {
          $ref: "#/$defs/view_graphs"
        }
      },
      required: ["title", "scenarios", "graphs"]
    },
    view_group_scenarios_array_item: {
      oneOf: [{ $ref: "#/$defs/scenario_ref_array_item" }, { $ref: "#/$defs/scenario_group_ref" }]
    }
  }
};
function parseComparisonSpecs(specSource) {
  const scenarios = [];
  const scenarioGroups = [];
  const graphGroups = [];
  const viewGroups = [];
  const ajv = new import_ajv2.default();
  const validate = ajv.compile(comparison_schema_default);
  let parsed;
  switch (specSource.kind) {
    case "json":
      parsed = JSON.parse(specSource.content);
      break;
    case "yaml":
      parsed = browser_default.parse(specSource.content);
      break;
    default:
      (0, import_assert_never9.default)(specSource.kind);
  }
  if (validate(parsed)) {
    for (const specItem of parsed) {
      if ("scenario" in specItem) {
        scenarios.push(scenarioSpecFromParsed(specItem.scenario));
      } else if ("scenario_group" in specItem) {
        scenarioGroups.push(scenarioGroupSpecFromParsed(specItem.scenario_group));
      } else if ("graph_group" in specItem) {
        graphGroups.push(graphGroupSpecFromParsed(specItem.graph_group));
      } else if ("view_group" in specItem) {
        viewGroups.push(viewGroupSpecFromParsed(specItem.view_group));
      }
    }
  } else {
    let msg = "Failed to parse YAML comparison definitions";
    for (const error of validate.errors || []) {
      if (error.message) {
        msg += `
${error.message}`;
      }
    }
    return err(new Error(msg));
  }
  return ok({
    scenarios,
    scenarioGroups,
    graphGroups,
    viewGroups
  });
}
function datasetSpecFromParsed(parsedDataset) {
  return {
    kind: "dataset",
    name: parsedDataset.name,
    source: parsedDataset.source
  };
}
function scenarioSpecFromParsed(parsedScenario) {
  if (parsedScenario.preset === "matrix") {
    return {
      kind: "scenario-matrix"
    };
  }
  if (parsedScenario.with !== void 0) {
    let inputSpecs;
    if (Array.isArray(parsedScenario.with)) {
      const parsedInputs = parsedScenario.with;
      inputSpecs = parsedInputs.map(inputSpecFromParsed);
    } else {
      inputSpecs = [
        inputSpecFromParsed({
          input: parsedScenario.with,
          at: parsedScenario.at
        })
      ];
    }
    return {
      kind: "scenario-with-inputs",
      id: parsedScenario.id,
      title: parsedScenario.title,
      subtitle: parsedScenario.subtitle,
      inputs: inputSpecs
    };
  }
  if (parsedScenario.with_inputs === "all") {
    return {
      kind: "scenario-with-all-inputs",
      id: parsedScenario.id,
      title: parsedScenario.title,
      subtitle: parsedScenario.subtitle,
      position: parsedScenario.at
    };
  }
  throw new Error(`Unable to convert parsed scenario: ${JSON.stringify(parsedScenario)}`);
}
function inputSpecFromParsed(parsedInput) {
  if (typeof parsedInput.at === "number") {
    const value = parsedInput.at;
    return {
      kind: "input-at-value",
      inputName: parsedInput.input,
      value
    };
  } else {
    return {
      kind: "input-at-position",
      inputName: parsedInput.input,
      position: parsedInput.at
    };
  }
}
function scenarioGroupSpecFromParsed(parsedScenarioGroup) {
  const scenarioSpecs = parsedScenarioGroup.scenarios.map(
    (parsedScenarioOrRef) => {
      if ("scenario_ref" in parsedScenarioOrRef) {
        return scenarioRefSpecFromParsed(parsedScenarioOrRef);
      } else {
        return scenarioSpecFromParsed(parsedScenarioOrRef.scenario);
      }
    }
  );
  return {
    kind: "scenario-group",
    id: parsedScenarioGroup.id,
    title: parsedScenarioGroup.title,
    scenarios: scenarioSpecs
  };
}
function scenarioRefSpecFromParsed(parsedScenarioRef) {
  if (typeof parsedScenarioRef.scenario_ref === "string") {
    return {
      kind: "scenario-ref",
      scenarioId: parsedScenarioRef.scenario_ref
    };
  } else {
    return {
      kind: "scenario-ref",
      scenarioId: parsedScenarioRef.scenario_ref.id,
      title: parsedScenarioRef.scenario_ref.title,
      subtitle: parsedScenarioRef.scenario_ref.subtitle
    };
  }
}
function scenarioGroupRefSpecFromParsed(parsedGroupRef) {
  return {
    kind: "scenario-group-ref",
    groupId: parsedGroupRef.scenario_group_ref
  };
}
function graphGroupSpecFromParsed(parsedGraphGroup) {
  return {
    kind: "graph-group",
    id: parsedGraphGroup.id,
    graphIds: parsedGraphGroup.graphs
  };
}
function viewSpecFromParsed(parsedView) {
  let scenarioId;
  let rows;
  if (parsedView.scenario_ref !== void 0) {
    scenarioId = parsedView.scenario_ref;
  } else if (parsedView.rows !== void 0) {
    rows = parsedView.rows.map((item) => viewRowSpecFromParsed(item.row));
  }
  let graphs;
  if (parsedView.graphs !== void 0) {
    graphs = viewGraphsSpecFromParsed(parsedView.graphs);
  }
  return {
    kind: "view",
    title: parsedView.title,
    subtitle: parsedView.subtitle,
    scenarioId,
    rows,
    graphs,
    graphOrder: parsedView.graph_order
  };
}
function viewRowSpecFromParsed(parsedRow) {
  return {
    kind: "view-row",
    title: parsedRow.title,
    subtitle: parsedRow.subtitle,
    boxes: parsedRow.boxes.map((item) => viewBoxSpecFromParsed(item.box))
  };
}
function viewBoxSpecFromParsed(parsedBox) {
  return {
    kind: "view-box",
    title: parsedBox.title,
    subtitle: parsedBox.subtitle,
    dataset: datasetSpecFromParsed(parsedBox.dataset),
    scenarioId: parsedBox.scenario_ref
  };
}
function viewGraphsSpecFromParsed(parsedGraphs) {
  if (parsedGraphs === "all") {
    return {
      kind: "graphs-preset",
      preset: "all"
    };
  } else if (Array.isArray(parsedGraphs)) {
    return {
      kind: "graphs-array",
      graphIds: parsedGraphs
    };
  } else if ("graph_group_ref" in parsedGraphs) {
    return {
      kind: "graph-group-ref",
      groupId: parsedGraphs.graph_group_ref
    };
  } else {
    throw new Error("Invalid graphs spec in comparison view");
  }
}
function viewGroupSpecFromParsed(parsedViewGroup) {
  if (parsedViewGroup.views !== void 0) {
    return {
      kind: "view-group-with-views",
      title: parsedViewGroup.title,
      views: parsedViewGroup.views.map((item) => viewSpecFromParsed(item.view))
    };
  } else if (parsedViewGroup.scenarios !== void 0) {
    const scenarios = parsedViewGroup.scenarios.map(
      (parsedScenarioOrGroupRef) => {
        if ("scenario_ref" in parsedScenarioOrGroupRef) {
          return scenarioRefSpecFromParsed(parsedScenarioOrGroupRef);
        } else if ("scenario_group_ref" in parsedScenarioOrGroupRef) {
          return scenarioGroupRefSpecFromParsed(parsedScenarioOrGroupRef);
        } else {
          throw new Error("Invalid view group");
        }
      }
    );
    return {
      kind: "view-group-with-scenarios",
      title: parsedViewGroup.title,
      scenarios,
      graphs: viewGraphsSpecFromParsed(parsedViewGroup.graphs)
    };
  } else {
    throw new Error("Invalid view group");
  }
}
var ModelInputs = class {
  constructor(modelSpec) {
    this.inputsByLookupName = /* @__PURE__ */ new Map();
    this.inputIdAliases = /* @__PURE__ */ new Set();
    for (const inputVar of modelSpec.inputVars.values()) {
      const varNameKey = inputVar.varName.toLowerCase();
      this.inputsByLookupName.set(varNameKey, inputVar);
      if (inputVar.inputId) {
        const idAlias = `id ${inputVar.inputId}`;
        this.inputIdAliases.add(idAlias);
        const idKey = idAlias.toLowerCase();
        this.inputsByLookupName.set(idKey, inputVar);
      }
    }
    if (modelSpec.inputAliases) {
      for (const [alias, varId] of modelSpec.inputAliases.entries()) {
        const aliasKey = alias.toLowerCase();
        if (this.inputsByLookupName.has(aliasKey)) {
          console.warn(
            `WARNING: Input variable already defined with a name that collides with alias '${alias}', skipping`
          );
          continue;
        }
        const inputVar = modelSpec.inputVars.get(varId);
        if (inputVar === void 0) {
          console.warn(`WARNING: No input variable found for '${varId}' associated with alias '${alias}', skipping`);
          continue;
        }
        this.inputsByLookupName.set(aliasKey, inputVar);
      }
    }
  }
  /**
   * Return the set of `id XYZ` aliases for all input variables.
   */
  getAllInputIdAliases() {
    return [...this.inputIdAliases];
  }
  /**
   * Return the `InputVar` that matches the requested name (either by variable name or alias).
   *
   * @param name The variable name or alias to match.
   */
  getInputVarForName(name) {
    return this.inputsByLookupName.get(name.toLowerCase());
  }
};
function scenarioSpecsFromSettings(settings) {
  switch (settings.kind) {
    case "all-inputs-settings": {
      const scenario = allInputsAtPositionSpec(settings.position);
      return [scenario, scenario];
    }
    case "input-settings": {
      const specL = scenarioSpecFromInputs(settings.inputs, "left");
      const specR = scenarioSpecFromInputs(settings.inputs, "right");
      return [specL, specR];
    }
    default:
      (0, import_assert_never11.assertNever)(settings);
  }
}
function scenarioSpecFromInputs(inputs, side) {
  const settings = [];
  for (const input of inputs) {
    const state = side === "left" ? input.stateL : input.stateR;
    if (state.inputVar === void 0) {
      return void 0;
    }
    settings.push(inputSettingFromResolvedInputState(state));
  }
  return inputSettingsSpec(settings);
}
function inputSettingFromResolvedInputState(state) {
  const varId = state.inputVar.varId;
  if (state.position) {
    return positionSetting(varId, state.position);
  } else {
    return valueSetting(varId, state.value);
  }
}
function resolveComparisonSpecs(modelSpecL, modelSpecR, specs) {
  let key = 1;
  const genKey = () => {
    return `${key++}`;
  };
  const modelInputsL = new ModelInputs(modelSpecL);
  const modelInputsR = new ModelInputs(modelSpecR);
  const modelOutputs = new ModelOutputs(modelSpecL, modelSpecR);
  const resolvedScenarios = new ResolvedScenarios();
  for (const scenarioSpec of specs.scenarios || []) {
    resolvedScenarios.add(resolveScenariosFromSpec(modelInputsL, modelInputsR, scenarioSpec, genKey));
  }
  const partiallyResolvedScenarioGroups = [];
  for (const scenarioGroupSpec of specs.scenarioGroups || []) {
    const scenariosForGroup = [];
    for (const scenarioItem of scenarioGroupSpec.scenarios) {
      if (scenarioItem.kind === "scenario-ref") {
        scenariosForGroup.push(scenarioItem);
      } else {
        const scenarios = resolveScenariosFromSpec(modelInputsL, modelInputsR, scenarioItem, genKey);
        resolvedScenarios.add(scenarios);
        scenariosForGroup.push(...scenarios);
      }
    }
    partiallyResolvedScenarioGroups.push({
      spec: scenarioGroupSpec,
      scenarios: scenariosForGroup
    });
  }
  const resolvedScenarioGroups = new ResolvedScenarioGroups();
  for (const partiallyResolvedGroup of partiallyResolvedScenarioGroups) {
    const scenariosForGroup = [];
    for (const scenarioItem of partiallyResolvedGroup.scenarios) {
      if (scenarioItem.kind === "scenario-ref") {
        const referencedScenario = resolvedScenarios.getScenarioForId(scenarioItem.scenarioId);
        if (referencedScenario) {
          const resolvedScenario = __spreadValues({}, referencedScenario);
          if (scenarioItem.title) {
            resolvedScenario.title = scenarioItem.title;
          }
          if (scenarioItem.subtitle) {
            resolvedScenario.subtitle = scenarioItem.subtitle;
          }
          scenariosForGroup.push(resolvedScenario);
        } else {
          scenariosForGroup.push({
            kind: "unresolved-scenario-ref",
            scenarioId: scenarioItem.scenarioId
          });
        }
      } else {
        scenariosForGroup.push(scenarioItem);
      }
    }
    resolvedScenarioGroups.add({
      kind: "scenario-group",
      id: partiallyResolvedGroup.spec.id,
      title: partiallyResolvedGroup.spec.title,
      scenarios: scenariosForGroup
    });
  }
  const resolvedGraphGroups = new ResolvedGraphGroups();
  for (const graphGroupSpec of specs.graphGroups || []) {
    resolvedGraphGroups.add(graphGroupSpec);
  }
  const resolvedViewGroups = [];
  for (const viewGroupSpec of specs.viewGroups || []) {
    const resolvedViewGroup = resolveViewGroupFromSpec(
      modelSpecL,
      modelSpecR,
      modelOutputs,
      resolvedScenarios,
      resolvedScenarioGroups,
      resolvedGraphGroups,
      viewGroupSpec
    );
    resolvedViewGroups.push(resolvedViewGroup);
  }
  return {
    scenarios: resolvedScenarios.getAll(),
    scenarioGroups: resolvedScenarioGroups.getAll(),
    viewGroups: resolvedViewGroups
  };
}
var ModelOutputs = class {
  constructor(modelSpecL, modelSpecR) {
    this.modelSpecL = modelSpecL;
    this.modelSpecR = modelSpecR;
  }
  getDatasetForName(name, source) {
    function findOutputVar(modelSpec) {
      for (const outputVar of modelSpec.outputVars.values()) {
        if (outputVar.varName === name && outputVar.sourceName === source) {
          return outputVar;
        }
      }
      return void 0;
    }
    const outputVarR = findOutputVar(this.modelSpecR);
    if (outputVarR) {
      const datasetKey = outputVarR.datasetKey;
      const outputVarL = this.modelSpecL.outputVars.get(datasetKey);
      return {
        kind: "dataset",
        key: datasetKey,
        outputVarL,
        outputVarR
      };
    } else {
      return void 0;
    }
  }
};
var ResolvedScenarios = class {
  constructor() {
    this.resolvedScenarios = [];
    this.resolvedScenariosById = /* @__PURE__ */ new Map();
  }
  add(scenarios) {
    for (const resolvedScenario of scenarios) {
      this.resolvedScenarios.push(resolvedScenario);
      if (resolvedScenario.id !== void 0) {
        if (this.resolvedScenariosById.has(resolvedScenario.id)) {
          throw new Error(`Multiple scenarios defined with the same id (${resolvedScenario.id})`);
        }
        this.resolvedScenariosById.set(resolvedScenario.id, resolvedScenario);
      }
    }
  }
  getAll() {
    return this.resolvedScenarios;
  }
  getScenarioForId(id) {
    return this.resolvedScenariosById.get(id);
  }
};
function resolveScenariosFromSpec(modelInputsL, modelInputsR, scenarioSpec, genKey) {
  switch (scenarioSpec.kind) {
    case "scenario-matrix":
      return resolveScenarioMatrix(modelInputsL, modelInputsR, genKey);
    case "scenario-with-all-inputs": {
      const position = inputPosition2(scenarioSpec.position);
      return [
        resolveScenarioWithAllInputsAtPosition(
          genKey(),
          scenarioSpec.id,
          scenarioSpec.title,
          scenarioSpec.subtitle,
          position
        )
      ];
    }
    case "scenario-with-inputs": {
      return [
        resolveScenarioForInputSpecs(
          modelInputsL,
          modelInputsR,
          genKey(),
          scenarioSpec.id,
          scenarioSpec.title,
          scenarioSpec.subtitle,
          scenarioSpec.inputs
        )
      ];
    }
    case "scenario-with-distinct-inputs": {
      return [
        resolveScenarioForDistinctInputSpecs(
          modelInputsL,
          modelInputsR,
          genKey(),
          scenarioSpec.id,
          scenarioSpec.title,
          scenarioSpec.subtitle,
          scenarioSpec.inputsL,
          scenarioSpec.inputsR
        )
      ];
    }
    default:
      (0, import_assert_never10.assertNever)(scenarioSpec);
  }
}
function resolveScenarioMatrix(modelInputsL, modelInputsR, genKey) {
  const resolvedScenarios = [];
  resolvedScenarios.push(
    resolveScenarioWithAllInputsAtPosition(genKey(), void 0, void 0, void 0, "at-default")
  );
  const inputIdAliases = /* @__PURE__ */ new Set();
  modelInputsL.getAllInputIdAliases().forEach((alias) => inputIdAliases.add(alias));
  modelInputsR.getAllInputIdAliases().forEach((alias) => inputIdAliases.add(alias));
  for (const inputIdAlias of inputIdAliases) {
    const inputAtMin = {
      kind: "input-at-position",
      inputName: inputIdAlias,
      position: "min"
    };
    const inputAtMax = {
      kind: "input-at-position",
      inputName: inputIdAlias,
      position: "max"
    };
    resolvedScenarios.push(
      resolveScenarioForInputSpecs(modelInputsL, modelInputsR, genKey(), void 0, void 0, void 0, [inputAtMin])
    );
    resolvedScenarios.push(
      resolveScenarioForInputSpecs(modelInputsL, modelInputsR, genKey(), void 0, void 0, void 0, [inputAtMax])
    );
  }
  return resolvedScenarios;
}
function resolveScenarioWithAllInputsAtPosition(key, id, title, subtitle, position) {
  const settings = {
    kind: "all-inputs-settings",
    position
  };
  const [specL, specR] = scenarioSpecsFromSettings(settings);
  return {
    kind: "scenario",
    key,
    id,
    title,
    subtitle,
    settings,
    specL,
    specR
  };
}
function resolveScenarioForInputSpecs(modelInputsL, modelInputsR, key, id, title, subtitle, inputSpecs) {
  const resolvedInputs = inputSpecs.map((inputSpec) => {
    switch (inputSpec.kind) {
      case "input-at-position":
        return resolveInputForName(modelInputsL, modelInputsR, inputSpec.inputName, inputSpec.position);
      case "input-at-value":
        return resolveInputForName(modelInputsL, modelInputsR, inputSpec.inputName, inputSpec.value);
      default:
        (0, import_assert_never10.assertNever)(inputSpec);
    }
  });
  const settings = {
    kind: "input-settings",
    inputs: resolvedInputs
  };
  const [specL, specR] = scenarioSpecsFromSettings(settings);
  return {
    kind: "scenario",
    key,
    id,
    title,
    subtitle,
    settings,
    specL,
    specR
  };
}
function resolveScenarioForDistinctInputSpecs(modelInputsL, modelInputsR, key, id, title, subtitle, inputSpecsL, inputSpecsR) {
  const inputsWithErrors = [];
  const settingsL = [];
  const settingsR = [];
  function resolveInputSpec(side, modelInputs, inputSpec) {
    let inputState;
    switch (inputSpec.kind) {
      case "input-at-position":
        inputState = resolveInputForNameInModel(modelInputs, inputSpec.inputName, inputSpec.position);
        break;
      case "input-at-value":
        inputState = resolveInputForNameInModel(modelInputs, inputSpec.inputName, inputSpec.value);
        break;
      default:
        (0, import_assert_never10.assertNever)(inputSpec);
    }
    if (inputState.error !== void 0) {
      inputsWithErrors.push({
        requestedName: inputSpec.inputName,
        stateL: side === "left" ? inputState : {},
        stateR: side === "right" ? inputState : {}
      });
    } else {
      const inputSetting = inputSettingFromResolvedInputState(inputState);
      if (side === "left") {
        settingsL.push(inputSetting);
      } else {
        settingsR.push(inputSetting);
      }
    }
  }
  inputSpecsL.forEach((inputSpec) => resolveInputSpec("left", modelInputsL, inputSpec));
  inputSpecsR.forEach((inputSpec) => resolveInputSpec("right", modelInputsR, inputSpec));
  let specL;
  let specR;
  if (inputsWithErrors.length === 0) {
    specL = inputSettingsSpec(settingsL);
    specR = inputSettingsSpec(settingsR);
  }
  return {
    kind: "scenario",
    key,
    id,
    title,
    subtitle,
    settings: {
      kind: "input-settings",
      inputs: inputsWithErrors
    },
    specL,
    specR
  };
}
function resolveInputForName(modelInputsL, modelInputsR, inputName, at2) {
  return {
    requestedName: inputName,
    stateL: resolveInputForNameInModel(modelInputsL, inputName, at2),
    stateR: resolveInputForNameInModel(modelInputsR, inputName, at2)
  };
}
function resolveInputForNameInModel(modelInputs, inputName, at2) {
  const inputVar = modelInputs.getInputVarForName(inputName);
  if (inputVar) {
    return resolveInputVar(inputVar, at2);
  } else {
    return {
      error: {
        kind: "unknown-input"
      }
    };
  }
}
function resolveInputVar(inputVar, at2) {
  if (typeof at2 === "number") {
    const value = at2;
    return resolveInputVarAtValue(inputVar, value);
  } else {
    const position = inputPosition2(at2);
    return resolveInputVarAtPosition(inputVar, position);
  }
}
function resolveInputVarAtPosition(inputVar, position) {
  return {
    inputVar,
    position,
    value: inputValueAtPosition2(inputVar, position)
  };
}
function resolveInputVarAtValue(inputVar, value) {
  if (value >= inputVar.minValue && value <= inputVar.maxValue) {
    return {
      inputVar,
      value
    };
  } else {
    return {
      error: {
        kind: "invalid-value"
      }
    };
  }
}
function inputPosition2(position) {
  switch (position) {
    case "default":
      return "at-default";
    case "min":
      return "at-minimum";
    case "max":
      return "at-maximum";
    default:
      return void 0;
  }
}
function inputValueAtPosition2(inputVar, position) {
  switch (position) {
    case "at-default":
      return inputVar.defaultValue;
    case "at-minimum":
      return inputVar.minValue;
    case "at-maximum":
      return inputVar.maxValue;
    default:
      (0, import_assert_never10.assertNever)(position);
  }
}
var ResolvedScenarioGroups = class {
  constructor() {
    this.resolvedGroups = [];
    this.resolvedGroupsById = /* @__PURE__ */ new Map();
  }
  add(group) {
    this.resolvedGroups.push(group);
    if (group.id !== void 0) {
      if (this.resolvedGroupsById.has(group.id)) {
        throw new Error(`Multiple scenario groups defined with the same id (${group.id})`);
      }
      this.resolvedGroupsById.set(group.id, group);
    }
  }
  getAll() {
    return this.resolvedGroups;
  }
  getGroupForId(id) {
    return this.resolvedGroupsById.get(id);
  }
};
var ResolvedGraphGroups = class {
  constructor() {
    this.resolvedGroupsById = /* @__PURE__ */ new Map();
  }
  add(group) {
    if (this.resolvedGroupsById.has(group.id)) {
      throw new Error(`Multiple graph groups defined with the same id (${group.id})`);
    }
    this.resolvedGroupsById.set(group.id, group);
  }
  getGroupForId(id) {
    return this.resolvedGroupsById.get(id);
  }
};
function resolveGraphsFromSpec(modelSpecL, modelSpecR, resolvedGraphGroups, graphsSpec) {
  switch (graphsSpec.kind) {
    case "graphs-preset": {
      switch (graphsSpec.preset) {
        case "all": {
          const graphIds = /* @__PURE__ */ new Set();
          const addGraphIds = (modelSpec) => {
            if (modelSpec.graphSpecs) {
              for (const graphSpec of modelSpec.graphSpecs) {
                graphIds.add(graphSpec.id);
              }
            }
          };
          addGraphIds(modelSpecL);
          addGraphIds(modelSpecR);
          return [...graphIds];
        }
        default:
          (0, import_assert_never10.assertNever)(graphsSpec.preset);
      }
    }
    case "graphs-array":
      return graphsSpec.graphIds;
    case "graph-group-ref": {
      const groupSpec = resolvedGraphGroups.getGroupForId(graphsSpec.groupId);
      if (groupSpec === void 0) {
        throw new Error(`No graph group found for id ${graphsSpec.groupId}`);
      }
      return groupSpec.graphIds;
    }
    default:
      (0, import_assert_never10.assertNever)(graphsSpec);
  }
}
function resolveViewForScenarioId(resolvedScenarios, viewTitle, viewSubtitle, scenarioId, graphIds, graphOrder) {
  const resolvedScenario = resolvedScenarios.getScenarioForId(scenarioId);
  if (resolvedScenario) {
    return resolveViewForScenario(viewTitle, viewSubtitle, resolvedScenario, graphIds, graphOrder);
  } else {
    return unresolvedViewForScenarioId(viewTitle, viewSubtitle, scenarioId);
  }
}
function resolveViewForScenarioRefSpec(resolvedScenarios, refSpec, graphIds, graphOrder) {
  const resolvedScenario = resolvedScenarios.getScenarioForId(refSpec.scenarioId);
  if (resolvedScenario) {
    return resolveViewForScenario(refSpec.title, refSpec.subtitle, resolvedScenario, graphIds, graphOrder);
  } else {
    return unresolvedViewForScenarioId(void 0, void 0, refSpec.scenarioId);
  }
}
function resolveViewForScenario(viewTitle, viewSubtitle, resolvedScenario, graphIds, graphOrder) {
  if (viewTitle === void 0) {
    viewTitle = resolvedScenario.title;
    if (viewTitle === void 0) {
      viewTitle = "Untitled view";
    }
    if (viewSubtitle === void 0) {
      viewSubtitle = resolvedScenario.subtitle;
    }
  }
  return {
    kind: "view",
    title: viewTitle,
    subtitle: viewSubtitle,
    scenario: resolvedScenario,
    graphIds,
    graphOrder
  };
}
function resolveViewBoxForSpec(modelOutputs, resolvedScenarios, boxSpec) {
  const resolvedDataset = modelOutputs.getDatasetForName(boxSpec.dataset.name, boxSpec.dataset.source);
  if (resolvedDataset === void 0) {
    return {
      kind: "unresolved-view-box",
      datasetName: boxSpec.dataset.name,
      datasetSource: boxSpec.dataset.source
    };
  }
  const resolvedScenario = resolvedScenarios.getScenarioForId(boxSpec.scenarioId);
  if (resolvedScenario === void 0) {
    return {
      kind: "unresolved-view-box",
      scenarioId: boxSpec.scenarioId
    };
  }
  return {
    kind: "view-box",
    title: boxSpec.title,
    subtitle: boxSpec.subtitle,
    dataset: resolvedDataset,
    scenario: resolvedScenario
  };
}
function resolveViewRowForSpec(modelOutputs, resolvedScenarios, rowSpec) {
  const resolvedBoxes = [];
  for (const boxSpec of rowSpec.boxes) {
    const box = resolveViewBoxForSpec(modelOutputs, resolvedScenarios, boxSpec);
    if (box.kind === "view-box") {
      resolvedBoxes.push(box);
    } else {
      return box;
    }
  }
  return {
    kind: "view-row",
    title: rowSpec.title,
    subtitle: rowSpec.subtitle,
    boxes: resolvedBoxes
  };
}
function resolveViewWithRowSpecs(modelOutputs, resolvedScenarios, viewTitle, viewSubtitle, rowSpecs) {
  const resolvedRows = [];
  for (const rowSpec of rowSpecs) {
    const row = resolveViewRowForSpec(modelOutputs, resolvedScenarios, rowSpec);
    if (row.kind === "view-row") {
      resolvedRows.push(row);
    } else {
      return unresolvedViewForScenarioId(viewTitle, viewSubtitle, row.scenarioId, row.datasetName, row.datasetSource);
    }
  }
  if (viewTitle === void 0) {
    viewTitle = "Untitled view";
  }
  return {
    kind: "view",
    title: viewTitle,
    subtitle: viewSubtitle,
    rows: resolvedRows,
    // TODO: The schema doesn't currently allow for graphs in a view that is defined
    // with rows.  Probably we should have different view types to make this more clear.
    graphIds: [],
    graphOrder: "default"
  };
}
function unresolvedViewForScenarioId(viewTitle, viewSubtitle, scenarioId, datasetName, datasetSource) {
  return {
    kind: "unresolved-view",
    title: viewTitle,
    subtitle: viewSubtitle,
    scenarioId,
    datasetName,
    datasetSource
  };
}
function unresolvedViewForScenarioGroupId(viewTitle, viewSubtitle, scenarioGroupId) {
  return {
    kind: "unresolved-view",
    title: viewTitle,
    subtitle: viewSubtitle,
    scenarioGroupId
  };
}
function resolveViewGroupFromSpec(modelSpecL, modelSpecR, modelOutputs, resolvedScenarios, resolvedScenarioGroups, resolvedGraphGroups, viewGroupSpec) {
  let views;
  switch (viewGroupSpec.kind) {
    case "view-group-with-views": {
      views = viewGroupSpec.views.map((viewSpec) => {
        if (viewSpec.scenarioId) {
          let graphIds;
          if (viewSpec.graphs) {
            graphIds = resolveGraphsFromSpec(modelSpecL, modelSpecR, resolvedGraphGroups, viewSpec.graphs);
          } else {
            graphIds = [];
          }
          return resolveViewForScenarioId(
            resolvedScenarios,
            viewSpec.title,
            viewSpec.subtitle,
            viewSpec.scenarioId,
            graphIds,
            viewSpec.graphOrder || "default"
          );
        } else {
          return resolveViewWithRowSpecs(
            modelOutputs,
            resolvedScenarios,
            viewSpec.title,
            viewSpec.subtitle,
            viewSpec.rows
          );
        }
      });
      break;
    }
    case "view-group-with-scenarios": {
      const graphIds = resolveGraphsFromSpec(modelSpecL, modelSpecR, resolvedGraphGroups, viewGroupSpec.graphs);
      const graphOrder = viewGroupSpec.graphOrder || "default";
      views = [];
      for (const refSpec of viewGroupSpec.scenarios) {
        switch (refSpec.kind) {
          case "scenario-ref":
            views.push(resolveViewForScenarioRefSpec(resolvedScenarios, refSpec, graphIds, graphOrder));
            break;
          case "scenario-group-ref": {
            const resolvedGroup = resolvedScenarioGroups.getGroupForId(refSpec.groupId);
            if (resolvedGroup) {
              for (const scenario of resolvedGroup.scenarios) {
                switch (scenario.kind) {
                  case "unresolved-scenario-ref":
                    views.push(unresolvedViewForScenarioId(void 0, void 0, scenario.scenarioId));
                    break;
                  case "scenario":
                    views.push(resolveViewForScenario(void 0, void 0, scenario, graphIds, graphOrder));
                    break;
                  default:
                    (0, import_assert_never10.assertNever)(scenario);
                }
              }
            } else {
              views.push(unresolvedViewForScenarioGroupId(void 0, void 0, refSpec.groupId));
            }
            break;
          }
          default:
            (0, import_assert_never10.assertNever)(refSpec);
        }
      }
      break;
    }
    default:
      (0, import_assert_never10.assertNever)(viewGroupSpec);
  }
  return {
    kind: "view-group",
    title: viewGroupSpec.title,
    views
  };
}
function resolveComparisonSpecsFromSources(modelSpecL, modelSpecR, specSources) {
  const combinedSpecs = {
    scenarios: [],
    scenarioGroups: [],
    graphGroups: [],
    viewGroups: []
  };
  for (const specSource of specSources) {
    let specs;
    if ("kind" in specSource) {
      const parseResult = parseComparisonSpecs(specSource);
      if (parseResult.isOk()) {
        specs = parseResult.value;
      } else {
        const filenamePart = specSource.filename ? ` in ${specSource.filename}` : "";
        console.error(`ERROR: Failed to parse comparison spec${filenamePart}, skipping`);
        continue;
      }
    } else {
      specs = specSource;
    }
    combinedSpecs.scenarios.push(...specs.scenarios || []);
    combinedSpecs.scenarioGroups.push(...specs.scenarioGroups || []);
    combinedSpecs.graphGroups.push(...specs.graphGroups || []);
    combinedSpecs.viewGroups.push(...specs.viewGroups || []);
  }
  return resolveComparisonSpecs(modelSpecL, modelSpecR, combinedSpecs);
}
function getComparisonDatasets(modelSpecL, modelSpecR, datasetOptions) {
  return new ComparisonDatasetsImpl(modelSpecL, modelSpecR, datasetOptions);
}
var ComparisonDatasetsImpl = class {
  /**
   * @param modelSpecL The model spec for the "left" bundle being compared.
   * @param modelSpecR The model spec for the "right" bundle being compared.
   * @param datasetOptions The custom configuration for the datasets to be compared.
   */
  constructor(modelSpecL, modelSpecR, datasetOptions) {
    this.modelSpecL = modelSpecL;
    this.modelSpecR = modelSpecR;
    this.datasetOptions = datasetOptions;
    const renamedDatasetKeys = datasetOptions == null ? void 0 : datasetOptions.renamedDatasetKeys;
    const invertedRenamedKeys = /* @__PURE__ */ new Map();
    renamedDatasetKeys == null ? void 0 : renamedDatasetKeys.forEach((newKey, oldKey) => {
      invertedRenamedKeys.set(newKey, oldKey);
    });
    function leftKeyForRightKey(rightKey) {
      return invertedRenamedKeys.get(rightKey) || rightKey;
    }
    const allOutputVarKeysSet = /* @__PURE__ */ new Set();
    const modelOutputVarKeysSet = /* @__PURE__ */ new Set();
    function addOutputVars(outputVars, handleRenames) {
      outputVars.forEach((outputVar, key) => {
        const remappedKey = handleRenames ? leftKeyForRightKey(key) : key;
        allOutputVarKeysSet.add(remappedKey);
        if (outputVar.sourceName === void 0) {
          modelOutputVarKeysSet.add(remappedKey);
        }
      });
    }
    addOutputVars(modelSpecL.outputVars, false);
    addOutputVars(modelSpecR.outputVars, true);
    this.allOutputVarKeys = Array.from(allOutputVarKeysSet);
    this.modelOutputVarKeys = Array.from(modelOutputVarKeysSet);
    this.allDatasets = /* @__PURE__ */ new Map();
    for (const datasetKeyL of this.allOutputVarKeys) {
      const datasetKeyR = (renamedDatasetKeys == null ? void 0 : renamedDatasetKeys.get(datasetKeyL)) || datasetKeyL;
      const outputVarL = modelSpecL.outputVars.get(datasetKeyL);
      const outputVarR = modelSpecR.outputVars.get(datasetKeyR);
      this.allDatasets.set(datasetKeyL, {
        kind: "dataset",
        key: datasetKeyL,
        outputVarL,
        outputVarR
      });
    }
  }
  // from ComparisonDatasets interface
  getAllDatasets() {
    return this.allDatasets.values();
  }
  // from ComparisonDatasets interface
  getDataset(datasetKey) {
    return this.allDatasets.get(datasetKey);
  }
  // from ComparisonDatasets interface
  getDatasetKeysForScenario(scenario) {
    var _a;
    if (((_a = this.datasetOptions) == null ? void 0 : _a.datasetKeysForScenario) !== void 0) {
      return this.datasetOptions.datasetKeysForScenario(this.allOutputVarKeys, scenario);
    } else {
      if (scenario.settings.kind === "all-inputs-settings" && scenario.settings.position === "at-default") {
        return this.allOutputVarKeys;
      } else {
        return this.modelOutputVarKeys;
      }
    }
  }
  // from ComparisonDatasets interface
  getReferencePlotsForDataset(datasetKey, scenario) {
    var _a;
    if (((_a = this.datasetOptions) == null ? void 0 : _a.referencePlotsForDataset) !== void 0) {
      const dataset = this.getDataset(datasetKey);
      if (dataset !== void 0) {
        return this.datasetOptions.referencePlotsForDataset(dataset, scenario);
      }
    }
    return [];
  }
  // from ComparisonDatasets interface
  getContextGraphIdsForDataset(datasetKey, scenario) {
    var _a;
    const dataset = this.getDataset(datasetKey);
    if (dataset === void 0) {
      return [];
    }
    if (((_a = this.datasetOptions) == null ? void 0 : _a.contextGraphIdsForDataset) !== void 0) {
      return this.datasetOptions.contextGraphIdsForDataset(dataset, scenario);
    } else {
      return getContextGraphIdsForDataset(this.modelSpecL, this.modelSpecR, dataset);
    }
  }
};
function getContextGraphIdsForDataset(modelSpecL, modelSpecR, dataset) {
  const contextGraphIds = /* @__PURE__ */ new Set();
  function addGraphs(modelSpec, outputVar) {
    for (const graphSpec of modelSpec.graphSpecs || []) {
      for (const graphDatasetSpec of graphSpec.datasets) {
        if (graphDatasetSpec.datasetKey === (outputVar == null ? void 0 : outputVar.datasetKey)) {
          contextGraphIds.add(graphSpec.id);
          break;
        }
      }
    }
  }
  addGraphs(modelSpecL, dataset.outputVarL);
  addGraphs(modelSpecR, dataset.outputVarR);
  return [...contextGraphIds];
}
function getComparisonScenarios(scenarios) {
  return new ComparisonScenariosImpl(scenarios);
}
var ComparisonScenariosImpl = class {
  constructor(scenarios) {
    this.scenarioDefs = /* @__PURE__ */ new Map();
    for (const scenario of scenarios) {
      this.scenarioDefs.set(scenario.key, scenario);
    }
  }
  /**
   * Return all `ComparisonScenario` instances that are available for comparisons.
   */
  getAllScenarios() {
    return this.scenarioDefs.values();
  }
  /**
   * Return the scenario definition for the given key.
   *
   * @param key The key for the scenario.
   */
  getScenario(key) {
    return this.scenarioDefs.get(key);
  }
};
function synchronizedBundleModel(sourceModel) {
  const promiseQueue = new PromiseQueue();
  return {
    modelSpec: sourceModel.modelSpec,
    getDatasetsForScenario: (scenarioSpec, datasetKeys) => {
      return promiseQueue.add(() => sourceModel.getDatasetsForScenario(scenarioSpec, datasetKeys));
    },
    getGraphDataForScenario: (scenarioSpec, graphId) => {
      return promiseQueue.add(() => sourceModel.getGraphDataForScenario(scenarioSpec, graphId));
    },
    getGraphLinksForScenario: sourceModel.getGraphLinksForScenario.bind(sourceModel)
  };
}
var PromiseQueue = class {
  constructor() {
    this.tasks = [];
    this.runningCount = 0;
  }
  add(f) {
    return new Promise((resolve, reject) => {
      const run = () => __async(this, null, function* () {
        this.runningCount++;
        const promise = f();
        try {
          const result = yield promise;
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          this.runningCount--;
          this.runNext();
        }
      });
      if (this.runningCount < 1) {
        run();
      } else {
        this.tasks.push(run);
      }
    });
  }
  runNext() {
    if (this.tasks.length > 0) {
      const task = this.tasks.shift();
      if (task) {
        task();
      }
    }
  }
};
function createConfig(options) {
  return __async(this, null, function* () {
    var _a;
    const origCurrentBundle = yield loadSynchronized(options.current);
    let currentBundle;
    let comparisonConfig;
    if (options.comparison === void 0) {
      currentBundle = origCurrentBundle;
    } else {
      const baselineBundle = yield loadSynchronized(options.comparison.baseline);
      const renamedDatasetKeys = (_a = options.comparison.datasets) == null ? void 0 : _a.renamedDatasetKeys;
      const invertedRenamedKeys = /* @__PURE__ */ new Map();
      renamedDatasetKeys == null ? void 0 : renamedDatasetKeys.forEach((newKey, oldKey) => {
        invertedRenamedKeys.set(newKey, oldKey);
      });
      const rightKeyForLeftKey = (leftKey) => {
        return (renamedDatasetKeys == null ? void 0 : renamedDatasetKeys.get(leftKey)) || leftKey;
      };
      const leftKeyForRightKey = (rightKey) => {
        return invertedRenamedKeys.get(rightKey) || rightKey;
      };
      const origBundleModelR = origCurrentBundle.model;
      const adjBundleModelR = {
        modelSpec: origBundleModelR.modelSpec,
        getDatasetsForScenario: (scenarioSpec, datasetKeys) => __async(this, null, function* () {
          const rightKeys = datasetKeys.map(rightKeyForLeftKey);
          const result = yield origBundleModelR.getDatasetsForScenario(scenarioSpec, rightKeys);
          const mapWithRightKeys = result.datasetMap;
          const mapWithLeftKeys = /* @__PURE__ */ new Map();
          for (const [rightKey, dataset] of mapWithRightKeys.entries()) {
            const leftKey = leftKeyForRightKey(rightKey);
            mapWithLeftKeys.set(leftKey, dataset);
          }
          return {
            datasetMap: mapWithLeftKeys,
            modelRunTime: result.modelRunTime
          };
        }),
        getGraphDataForScenario: origBundleModelR.getGraphDataForScenario.bind(origBundleModelR),
        getGraphLinksForScenario: origBundleModelR.getGraphLinksForScenario.bind(origBundleModelR)
      };
      currentBundle = __spreadProps(__spreadValues({}, origCurrentBundle), {
        model: adjBundleModelR
      });
      const modelSpecL = baselineBundle.model.modelSpec;
      const modelSpecR = currentBundle.model.modelSpec;
      const comparisonDefs = resolveComparisonSpecsFromSources(modelSpecL, modelSpecR, options.comparison.specs);
      comparisonConfig = {
        bundleL: baselineBundle,
        bundleR: currentBundle,
        thresholds: options.comparison.thresholds,
        scenarios: getComparisonScenarios(comparisonDefs.scenarios),
        datasets: getComparisonDatasets(modelSpecL, modelSpecR, options.comparison.datasets),
        viewGroups: comparisonDefs.viewGroups
      };
    }
    const checkConfig = {
      bundle: currentBundle,
      tests: options.check.tests
    };
    return {
      check: checkConfig,
      comparison: comparisonConfig
    };
  });
}
function loadSynchronized(sourceBundle) {
  return __async(this, null, function* () {
    const sourceModel = yield sourceBundle.bundle.initModel();
    const synchronizedModel = synchronizedBundleModel(sourceModel);
    return {
      name: sourceBundle.name,
      version: sourceBundle.bundle.version,
      model: synchronizedModel
    };
  });
}
var PerfStats = class {
  constructor() {
    this.times = [];
  }
  addRun(timeInMillis) {
    this.times.push(timeInMillis);
  }
  toReport() {
    if (this.times.length === 0) {
      return {
        minTime: 0,
        maxTime: 0,
        avgTime: 0,
        allTimes: []
      };
    }
    const minTime = Math.min(...this.times);
    const maxTime = Math.max(...this.times);
    const sortedTimes = this.times.sort();
    const minIndex = Math.floor(sortedTimes.length / 4);
    const maxIndex = minIndex + Math.ceil(sortedTimes.length / 2);
    const middleTimes = sortedTimes.slice(minIndex, maxIndex);
    const totalTime = middleTimes.reduce((a, b2) => a + b2, 0);
    const avgTime = totalTime / middleTimes.length;
    return {
      minTime,
      maxTime,
      avgTime,
      allTimes: sortedTimes
    };
  }
};
var warmupCount = 5;
var runCount = 100;
var PerfRunner = class {
  constructor(bundleModelL, bundleModelR, mode = "serial") {
    this.bundleModelL = bundleModelL;
    this.bundleModelR = bundleModelR;
    this.mode = mode;
    const scenarioSpec = allInputsAtPositionSpec("at-default");
    this.taskQueue = new TaskQueue({
      process: (request) => __async(this, null, function* () {
        switch (request.kind) {
          case "left": {
            const result = yield bundleModelL.getDatasetsForScenario(scenarioSpec, []);
            return {
              runTimeL: result.modelRunTime
            };
          }
          case "right": {
            const result = yield bundleModelR.getDatasetsForScenario(scenarioSpec, []);
            return {
              runTimeR: result.modelRunTime
            };
          }
          case "both": {
            const [resultL, resultR] = yield Promise.all([
              bundleModelL.getDatasetsForScenario(scenarioSpec, []),
              bundleModelR.getDatasetsForScenario(scenarioSpec, [])
            ]);
            return {
              runTimeL: resultL.modelRunTime,
              runTimeR: resultR.modelRunTime
            };
          }
          default:
            (0, import_assert_never12.assertNever)(request.kind);
        }
      })
    });
  }
  start() {
    const statsL = new PerfStats();
    const statsR = new PerfStats();
    this.taskQueue.onIdle = (error) => {
      var _a;
      if (error) {
        this.onError(error);
      } else {
        (_a = this.onComplete) == null ? void 0 : _a.call(this, statsL.toReport(), statsR.toReport());
      }
    };
    const taskQueue = this.taskQueue;
    function addTask(index, warmup, kind) {
      const key = `${warmup ? "warmup-" : ""}${kind}-${index}`;
      const request = {
        kind
      };
      taskQueue.addTask(key, request, (response) => {
        if (!warmup && response.runTimeL !== void 0) {
          statsL.addRun(response.runTimeL);
        }
        if (!warmup && response.runTimeR !== void 0) {
          statsR.addRun(response.runTimeR);
        }
      });
    }
    function addTasks(kind) {
      for (let i = 0; i < warmupCount; i++) {
        addTask(i, true, kind);
      }
      for (let i = 0; i < runCount; i++) {
        addTask(i, false, kind);
      }
    }
    if (this.mode === "parallel") {
      addTasks("both");
    } else {
      addTasks("left");
      addTasks("right");
    }
  }
};
var DataPlanner = class {
  /**
   * @param batchSize The maximum number of impl vars that can be fetched
   * with a single request; this is usually the same as the number of
   * normal model outputs.
   */
  constructor(batchSize) {
    this.batchSize = batchSize;
    this.taskSetsLR = /* @__PURE__ */ new Map();
    this.taskSetsL = /* @__PURE__ */ new Map();
    this.taskSetsR = /* @__PURE__ */ new Map();
    this.complete = false;
  }
  /**
   * Add a request to the plan for the given scenario(s) and data task.
   *
   * @param scenarioSpecL The input scenario used to configure the "left" model, or undefined if no data
   * is needed from the left model.
   * @param scenarioSpecR The input scenario used to configure the "right" model, or undefined if no data
   * is needed from the right model.
   * @param datasetKey The key for the dataset to be fetched from each model for the given scenario.
   * @param dataAction The action to be performed with the fetched datasets.
   */
  addRequest(scenarioSpecL, scenarioSpecR, datasetKey, dataAction) {
    if (scenarioSpecL === void 0 && scenarioSpecR === void 0) {
      console.warn("WARNING: Both scenario specs are undefined for DataPlanner request, skipping");
      return;
    }
    let taskSetsMap;
    let uid;
    if (scenarioSpecL && scenarioSpecR) {
      taskSetsMap = this.taskSetsLR;
      uid = scenarioPairUid(scenarioSpecL, scenarioSpecR);
    } else if (scenarioSpecR) {
      taskSetsMap = this.taskSetsR;
      uid = scenarioSpecR.uid;
    } else {
      taskSetsMap = this.taskSetsL;
      uid = scenarioSpecL.uid;
    }
    let taskSet = taskSetsMap.get(uid);
    if (!taskSet) {
      taskSet = new DataTaskSet(scenarioSpecL, scenarioSpecR);
      taskSetsMap.set(uid, taskSet);
    }
    taskSet.addTask({
      datasetKey,
      dataAction
    });
  }
  /**
   * Build a plan that minimizes the number of data fetches needed.
   */
  buildPlan() {
    if (this.complete) {
      throw new Error("DataPlanner.buildPlan() can only be called once");
    }
    this.complete = true;
    const lKeyMappings = /* @__PURE__ */ new Map();
    const rKeyMappings = /* @__PURE__ */ new Map();
    for (const lrUid of this.taskSetsLR.keys()) {
      const [lUid, rUid] = lrUid.split("::");
      if (!lKeyMappings.has(lUid)) {
        lKeyMappings.set(lUid, lrUid);
      }
      if (!rKeyMappings.has(rUid)) {
        rKeyMappings.set(rUid, lrUid);
      }
    }
    function merge(taskSetsLR, taskSetsForSide, keyMappingsForSide) {
      for (const [keyForSide, taskSetForSide] of taskSetsForSide.entries()) {
        const lrKey = keyMappingsForSide.get(keyForSide);
        if (lrKey) {
          const taskSetLR = taskSetsLR.get(lrKey);
          taskSetLR.merge(taskSetForSide);
          taskSetsForSide.delete(keyForSide);
        }
      }
    }
    merge(this.taskSetsLR, this.taskSetsL, lKeyMappings);
    merge(this.taskSetsLR, this.taskSetsR, rKeyMappings);
    const requests = [];
    const batchSize = this.batchSize;
    function addRequests(taskSets) {
      for (const taskSet of taskSets) {
        requests.push(...taskSet.buildRequests(batchSize));
      }
    }
    addRequests(this.taskSetsLR.values());
    addRequests(this.taskSetsL.values());
    addRequests(this.taskSetsR.values());
    return {
      requests
    };
  }
};
var DataTaskSet = class {
  constructor(scenarioSpecL, scenarioSpecR) {
    this.scenarioSpecL = scenarioSpecL;
    this.scenarioSpecR = scenarioSpecR;
    this.modelTasks = /* @__PURE__ */ new Map();
    this.modelImplTasks = /* @__PURE__ */ new Map();
  }
  /**
   * Add a task that will be performed when the data is fetched for the scenario(s)
   * associated with this task set.
   *
   * @param dataTask A task that performs an action using the fetched dataset(s).
   */
  addTask(dataTask) {
    let taskMap;
    if (dataTask.datasetKey.startsWith("ModelImpl")) {
      taskMap = this.modelImplTasks;
    } else {
      taskMap = this.modelTasks;
    }
    let tasks = taskMap.get(dataTask.datasetKey);
    if (!tasks) {
      tasks = [];
      taskMap.set(dataTask.datasetKey, tasks);
    }
    tasks.push(dataTask);
  }
  /**
   * Add all tasks from the given set into this set.
   *
   * @param otherTaskSet The other task set that will be merged into this one.
   */
  merge(otherTaskSet) {
    for (const tasks of otherTaskSet.modelTasks.values()) {
      for (const task of tasks) {
        this.addTask(task);
      }
    }
    for (const tasks of otherTaskSet.modelImplTasks.values()) {
      for (const task of tasks) {
        this.addTask(task);
      }
    }
  }
  /**
   * Create one or more data requests that can be used to fetch data for the configured scenario(s).
   *
   * @param batchSize The maximum number of impl vars that can be fetched with a single request.
   * This is usually the same as the number of normal model outputs.
   */
  buildRequests(batchSize) {
    const dataRequests = [];
    if (this.modelTasks.size > 0) {
      const dataTasks = [];
      this.modelTasks.forEach((tasks) => dataTasks.push(...tasks));
      dataRequests.push({
        scenarioSpecL: this.scenarioSpecL,
        scenarioSpecR: this.scenarioSpecR,
        dataTasks
      });
    }
    if (this.modelImplTasks.size > 0) {
      const allKeys = [...this.modelImplTasks.keys()];
      for (let i = 0; i < allKeys.length; i += batchSize) {
        const batchKeys = allKeys.slice(i, i + batchSize);
        const dataTasks = [];
        for (const datasetKey of batchKeys) {
          dataTasks.push(...this.modelImplTasks.get(datasetKey));
        }
        dataRequests.push({
          scenarioSpecL: this.scenarioSpecL,
          scenarioSpecR: this.scenarioSpecR,
          dataTasks
        });
      }
    }
    return dataRequests;
  }
};
function scenarioPairUid(scenarioSpecL, scenarioSpecR) {
  const uidL = (scenarioSpecL == null ? void 0 : scenarioSpecL.uid) || "";
  const uidR = (scenarioSpecR == null ? void 0 : scenarioSpecR.uid) || "";
  return `${uidL}::${uidR}`;
}
function runChecks(checkConfig, checkSpec, dataPlanner, refDataPlanner, simplifyScenarios) {
  const modelSpec = checkConfig.bundle.model.modelSpec;
  const checkPlanner = new CheckPlanner(modelSpec);
  checkPlanner.addAllChecks(checkSpec, simplifyScenarios);
  const checkPlan = checkPlanner.buildPlan();
  const refDatasets = /* @__PURE__ */ new Map();
  for (const [dataRefKey, dataRef] of checkPlan.dataRefs.entries()) {
    refDataPlanner.addRequest(void 0, dataRef.scenario.spec, dataRef.dataset.datasetKey, (datasets) => {
      const dataset = datasets.datasetR;
      if (dataset) {
        refDatasets.set(dataRefKey, dataset);
      }
    });
  }
  const checkResults = /* @__PURE__ */ new Map();
  for (const [checkKey, checkTask] of checkPlan.tasks.entries()) {
    dataPlanner.addRequest(void 0, checkTask.scenario.spec, checkTask.dataset.datasetKey, (datasets) => {
      const dataset = datasets.datasetR;
      const checkResult = runCheck(checkTask, dataset, refDatasets);
      checkResults.set(checkKey, checkResult);
    });
  }
  return () => {
    return buildCheckReport(checkPlan, checkResults);
  };
}
function runCheck(checkTask, dataset, refDatasets) {
  if (dataset === void 0) {
    return {
      status: "error",
      message: "no data available"
    };
  }
  let opRefDatasets;
  if (checkTask.dataRefs) {
    opRefDatasets = /* @__PURE__ */ new Map();
    for (const [op, dataRef] of checkTask.dataRefs.entries()) {
      const refDataset = refDatasets == null ? void 0 : refDatasets.get(dataRef.key);
      if (refDataset === void 0) {
        if (dataRef.dataset.datasetKey === void 0) {
          return {
            status: "error",
            errorInfo: {
              kind: "unknown-dataset",
              name: dataRef.dataset.name
            }
          };
        } else if (dataRef.scenario.spec === void 0) {
          if (dataRef.scenario.error) {
            return {
              status: "error",
              errorInfo: {
                kind: dataRef.scenario.error.kind,
                name: dataRef.scenario.error.name
              }
            };
          } else {
            let inputName;
            if (dataRef.scenario.inputDescs.length > 0) {
              inputName = dataRef.scenario.inputDescs[0].name;
            } else {
              inputName = "unknown";
            }
            return {
              status: "error",
              errorInfo: {
                kind: "unknown-input",
                name: inputName
              }
            };
          }
        } else {
          return {
            status: "error",
            message: "unresolved data reference"
          };
        }
      }
      opRefDatasets.set(op, refDataset);
    }
  }
  return checkTask.action.run(dataset, opRefDatasets);
}
function runComparisons(comparisonConfig, dataPlanner) {
  const testReports = [];
  for (const scenario of comparisonConfig.scenarios.getAllScenarios()) {
    const datasetKeys = comparisonConfig.datasets.getDatasetKeysForScenario(scenario);
    for (const datasetKey of datasetKeys) {
      dataPlanner.addRequest(scenario.specL, scenario.specR, datasetKey, (datasets) => {
        const diffReport = diffDatasets(datasets.datasetL, datasets.datasetR);
        testReports.push({
          scenarioKey: scenario.key,
          datasetKey,
          diffReport
        });
      });
    }
  }
  return () => {
    return testReports;
  };
}
var SuiteRunner = class {
  constructor(config, callbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.perfStatsL = new PerfStats();
    this.perfStatsR = new PerfStats();
    this.stopped = false;
    this.taskQueue = new TaskQueue({
      process: (request) => {
        return this.processRequest(request);
      }
    });
  }
  cancel() {
    if (!this.stopped) {
      this.stopped = true;
      this.taskQueue.shutdown();
    }
  }
  start(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    (_b = (_a = this.callbacks).onProgress) == null ? void 0 : _b.call(_a, 0);
    const modelSpec = this.config.check.bundle.model.modelSpec;
    const dataPlanner = new DataPlanner(modelSpec.outputVars.size);
    const refDataPlanner = new DataPlanner(modelSpec.outputVars.size);
    const checkSpecResult = parseTestYaml(this.config.check.tests);
    if (checkSpecResult.isErr()) {
      (_d = (_c = this.callbacks).onError) == null ? void 0 : _d.call(_c, checkSpecResult.error);
      return;
    }
    const checkSpec = checkSpecResult.value;
    const simplifyScenarios = (options == null ? void 0 : options.simplifyScenarios) === true;
    const buildCheckReport2 = runChecks(this.config.check, checkSpec, dataPlanner, refDataPlanner, simplifyScenarios);
    let buildComparisonTestReports;
    if (this.config.comparison) {
      buildComparisonTestReports = runComparisons(this.config.comparison, dataPlanner);
    }
    this.taskQueue.onIdle = (error) => {
      var _a2, _b2, _c2, _d2;
      if (this.stopped) {
        return;
      }
      if (error) {
        (_b2 = (_a2 = this.callbacks).onError) == null ? void 0 : _b2.call(_a2, error);
      } else {
        const checkReport = buildCheckReport2();
        let comparisonReport;
        if (this.config.comparison) {
          comparisonReport = {
            testReports: buildComparisonTestReports(),
            perfReportL: this.perfStatsL.toReport(),
            perfReportR: this.perfStatsR.toReport()
          };
        }
        (_d2 = (_c2 = this.callbacks).onComplete) == null ? void 0 : _d2.call(_c2, {
          checkReport,
          comparisonReport
        });
      }
    };
    const refDataPlan = refDataPlanner.buildPlan();
    const dataPlan = dataPlanner.buildPlan();
    const dataRequests = [...refDataPlan.requests, ...dataPlan.requests];
    const taskCount = dataRequests.length;
    if (taskCount === 0) {
      let comparisonReport;
      if (this.config.comparison) {
        comparisonReport = {
          testReports: [],
          perfReportL: this.perfStatsL.toReport(),
          perfReportR: this.perfStatsR.toReport()
        };
      }
      this.cancel();
      (_f = (_e = this.callbacks).onProgress) == null ? void 0 : _f.call(_e, 1);
      (_h = (_g = this.callbacks).onComplete) == null ? void 0 : _h.call(_g, {
        checkReport: {
          groups: []
        },
        comparisonReport
      });
      return;
    }
    let tasksCompleted = 0;
    let dataTaskId = 1;
    for (const dataRequest of dataRequests) {
      this.taskQueue.addTask(`data${dataTaskId++}`, dataRequest, () => {
        var _a2, _b2;
        tasksCompleted++;
        (_b2 = (_a2 = this.callbacks).onProgress) == null ? void 0 : _b2.call(_a2, tasksCompleted / taskCount);
      });
    }
  }
  processRequest(request) {
    return __async(this, null, function* () {
      var _a, _b;
      const datasetKeySet = /* @__PURE__ */ new Set();
      for (const dataTask of request.dataTasks) {
        datasetKeySet.add(dataTask.datasetKey);
      }
      const datasetKeys = [...datasetKeySet];
      function getDatasets(bundleModel, scenarioSpec) {
        return __async(this, null, function* () {
          if (bundleModel && scenarioSpec) {
            return bundleModel.getDatasetsForScenario(scenarioSpec, datasetKeys);
          } else {
            return void 0;
          }
        });
      }
      const bundleModelL = (_a = this.config.comparison) == null ? void 0 : _a.bundleL.model;
      const bundleModelR = ((_b = this.config.comparison) == null ? void 0 : _b.bundleR.model) || this.config.check.bundle.model;
      const [datasetsResultL, datasetsResultR] = yield Promise.all([
        getDatasets(bundleModelL, request.scenarioSpecL),
        getDatasets(bundleModelR, request.scenarioSpecR)
      ]);
      if (datasetsResultL == null ? void 0 : datasetsResultL.modelRunTime) {
        this.perfStatsL.addRun(datasetsResultL == null ? void 0 : datasetsResultL.modelRunTime);
      }
      if (datasetsResultR == null ? void 0 : datasetsResultR.modelRunTime) {
        this.perfStatsR.addRun(datasetsResultR == null ? void 0 : datasetsResultR.modelRunTime);
      }
      const datasetMapL = datasetsResultL == null ? void 0 : datasetsResultL.datasetMap;
      const datasetMapR = datasetsResultR == null ? void 0 : datasetsResultR.datasetMap;
      for (const dataTask of request.dataTasks) {
        const datasetL = datasetMapL == null ? void 0 : datasetMapL.get(dataTask.datasetKey);
        const datasetR = datasetMapR == null ? void 0 : datasetMapR.get(dataTask.datasetKey);
        dataTask.dataAction({
          datasetL,
          datasetR
        });
      }
    });
  }
};
function runSuite(config, callbacks, options) {
  const suiteRunner = new SuiteRunner(config, callbacks);
  suiteRunner.start(options);
  return () => {
    suiteRunner.cancel();
  };
}

// node_modules/@sdeverywhere/check-ui-shell/dist/index.js
var import_assert_never13 = __toESM(require_assert_never());
var import_fontfaceobserver = __toESM(require_fontfaceobserver_standalone());
var import_chart = __toESM(require_Chart());

// node_modules/@fortawesome/free-solid-svg-icons/index.mjs
var faGear = {
  prefix: "fas",
  iconName: "gear",
  icon: [512, 512, [9881, "cog"], "f013", "M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"]
};
var faCog = faGear;
var faHouse = {
  prefix: "fas",
  iconName: "house",
  icon: [576, 512, [127968, 63498, 63500, "home", "home-alt", "home-lg-alt"], "f015", "M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"]
};
var faHome = faHouse;

// node_modules/@sdeverywhere/check-ui-shell/dist/index.js
var oi = Object.defineProperty;
var ri = (n, e, t) => e in n ? oi(n, e, { enumerable: true, configurable: true, writable: true, value: t }) : n[e] = t;
var ze = (n, e, t) => ri(n, typeof e != "symbol" ? e + "" : e, t);
var Ri = class {
  constructor(e) {
    this.config = e, this.checkDataCoordinator = new CheckDataCoordinator(e.check.bundle.model), e.comparison && (this.comparisonDataCoordinator = new ComparisonDataCoordinator(
      e.comparison.bundleL.model,
      e.comparison.bundleR.model
    ));
  }
};
async function Si(n) {
  const e = await createConfig(n);
  return new Ri(e);
}
function K() {
}
function Re(n, e) {
  for (const t in e) n[t] = e[t];
  return (
    /** @type {T & S} */
    n
  );
}
function zi(n) {
  return !!n && (typeof n == "object" || typeof n == "function") && typeof /** @type {any} */
  n.then == "function";
}
function Gn(n) {
  return n();
}
function xt() {
  return /* @__PURE__ */ Object.create(null);
}
function we(n) {
  n.forEach(Gn);
}
function rt(n) {
  return typeof n == "function";
}
function te(n, e) {
  return n != n ? e == e : n !== e || n && typeof n == "object" || typeof n == "function";
}
function Ci(n) {
  return Object.keys(n).length === 0;
}
function je(n, ...e) {
  if (n == null) {
    for (const l of e)
      l(void 0);
    return K;
  }
  const t = n.subscribe(...e);
  return t.unsubscribe ? () => t.unsubscribe() : t;
}
function Ce(n) {
  let e;
  return je(n, (t) => e = t)(), e;
}
function ve(n, e, t) {
  n.$$.on_destroy.push(je(e, t));
}
function Rt(n, e, t, l) {
  if (n) {
    const i = Wn(n, e, t, l);
    return n[0](i);
  }
}
function Wn(n, e, t, l) {
  return n[1] && l ? Re(t.ctx.slice(), n[1](l(e))) : t.ctx;
}
function St(n, e, t, l) {
  if (n[2] && l) {
    const i = n[2](l(t));
    if (e.dirty === void 0)
      return i;
    if (typeof i == "object") {
      const s = [], r = Math.max(e.dirty.length, i.length);
      for (let o = 0; o < r; o += 1)
        s[o] = e.dirty[o] | i[o];
      return s;
    }
    return e.dirty | i;
  }
  return e.dirty;
}
function zt(n, e, t, l, i, s) {
  if (i) {
    const r = Wn(e, t, l, s);
    n.p(r, i);
  }
}
function Ct(n) {
  if (n.ctx.length > 32) {
    const e = [], t = n.ctx.length / 32;
    for (let l = 0; l < t; l++)
      e[l] = -1;
    return e;
  }
  return -1;
}
function Yn(n) {
  const e = {};
  for (const t in n) t[0] !== "$" && (e[t] = n[t]);
  return e;
}
function st(n, e) {
  const t = {};
  e = new Set(e);
  for (const l in n) !e.has(l) && l[0] !== "$" && (t[l] = n[l]);
  return t;
}
function Ke(n) {
  return n ?? "";
}
function Ii(n) {
  return n && rt(n.destroy) ? n.destroy : K;
}
function _(n, e) {
  n.appendChild(e);
}
function ce(n, e, t) {
  const l = Ti(n);
  if (!l.getElementById(e)) {
    const i = p("style");
    i.id = e, i.textContent = t, Di(l, i);
  }
}
function Ti(n) {
  if (!n) return document;
  const e = n.getRootNode ? n.getRootNode() : n.ownerDocument;
  return e && /** @type {ShadowRoot} */
  e.host ? (
    /** @type {ShadowRoot} */
    e
  ) : n.ownerDocument;
}
function Di(n, e) {
  return _(
    /** @type {Document} */
    n.head || n,
    e
  ), e.sheet;
}
function k(n, e, t) {
  n.insertBefore(e, t || null);
}
function w(n) {
  n.parentNode && n.parentNode.removeChild(n);
}
function se(n, e) {
  for (let t = 0; t < n.length; t += 1)
    n[t] && n[t].d(e);
}
function p(n) {
  return document.createElement(n);
}
function Ue(n) {
  return document.createElementNS("http://www.w3.org/2000/svg", n);
}
function P(n) {
  return document.createTextNode(n);
}
function Me() {
  return P(" ");
}
function ee() {
  return P("");
}
function ne(n, e, t, l) {
  return n.addEventListener(e, t, l), () => n.removeEventListener(e, t, l);
}
function On(n) {
  return function(e) {
    return e.preventDefault(), n.call(this, e);
  };
}
function h(n, e, t) {
  t == null ? n.removeAttribute(e) : n.getAttribute(e) !== t && n.setAttribute(e, t);
}
function Be(n, e) {
  for (const t in e)
    h(n, t, e[t]);
}
function ji(n) {
  return n === "" ? null : +n;
}
function Li(n) {
  return Array.from(n.childNodes);
}
function W(n, e) {
  e = "" + e, n.data !== e && (n.data = /** @type {string} */
  e);
}
function Ee(n, e) {
  n.value = e ?? "";
}
function ie(n, e, t, l) {
  t == null ? n.style.removeProperty(e) : n.style.setProperty(e, t, "");
}
function de(n, e, t) {
  n.classList.toggle(e, !!t);
}
function Vi(n, e, { bubbles: t = false, cancelable: l = false } = {}) {
  return new CustomEvent(n, { detail: e, bubbles: t, cancelable: l });
}
var xi = class {
  constructor(e = false) {
    ze(this, "is_svg", false);
    ze(this, "e");
    ze(this, "n");
    ze(this, "t");
    ze(this, "a");
    this.is_svg = e, this.e = this.n = null;
  }
  /**
   * @param {string} html
   * @returns {void}
   */
  c(e) {
    this.h(e);
  }
  /**
   * @param {string} html
   * @param {HTMLElement | SVGElement} target
   * @param {HTMLElement | SVGElement} anchor
   * @returns {void}
   */
  m(e, t, l = null) {
    this.e || (this.is_svg ? this.e = Ue(
      /** @type {keyof SVGElementTagNameMap} */
      t.nodeName
    ) : this.e = p(
      /** @type {keyof HTMLElementTagNameMap} */
      t.nodeType === 11 ? "TEMPLATE" : t.nodeName
    ), this.t = t.tagName !== "TEMPLATE" ? t : (
      /** @type {HTMLTemplateElement} */
      t.content
    ), this.c(e)), this.i(l);
  }
  /**
   * @param {string} html
   * @returns {void}
   */
  h(e) {
    this.e.innerHTML = e, this.n = Array.from(
      this.e.nodeName === "TEMPLATE" ? this.e.content.childNodes : this.e.childNodes
    );
  }
  /**
   * @returns {void} */
  i(e) {
    for (let t = 0; t < this.n.length; t += 1)
      k(this.t, this.n[t], e);
  }
  /**
   * @param {string} html
   * @returns {void}
   */
  p(e) {
    this.d(), this.h(e), this.i(this.a);
  }
  /**
   * @returns {void} */
  d() {
    this.n.forEach(w);
  }
};
var Ye;
function $e(n) {
  Ye = n;
}
function It() {
  if (!Ye) throw new Error("Function called outside component initialization");
  return Ye;
}
function at(n) {
  It().$$.on_mount.push(n);
}
function Ie() {
  const n = It();
  return (e, t, { cancelable: l = false } = {}) => {
    const i = n.$$.callbacks[e];
    if (i) {
      const s = Vi(
        /** @type {string} */
        e,
        t,
        { cancelable: l }
      );
      return i.slice().forEach((r) => {
        r.call(n, s);
      }), !s.defaultPrevented;
    }
    return true;
  };
}
function he(n, e) {
  const t = n.$$.callbacks[e.type];
  t && t.slice().forEach((l) => l.call(this, e));
}
var xe = [];
var be = [];
var Ne = [];
var wt = [];
var Ni = Promise.resolve();
var kt = false;
function Pi() {
  kt || (kt = true, Ni.then(Tt));
}
function yt(n) {
  Ne.push(n);
}
function ct(n) {
  wt.push(n);
}
var vt = /* @__PURE__ */ new Set();
var Le = 0;
function Tt() {
  if (Le !== 0)
    return;
  const n = Ye;
  do {
    try {
      for (; Le < xe.length; ) {
        const e = xe[Le];
        Le++, $e(e), qi(e.$$);
      }
    } catch (e) {
      throw xe.length = 0, Le = 0, e;
    }
    for ($e(null), xe.length = 0, Le = 0; be.length; ) be.pop()();
    for (let e = 0; e < Ne.length; e += 1) {
      const t = Ne[e];
      vt.has(t) || (vt.add(t), t());
    }
    Ne.length = 0;
  } while (xe.length);
  for (; wt.length; )
    wt.pop()();
  kt = false, vt.clear(), $e(n);
}
function qi(n) {
  if (n.fragment !== null) {
    n.update(), we(n.before_update);
    const e = n.dirty;
    n.dirty = [-1], n.fragment && n.fragment.p(n.ctx, e), n.after_update.forEach(yt);
  }
}
function Ki(n) {
  const e = [], t = [];
  Ne.forEach((l) => n.indexOf(l) === -1 ? e.push(l) : t.push(l)), t.forEach((l) => l()), Ne = e;
}
var lt2 = /* @__PURE__ */ new Set();
var Te;
function U() {
  Te = {
    r: 0,
    c: [],
    p: Te
    // parent group
  };
}
function X() {
  Te.r || we(Te.c), Te = Te.p;
}
function b(n, e) {
  n && n.i && (lt2.delete(n), n.i(e));
}
function M(n, e, t, l) {
  if (n && n.o) {
    if (lt2.has(n)) return;
    lt2.add(n), Te.c.push(() => {
      lt2.delete(n), l && (t && n.d(1), l());
    }), n.o(e);
  } else l && l();
}
function Nt(n, e) {
  const t = e.token = {};
  function l(i, s, r, o) {
    if (e.token !== t) return;
    e.resolved = o;
    let a = e.ctx;
    r !== void 0 && (a = a.slice(), a[r] = o);
    const c = i && (e.current = i)(a);
    let f = false;
    e.block && (e.blocks ? e.blocks.forEach((u, d) => {
      d !== s && u && (U(), M(u, 1, 1, () => {
        e.blocks[d] === u && (e.blocks[d] = null);
      }), X());
    }) : e.block.d(1), c.c(), b(c, 1), c.m(e.mount(), e.anchor), f = true), e.block = c, e.blocks && (e.blocks[s] = c), f && Tt();
  }
  if (zi(n)) {
    const i = It();
    if (n.then(
      (s) => {
        $e(i), l(e.then, 1, e.value, s), $e(null);
      },
      (s) => {
        if ($e(i), l(e.catch, 2, e.error, s), $e(null), !e.hasCatch)
          throw s;
      }
    ), e.current !== e.pending)
      return l(e.pending, 0), true;
  } else {
    if (e.current !== e.then)
      return l(e.then, 1, e.value, n), true;
    e.resolved = /** @type {T} */
    n;
  }
}
function Bi(n, e, t) {
  const l = e.slice(), { resolved: i } = n;
  n.current === n.then && (l[n.value] = i), n.current === n.catch && (l[n.error] = i), n.block.p(l, t);
}
function B(n) {
  return (n == null ? void 0 : n.length) !== void 0 ? n : Array.from(n);
}
function ft(n, e) {
  const t = {}, l = {}, i = { $$scope: 1 };
  let s = n.length;
  for (; s--; ) {
    const r = n[s], o = e[s];
    if (o) {
      for (const a in r)
        a in o || (l[a] = 1);
      for (const a in o)
        i[a] || (t[a] = o[a], i[a] = 1);
      n[s] = o;
    } else
      for (const a in r)
        i[a] = 1;
  }
  for (const r in l)
    r in t || (t[r] = void 0);
  return t;
}
function Ei(n) {
  return typeof n == "object" && n !== null ? n : {};
}
function ut(n, e, t) {
  const l = n.$$.props[e];
  l !== void 0 && (n.$$.bound[l] = t, t(n.$$.ctx[l]));
}
function A(n) {
  n && n.c();
}
function E(n, e, t) {
  const { fragment: l, after_update: i } = n.$$;
  l && l.m(e, t), yt(() => {
    const s = n.$$.on_mount.map(Gn).filter(rt);
    n.$$.on_destroy ? n.$$.on_destroy.push(...s) : we(s), n.$$.on_mount = [];
  }), i.forEach(yt);
}
function F(n, e) {
  const t = n.$$;
  t.fragment !== null && (Ki(t.after_update), we(t.on_destroy), t.fragment && t.fragment.d(e), t.on_destroy = t.fragment = null, t.ctx = []);
}
function Fi(n, e) {
  n.$$.dirty[0] === -1 && (xe.push(n), Pi(), n.$$.dirty.fill(0)), n.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function oe(n, e, t, l, i, s, r = null, o = [-1]) {
  const a = Ye;
  $e(n);
  const c = n.$$ = {
    fragment: null,
    ctx: [],
    // state
    props: s,
    update: K,
    not_equal: i,
    bound: xt(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (a ? a.$$.context : [])),
    // everything else
    callbacks: xt(),
    dirty: o,
    skip_bound: false,
    root: e.target || a.$$.root
  };
  r && r(c.root);
  let f = false;
  if (c.ctx = t ? t(n, e.props || {}, (u, d, ...m) => {
    const g = m.length ? m[0] : d;
    return c.ctx && i(c.ctx[u], c.ctx[u] = g) && (!c.skip_bound && c.bound[u] && c.bound[u](g), f && Fi(n, u)), d;
  }) : [], c.update(), f = true, we(c.before_update), c.fragment = l ? l(c.ctx) : false, e.target) {
    if (e.hydrate) {
      const u = Li(e.target);
      c.fragment && c.fragment.l(u), u.forEach(w);
    } else
      c.fragment && c.fragment.c();
    e.intro && b(n.$$.fragment), E(n, e.target, e.anchor), Tt();
  }
  $e(a);
}
var re = class {
  constructor() {
    ze(this, "$$");
    ze(this, "$$set");
  }
  /** @returns {void} */
  $destroy() {
    F(this, 1), this.$destroy = K;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(e, t) {
    if (!rt(t))
      return K;
    const l = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
    return l.push(t), () => {
      const i = l.indexOf(t);
      i !== -1 && l.splice(i, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(e) {
    this.$$set && !Ci(e) && (this.$$.skip_bound = true, this.$$set(e), this.$$.skip_bound = false);
  }
};
var Hi = "4";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(Hi);
var Ve = [];
function Ai(n, e) {
  return {
    subscribe: ue(n, e).subscribe
  };
}
function ue(n, e = K) {
  let t;
  const l = /* @__PURE__ */ new Set();
  function i(o) {
    if (te(n, o) && (n = o, t)) {
      const a = !Ve.length;
      for (const c of l)
        c[1](), Ve.push(c, n);
      if (a) {
        for (let c = 0; c < Ve.length; c += 2)
          Ve[c][0](Ve[c + 1]);
        Ve.length = 0;
      }
    }
  }
  function s(o) {
    i(o(n));
  }
  function r(o, a = K) {
    const c = [o, a];
    return l.add(c), l.size === 1 && (t = e(i, s) || K), o(n), () => {
      l.delete(c), l.size === 0 && t && (t(), t = null);
    };
  }
  return { set: i, update: s, subscribe: r };
}
function Se(n, e, t) {
  const l = !Array.isArray(n), i = l ? [n] : n;
  if (!i.every(Boolean))
    throw new Error("derived() expects stores as input, got a falsy value");
  const s = e.length < 2;
  return Ai(t, (r, o) => {
    let a = false;
    const c = [];
    let f = 0, u = K;
    const d = () => {
      if (f)
        return;
      u();
      const g = e(l ? c[0] : c, r, o);
      s ? r(g) : u = rt(g) ? g : K;
    }, m = i.map(
      (g, v) => je(
        g,
        (y) => {
          c[v] = y, f &= ~(1 << v), a && d();
        },
        () => {
          f |= 1 << v;
        }
      )
    );
    return a = true, d(), function() {
      we(m), u(), a = false;
    };
  });
}
function Gi(n) {
  const e = (t) => {
    n && !n.contains(t.target) && !t.defaultPrevented && n.dispatchEvent(new CustomEvent("clickout"));
  };
  return document.addEventListener("click", e, true), {
    destroy() {
      document.removeEventListener("click", e, true);
    }
  };
}
function Wi(n) {
  ce(n, "svelte-166jjnf", ".svelte-166jjnf.svelte-166jjnf{padding:0;margin:0}nav.svelte-166jjnf.svelte-166jjnf{z-index:200}.navbar.svelte-166jjnf.svelte-166jjnf{display:inline-flex;flex-direction:column;width:170px;background-color:#fff;border-radius:0.4rem;box-shadow:0 0.2rem 0.4rem rgba(0, 0, 0, 0.8);overflow:hidden}.navbar.svelte-166jjnf ul.svelte-166jjnf{margin:6px}ul.svelte-166jjnf li.svelte-166jjnf{display:block;list-style-type:none;width:1fr}ul.svelte-166jjnf li button.svelte-166jjnf{font-family:Roboto, sans-serif;font-weight:700;font-size:1rem;color:#222;width:100%;height:30px;text-align:left;border:0px;background-color:#fff}ul.svelte-166jjnf li button.disabled.svelte-166jjnf{color:#888;pointer-events:none}ul.svelte-166jjnf li button.svelte-166jjnf:not(.disabled):hover{color:#000;text-align:left;border-radius:0.3rem;background-color:#eee}ul.svelte-166jjnf li button i.svelte-166jjnf{padding:0px 15px 0px 10px}hr.svelte-166jjnf.svelte-166jjnf{border:none;border-bottom:1px solid #ccc;margin:5px 0px}");
}
function Pt(n, e, t) {
  const l = n.slice();
  return l[9] = e[t], l;
}
function qt(n) {
  let e, t, l, i, s, r = B(
    /*items*/
    n[0]
  ), o = [];
  for (let a = 0; a < r.length; a += 1)
    o[a] = Kt(Pt(n, r, a));
  return {
    c() {
      e = p("nav"), t = p("div"), l = p("ul");
      for (let a = 0; a < o.length; a += 1)
        o[a].c();
      h(l, "class", "svelte-166jjnf"), h(t, "class", "navbar svelte-166jjnf"), h(t, "id", "navbar"), ie(e, "position", "absolute"), ie(
        e,
        "top",
        /*pos*/
        n[1].y + "px"
      ), ie(
        e,
        "left",
        /*pos*/
        n[1].x + "px"
      ), h(e, "class", "svelte-166jjnf");
    },
    m(a, c) {
      k(a, e, c), _(e, t), _(t, l);
      for (let f = 0; f < o.length; f += 1)
        o[f] && o[f].m(l, null);
      i || (s = [
        Ii(Gi.call(null, e)),
        ne(
          e,
          "clickout",
          /*clickout_handler*/
          n[6]
        )
      ], i = true);
    },
    p(a, c) {
      if (c & /*items, onItemSelected*/
      9) {
        r = B(
          /*items*/
          a[0]
        );
        let f;
        for (f = 0; f < r.length; f += 1) {
          const u = Pt(a, r, f);
          o[f] ? o[f].p(u, c) : (o[f] = Kt(u), o[f].c(), o[f].m(l, null));
        }
        for (; f < o.length; f += 1)
          o[f].d(1);
        o.length = r.length;
      }
      c & /*pos*/
      2 && ie(
        e,
        "top",
        /*pos*/
        a[1].y + "px"
      ), c & /*pos*/
      2 && ie(
        e,
        "left",
        /*pos*/
        a[1].x + "px"
      );
    },
    d(a) {
      a && w(e), se(o, a), i = false, we(s);
    }
  };
}
function Yi(n) {
  let e, t, l, i, s = (
    /*item*/
    n[9].displayText + ""
  ), r, o, a;
  function c() {
    return (
      /*click_handler*/
      n[7](
        /*item*/
        n[9]
      )
    );
  }
  return {
    c() {
      e = p("li"), t = p("button"), l = p("i"), r = P(s), h(l, "class", i = Ke(
        /*item*/
        n[9].iconClass
      ) + " svelte-166jjnf"), h(t, "class", "svelte-166jjnf"), de(
        t,
        "disabled",
        /*item*/
        n[9].disabled === true
      ), h(e, "class", "svelte-166jjnf");
    },
    m(f, u) {
      k(f, e, u), _(e, t), _(t, l), _(t, r), o || (a = ne(t, "click", c), o = true);
    },
    p(f, u) {
      n = f, u & /*items*/
      1 && i !== (i = Ke(
        /*item*/
        n[9].iconClass
      ) + " svelte-166jjnf") && h(l, "class", i), u & /*items*/
      1 && s !== (s = /*item*/
      n[9].displayText + "") && W(r, s), u & /*items*/
      1 && de(
        t,
        "disabled",
        /*item*/
        n[9].disabled === true
      );
    },
    d(f) {
      f && w(e), o = false, a();
    }
  };
}
function Oi(n) {
  let e;
  return {
    c() {
      e = p("hr"), h(e, "class", "svelte-166jjnf");
    },
    m(t, l) {
      k(t, e, l);
    },
    p: K,
    d(t) {
      t && w(e);
    }
  };
}
function Kt(n) {
  let e;
  function t(s, r) {
    return (
      /*item*/
      s[9].key == "hr" ? Oi : Yi
    );
  }
  let l = t(n), i = l(n);
  return {
    c() {
      i.c(), e = ee();
    },
    m(s, r) {
      i.m(s, r), k(s, e, r);
    },
    p(s, r) {
      l === (l = t(s)) && i ? i.p(s, r) : (i.d(1), i = l(s), i && (i.c(), i.m(e.parentNode, e)));
    },
    d(s) {
      s && w(e), i.d(s);
    }
  };
}
function Ui(n) {
  let e, t = (
    /*showMenu*/
    n[2] && qt(n)
  );
  return {
    c() {
      t && t.c(), e = ee();
    },
    m(l, i) {
      t && t.m(l, i), k(l, e, i);
    },
    p(l, [i]) {
      l[2] ? t ? t.p(l, i) : (t = qt(l), t.c(), t.m(e.parentNode, e)) : t && (t.d(1), t = null);
    },
    i: K,
    o: K,
    d(l) {
      l && w(e), t && t.d(l);
    }
  };
}
function Xi(n, e, t) {
  let { items: l } = e, { parentElem: i } = e, { initialEvent: s } = e;
  const r = Ie();
  let o = { x: 0, y: 0 }, a = false;
  function c(d) {
    r("item-selected", d);
  }
  function f(d) {
    he.call(this, n, d);
  }
  const u = (d) => c(d.key);
  return n.$$set = (d) => {
    "items" in d && t(0, l = d.items), "parentElem" in d && t(4, i = d.parentElem), "initialEvent" in d && t(5, s = d.initialEvent);
  }, n.$$.update = () => {
    if (n.$$.dirty & /*initialEvent, parentElem*/
    48)
      if (s) {
        const d = i.getBoundingClientRect();
        t(1, o = {
          x: s.clientX - d.left,
          y: s.clientY - d.top
        }), t(2, a = true);
      } else
        t(2, a = false);
  }, [
    l,
    o,
    a,
    c,
    i,
    s,
    f,
    u
  ];
}
var Zi = class extends re {
  constructor(e) {
    super(), oe(this, e, Xi, Ui, te, { items: 0, parentElem: 4, initialEvent: 5 }, Wi);
  }
};
function Ji(n) {
  ce(n, "svelte-11x17ud", ".lazy-container.svelte-11x17ud{position:relative;display:flex;height:100%}");
}
function Bt(n) {
  let e;
  const t = (
    /*#slots*/
    n[4].default
  ), l = Rt(
    t,
    n,
    /*$$scope*/
    n[3],
    null
  );
  return {
    c() {
      l && l.c();
    },
    m(i, s) {
      l && l.m(i, s), e = true;
    },
    p(i, s) {
      l && l.p && (!e || s & /*$$scope*/
      8) && zt(
        l,
        t,
        i,
        /*$$scope*/
        i[3],
        e ? St(
          t,
          /*$$scope*/
          i[3],
          s,
          null
        ) : Ct(
          /*$$scope*/
          i[3]
        ),
        null
      );
    },
    i(i) {
      e || (b(l, i), e = true);
    },
    o(i) {
      M(l, i), e = false;
    },
    d(i) {
      l && l.d(i);
    }
  };
}
function Qi(n) {
  let e, t, l = (
    /*visible*/
    n[0] && Bt(n)
  );
  return {
    c() {
      e = p("div"), l && l.c(), h(e, "class", "lazy-container svelte-11x17ud");
    },
    m(i, s) {
      k(i, e, s), l && l.m(e, null), n[5](e), t = true;
    },
    p(i, [s]) {
      i[0] ? l ? (l.p(i, s), s & /*visible*/
      1 && b(l, 1)) : (l = Bt(i), l.c(), b(l, 1), l.m(e, null)) : l && (U(), M(l, 1, 1, () => {
        l = null;
      }), X());
    },
    i(i) {
      t || (b(l), t = true);
    },
    o(i) {
      M(l), t = false;
    },
    d(i) {
      i && w(e), l && l.d(), n[5](null);
    }
  };
}
function es(n, e, t) {
  let { $$slots: l = {}, $$scope: i } = e, { visible: s = false } = e, { syncInit: r = false } = e, o;
  at(() => {
    const c = o.closest(".scroll-container");
    if (c === void 0)
      throw new Error("Lazy component requires an ancestor marked with the 'scroll-container' class");
    function f() {
      const d = c.getBoundingClientRect(), m = o.getBoundingClientRect();
      return m.bottom > d.top && m.top < d.bottom && m.right > d.left && m.left < d.right;
    }
    let u = new IntersectionObserver(
      (d) => {
        const m = d[0].isIntersecting;
        m && !s ? t(0, s = true) : !m && s && t(0, s = false);
      },
      {
        // Use the scroll container for visibility checking
        root: c,
        // XXX: For now, increase the size of the root bounds so that items are loaded
        // before they become fully visible.  We use 200% for the right/bottom margins
        // so that up to two "viewports" worth of items are loaded before scrolling
        // down or to the right, and we use 100% for the others so that up to one
        // "viewport" is loaded before scrolling up or to the left.  This means that
        // we potentially keep more items in memory than strictly necessary, which
        // may have memory pressure implications, but it is much more efficient than
        // not using the lazy component at all, and provides a better UX (less flashing)
        // compared to the default `rootMargin`.
        rootMargin: "100% 200% 200% 100%"
      }
    );
    return u.observe(o), r && f() && t(0, s = true), () => {
      t(0, s = false), u.disconnect();
    };
  });
  function a(c) {
    be[c ? "unshift" : "push"](() => {
      o = c, t(1, o);
    });
  }
  return n.$$set = (c) => {
    "visible" in c && t(0, s = c.visible), "syncInit" in c && t(2, r = c.syncInit), "$$scope" in c && t(3, i = c.$$scope);
  }, [s, o, r, i, l, a];
}
var Dt = class extends re {
  constructor(e) {
    super(), oe(this, e, es, Qi, te, { visible: 0, syncInit: 2 }, Ji);
  }
};
function ts(n) {
  ce(n, "svelte-bdlfj4", ".graph-inner-container.svelte-bdlfj4{position:absolute;top:0;left:0;bottom:0;right:0}");
}
function ls(n) {
  let e, t;
  return {
    c() {
      e = p("div"), t = p("canvas"), h(e, "class", "graph-inner-container svelte-bdlfj4"), h(
        e,
        "style",
        /*containerStyle*/
        n[2]
      );
    },
    m(l, i) {
      k(l, e, i), _(e, t), n[5](t), n[6](e);
    },
    p: K,
    i: K,
    o: K,
    d(l) {
      l && w(e), n[5](null), n[6](null);
    }
  };
}
function ns(n, e, t) {
  let { config: l } = e, { viewModel: i } = e, s, r = `width: ${l.width}rem; height: 20rem;`, o, a;
  at(() => (a = i.createGraphView(o), () => {
    a == null || a.destroy(), a = void 0;
  }));
  function c(u) {
    be[u ? "unshift" : "push"](() => {
      o = u, t(1, o);
    });
  }
  function f(u) {
    be[u ? "unshift" : "push"](() => {
      s = u, t(0, s);
    });
  }
  return n.$$set = (u) => {
    "config" in u && t(3, l = u.config), "viewModel" in u && t(4, i = u.viewModel);
  }, [
    s,
    o,
    r,
    l,
    i,
    c,
    f
  ];
}
var is = class extends re {
  constructor(e) {
    super(), oe(this, e, ns, ls, te, { config: 3, viewModel: 4 }, ts);
  }
};
function ss(n) {
  ce(n, "svelte-1mlx9dh", '.legend-container.svelte-1mlx9dh{display:flex;flex-direction:row;flex-wrap:wrap;flex:0 0 3.5rem;justify-content:center;align-items:center;width:100%;margin-top:-0.45rem;font-family:"Roboto Condensed";font-weight:700;font-size:1rem;line-height:1.2}.legend-item.svelte-1mlx9dh{margin:0 0.2rem 0.1rem 0.2rem;padding:0.25rem 0.6rem 0.2rem 0.6rem;color:#fff;text-align:center}');
}
function Et(n, e, t) {
  const l = n.slice();
  return l[1] = e[t], l;
}
function Ft(n) {
  let e, t = (
    /*item*/
    n[1].label.toUpperCase() + ""
  ), l;
  return {
    c() {
      e = p("div"), l = P(t), h(e, "class", "legend-item svelte-1mlx9dh"), ie(
        e,
        "background-color",
        /*item*/
        n[1].color
      );
    },
    m(i, s) {
      k(i, e, s), _(e, l);
    },
    p(i, s) {
      s & /*graphSpec*/
      1 && t !== (t = /*item*/
      i[1].label.toUpperCase() + "") && W(l, t), s & /*graphSpec*/
      1 && ie(
        e,
        "background-color",
        /*item*/
        i[1].color
      );
    },
    d(i) {
      i && w(e);
    }
  };
}
function os(n) {
  let e, t = B(
    /*graphSpec*/
    n[0].legendItems
  ), l = [];
  for (let i = 0; i < t.length; i += 1)
    l[i] = Ft(Et(n, t, i));
  return {
    c() {
      e = p("div");
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      h(e, "class", "legend-container svelte-1mlx9dh");
    },
    m(i, s) {
      k(i, e, s);
      for (let r = 0; r < l.length; r += 1)
        l[r] && l[r].m(e, null);
    },
    p(i, [s]) {
      if (s & /*graphSpec*/
      1) {
        t = B(
          /*graphSpec*/
          i[0].legendItems
        );
        let r;
        for (r = 0; r < t.length; r += 1) {
          const o = Et(i, t, r);
          l[r] ? l[r].p(o, s) : (l[r] = Ft(o), l[r].c(), l[r].m(e, null));
        }
        for (; r < l.length; r += 1)
          l[r].d(1);
        l.length = t.length;
      }
    },
    i: K,
    o: K,
    d(i) {
      i && w(e), se(l, i);
    }
  };
}
function rs(n, e, t) {
  let { graphSpec: l } = e;
  return n.$$set = (i) => {
    "graphSpec" in i && t(0, l = i.graphSpec);
  }, [l];
}
var as = class extends re {
  constructor(e) {
    super(), oe(this, e, rs, os, te, { graphSpec: 0 }, ss);
  }
};
function cs(n) {
  ce(n, "svelte-zu9ny", '.context-graph-container.svelte-zu9ny{display:inline-flex;flex-direction:column;flex:0 0 38rem;background-color:#fff}.graph-and-info.svelte-zu9ny{display:flex;flex-direction:column}.graph-title.svelte-zu9ny{margin:0.5rem 0;padding:0 0.8rem;font-family:"Roboto Condensed";font-size:1.55rem}.graph-container.svelte-zu9ny{display:block;position:relative;width:38rem;height:20rem}.message.svelte-zu9ny{display:flex;flex:1;min-height:20rem;align-items:center;justify-content:center;color:#aaa;border:solid 1px #fff}.message.not-included.svelte-zu9ny{background-color:#555}.link-container.svelte-zu9ny{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:0.4rem}.link-row.svelte-zu9ny{height:1.2rem;margin:0 0.8rem;color:#999;cursor:pointer}.link-row.svelte-zu9ny:hover{color:#000}');
}
function Ht(n, e, t) {
  const l = n.slice();
  return l[10] = e[t], l;
}
function fs(n) {
  let e, t, l, i = (
    /*viewModel*/
    n[0].bundleName + ""
  ), s, r;
  return {
    c() {
      e = p("div"), t = p("span"), t.textContent = "Graph not included in ", l = p("span"), s = P(i), h(l, "class", r = Ke(
        /*viewModel*/
        n[0].datasetClass
      ) + " svelte-zu9ny"), h(e, "class", "message not-included svelte-zu9ny");
    },
    m(o, a) {
      k(o, e, a), _(e, t), _(e, l), _(l, s);
    },
    p(o, a) {
      a & /*viewModel*/
      1 && i !== (i = /*viewModel*/
      o[0].bundleName + "") && W(s, i), a & /*viewModel*/
      1 && r !== (r = Ke(
        /*viewModel*/
        o[0].datasetClass
      ) + " svelte-zu9ny") && h(l, "class", r);
    },
    i: K,
    o: K,
    d(o) {
      o && w(e);
    }
  };
}
function us(n) {
  let e, t, l = (
    /*viewModel*/
    n[0].graphSpec.title + ""
  ), i, s, r, o;
  const a = [ms, ds], c = [];
  function f(u, d) {
    return (
      /*viewModel*/
      u[0].requestKey ? 0 : 1
    );
  }
  return s = f(n), r = c[s] = a[s](n), {
    c() {
      e = p("div"), t = p("div"), r.c(), h(t, "class", i = "graph-title " + /*viewModel*/
      n[0].datasetClass + " svelte-zu9ny"), h(e, "class", "graph-and-info svelte-zu9ny");
    },
    m(u, d) {
      k(u, e, d), _(e, t), t.innerHTML = l, c[s].m(e, null), o = true;
    },
    p(u, d) {
      (!o || d & /*viewModel*/
      1) && l !== (l = /*viewModel*/
      u[0].graphSpec.title + "") && (t.innerHTML = l), (!o || d & /*viewModel*/
      1 && i !== (i = "graph-title " + /*viewModel*/
      u[0].datasetClass + " svelte-zu9ny")) && h(t, "class", i);
      let m = s;
      s = f(u), s === m ? c[s].p(u, d) : (U(), M(c[m], 1, 1, () => {
        c[m] = null;
      }), X(), r = c[s], r ? r.p(u, d) : (r = c[s] = a[s](u), r.c()), b(r, 1), r.m(e, null));
    },
    i(u) {
      o || (b(r), o = true);
    },
    o(u) {
      M(r), o = false;
    },
    d(u) {
      u && w(e), c[s].d();
    }
  };
}
function ds(n) {
  let e, t, l, i = (
    /*viewModel*/
    n[0].bundleName + ""
  ), s, r;
  return {
    c() {
      e = p("div"), t = p("span"), t.textContent = "Graph not shown: scenario is invalid in ", l = p("span"), s = P(i), h(l, "class", r = Ke(
        /*viewModel*/
        n[0].datasetClass
      ) + " svelte-zu9ny"), h(e, "class", "message not-shown svelte-zu9ny");
    },
    m(o, a) {
      k(o, e, a), _(e, t), _(e, l), _(l, s);
    },
    p(o, a) {
      a & /*viewModel*/
      1 && i !== (i = /*viewModel*/
      o[0].bundleName + "") && W(s, i), a & /*viewModel*/
      1 && r !== (r = Ke(
        /*viewModel*/
        o[0].datasetClass
      ) + " svelte-zu9ny") && h(l, "class", r);
    },
    i: K,
    o: K,
    d(o) {
      o && w(e);
    }
  };
}
function ms(n) {
  let e, t, l, i, s, r;
  function o(f) {
    n[8](f);
  }
  let a = {
    $$slots: { default: [hs] },
    $$scope: { ctx: n }
  };
  n[1] !== void 0 && (a.visible = /*visible*/
  n[1]), t = new Dt({ props: a }), be.push(() => ut(t, "visible", o)), i = new as({
    props: {
      graphSpec: (
        /*viewModel*/
        n[0].graphSpec
      )
    }
  });
  let c = (
    /*viewModel*/
    n[0].linkItems && Gt(n)
  );
  return {
    c() {
      e = p("div"), A(t.$$.fragment), A(i.$$.fragment), c && c.c(), s = ee(), h(e, "class", "graph-container svelte-zu9ny");
    },
    m(f, u) {
      k(f, e, u), E(t, e, null), E(i, f, u), c && c.m(f, u), k(f, s, u), r = true;
    },
    p(f, u) {
      const d = {};
      u & /*$$scope, $content*/
      8200 && (d.$$scope = { dirty: u, ctx: f }), !l && u & /*visible*/
      2 && (l = true, d.visible = /*visible*/
      f[1], ct(() => l = false)), t.$set(d);
      const m = {};
      u & /*viewModel*/
      1 && (m.graphSpec = /*viewModel*/
      f[0].graphSpec), i.$set(m), /*viewModel*/
      f[0].linkItems ? c ? c.p(f, u) : (c = Gt(f), c.c(), c.m(s.parentNode, s)) : c && (c.d(1), c = null);
    },
    i(f) {
      r || (b(t.$$.fragment, f), b(i.$$.fragment, f), r = true);
    },
    o(f) {
      M(t.$$.fragment, f), M(i.$$.fragment, f), r = false;
    },
    d(f) {
      f && (w(e), w(s)), F(t), F(i, f), c && c.d(f);
    }
  };
}
function At(n) {
  let e, t;
  return e = new is({
    props: {
      viewModel: (
        /*$content*/
        n[3].graphData
      ),
      config: (
        /*graphConfig*/
        n[4]
      )
    }
  }), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*$content*/
      8 && (s.viewModel = /*$content*/
      l[3].graphData), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function hs(n) {
  let e, t, l = (
    /*$content*/
    n[3] && /*$content*/
    n[3].graphData && At(n)
  );
  return {
    c() {
      l && l.c(), e = ee();
    },
    m(i, s) {
      l && l.m(i, s), k(i, e, s), t = true;
    },
    p(i, s) {
      i[3] && /*$content*/
      i[3].graphData ? l ? (l.p(i, s), s & /*$content*/
      8 && b(l, 1)) : (l = At(i), l.c(), b(l, 1), l.m(e.parentNode, e)) : l && (U(), M(l, 1, 1, () => {
        l = null;
      }), X());
    },
    i(i) {
      t || (b(l), t = true);
    },
    o(i) {
      M(l), t = false;
    },
    d(i) {
      i && w(e), l && l.d(i);
    }
  };
}
function Gt(n) {
  let e, t = B(
    /*viewModel*/
    n[0].linkItems
  ), l = [];
  for (let i = 0; i < t.length; i += 1)
    l[i] = Wt(Ht(n, t, i));
  return {
    c() {
      e = p("div");
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      h(e, "class", "link-container svelte-zu9ny");
    },
    m(i, s) {
      k(i, e, s);
      for (let r = 0; r < l.length; r += 1)
        l[r] && l[r].m(e, null);
    },
    p(i, s) {
      if (s & /*onLinkClicked, viewModel*/
      33) {
        t = B(
          /*viewModel*/
          i[0].linkItems
        );
        let r;
        for (r = 0; r < t.length; r += 1) {
          const o = Ht(i, t, r);
          l[r] ? l[r].p(o, s) : (l[r] = Wt(o), l[r].c(), l[r].m(e, null));
        }
        for (; r < l.length; r += 1)
          l[r].d(1);
        l.length = t.length;
      }
    },
    d(i) {
      i && w(e), se(l, i);
    }
  };
}
function Wt(n) {
  let e, t = (
    /*linkItem*/
    n[10].text + ""
  ), l, i, s;
  function r() {
    return (
      /*click_handler*/
      n[9](
        /*linkItem*/
        n[10]
      )
    );
  }
  return {
    c() {
      e = p("div"), l = P(t), h(e, "class", "link-row svelte-zu9ny");
    },
    m(o, a) {
      k(o, e, a), _(e, l), i || (s = ne(e, "click", r), i = true);
    },
    p(o, a) {
      n = o, a & /*viewModel*/
      1 && t !== (t = /*linkItem*/
      n[10].text + "") && W(l, t);
    },
    d(o) {
      o && w(e), i = false, s();
    }
  };
}
function ps(n) {
  let e, t, l, i;
  const s = [us, fs], r = [];
  function o(a, c) {
    return (
      /*viewModel*/
      a[0].graphSpec ? 0 : 1
    );
  }
  return t = o(n), l = r[t] = s[t](n), {
    c() {
      e = p("div"), l.c(), h(e, "class", "context-graph-container svelte-zu9ny");
    },
    m(a, c) {
      k(a, e, c), r[t].m(e, null), i = true;
    },
    p(a, [c]) {
      let f = t;
      t = o(a), t === f ? r[t].p(a, c) : (U(), M(r[f], 1, 1, () => {
        r[f] = null;
      }), X(), l = r[t], l ? l.p(a, c) : (l = r[t] = s[t](a), l.c()), b(l, 1), l.m(e, null));
    },
    i(a) {
      i || (b(l), i = true);
    },
    o(a) {
      M(l), i = false;
    },
    d(a) {
      a && w(e), r[t].d();
    }
  };
}
function vs(n, e, t) {
  let l, i = K, s = () => (i(), i = je(o, (v) => t(3, l = v)), o);
  n.$$.on_destroy.push(() => i());
  let { viewModel: r } = e, o = r.content;
  s();
  let a = false;
  const c = { width: 38 };
  let f = a, u;
  function d(v) {
    switch (v.kind) {
      case "url":
        window.open(v.content, "_blank");
        break;
      case "copy":
        copyTextToClipboard(v.content);
        break;
      default:
        (0, import_assert_never13.default)(v.kind);
    }
  }
  function m(v) {
    a = v, t(1, a);
  }
  const g = (v) => d(v);
  return n.$$set = (v) => {
    "viewModel" in v && t(0, r = v.viewModel);
  }, n.$$.update = () => {
    n.$$.dirty & /*visible, previousVisible, viewModel, previousViewModel*/
    195 && (a !== f || r.requestKey !== (u == null ? void 0 : u.requestKey)) && (u == null || u.clearData(), t(6, f = a), t(7, u = r), s(t(2, o = r.content)), a && r.requestData());
  }, [
    r,
    a,
    o,
    l,
    c,
    d,
    f,
    u,
    m,
    g
  ];
}
var ot = class extends re {
  constructor(e) {
    super(), oe(this, e, vs, ps, te, { viewModel: 0 }, cs);
  }
};
var gs = 1;
var Un = class {
  constructor(e, t, l, i, s) {
    this.dataCoordinator = t, this.bundle = l, this.scenario = i, this.graphSpec = s, this.dataRequested = false, this.dataLoaded = false;
    const r = l === "right" ? e.bundleR : e.bundleL;
    if (this.bundleName = r.name, this.datasetClass = `dataset-color-${l === "right" ? "1" : "0"}`, s) {
      const o = l === "right" ? i.specR : i.specL;
      o !== void 0 ? (this.linkItems = r.model.getGraphLinksForScenario(o, s.id), this.requestKey = `context-graph::${gs++}::${l}::${s.id}::${i.key}`) : this.linkItems = [], this.writableContent = ue(void 0), this.content = this.writableContent;
    }
  }
  requestData() {
    if (this.requestKey === void 0) {
      this.dataRequested = true, this.dataLoaded = true;
      return;
    }
    if (this.dataRequested)
      return;
    this.dataRequested = true;
    const e = this.bundle === "left" ? this.scenario.specL : void 0, t = this.bundle === "right" ? this.scenario.specR : void 0;
    this.dataCoordinator.requestGraphData(
      this.requestKey,
      e,
      t,
      this.graphSpec.id,
      (l, i) => {
        if (!this.dataRequested)
          return;
        const s = t ? i : l;
        this.writableContent.set({
          graphData: s
        }), this.dataLoaded = true;
      }
    );
  }
  clearData() {
    this.dataRequested && (this.writableContent.set(void 0), this.dataLoaded || this.dataCoordinator.cancelRequest(this.requestKey), this.dataRequested = false, this.dataLoaded = false);
  }
};
function jt(n, e) {
  if (n === 0)
    return 0;
  for (let t = 0; t < e.length; t++)
    if (n < e[t])
      return t + 1;
  return e.length + 1;
}
function _s(n) {
  return n === void 0 ? true : n.some((e, t) => t > 0 && e > 0);
}
function De(n, e) {
  return `<span class="dataset-color-${e === "left" ? 0 : 1}">${n}</span>`;
}
function nt(n) {
  if (!n)
    return [];
  const e = -Number.MAX_VALUE / 2, t = Number.MAX_VALUE / 2, l = [];
  for (const [i, s] of n.entries())
    s < e || s > t || l.push({
      x: i,
      y: s
    });
  return l;
}
var bs = 1;
var Xn = class {
  constructor(e, t, l, i, s, r, o, a) {
    this.comparisonConfig = e, this.dataCoordinator = t, this.kind = l, this.title = i, this.subtitle = s, this.scenario = r, this.datasetKey = o, this.pinnedItemKey = a, this.dataRequested = false, this.dataLoaded = false, this.requestKey = `detail-box::${bs++}::${r.key}::${o}`, this.writableContent = ue(void 0), this.content = this.writableContent, this.writableYRange = ue(void 0), this.yRange = this.writableYRange;
  }
  requestData() {
    if (this.dataRequested)
      return;
    this.dataRequested = true;
    const e = [this.datasetKey], t = this.comparisonConfig.datasets.getReferencePlotsForDataset(this.datasetKey, this.scenario);
    e.push(...t.map((l) => l.datasetKey)), this.dataCoordinator.requestDatasetMaps(
      this.requestKey,
      this.scenario.specL,
      this.scenario.specR,
      e,
      (l, i) => {
        if (!this.dataRequested)
          return;
        const s = ws(this.scenario.key, this.datasetKey, l, i), r = (j) => {
          const x = this.comparisonConfig, T = j === "left" ? x.bundleL.name : x.bundleR.name;
          return `Data only defined in ${De(T, j)}`;
        }, o = s.diffReport;
        let a, c;
        switch (o.validity) {
          case "both":
            a = jt(o.maxDiff, this.comparisonConfig.thresholds), o.maxDiff === 0 ? c = "No differences" : c = void 0;
            break;
          case "left-only":
            a = void 0, c = r("left");
            break;
          case "right-only":
            a = void 0, c = r("right");
            break;
          default:
            a = void 0, c = "Dataset not defined for this scenario";
            break;
        }
        const f = this.dataCoordinator.bundleModelL.modelSpec, u = this.dataCoordinator.bundleModelR.modelSpec, d = f.outputVars.get(this.datasetKey), g = u.outputVars.get(this.datasetKey) || d;
        let v, y;
        g.sourceName === void 0 && (f.startTime !== void 0 && u.startTime !== void 0 && (v = Math.min(f.startTime, u.startTime)), f.endTime !== void 0 && u.endTime !== void 0 && (y = Math.max(f.endTime, u.endTime)));
        const R = nt(l == null ? void 0 : l.get(this.datasetKey)), $ = nt(i == null ? void 0 : i.get(this.datasetKey)), C = [];
        function I(j, x, T, z) {
          C.push({
            points: j,
            color: x,
            style: T || "normal",
            lineWidth: z
          });
        }
        I($, "deepskyblue"), I(R, "crimson");
        for (const j of t) {
          const x = nt(i == null ? void 0 : i.get(j.datasetKey));
          I(x, j.color, j.style, j.lineWidth);
        }
        let D = Number.POSITIVE_INFINITY, V = Number.NEGATIVE_INFINITY;
        function q(j) {
          for (const x of j)
            x.y < D && (D = x.y), x.y > V && (V = x.y);
        }
        for (const j of C)
          q(j.points);
        this.writableYRange.set({
          min: D,
          max: V
        });
        const S = {
          key: this.requestKey,
          plots: C,
          xMin: v,
          xMax: y,
          yMin: this.activeYMin,
          yMax: this.activeYMax
        };
        this.localContent = {
          bucketClass: `bucket-border-${a !== void 0 ? a : "undefined"}`,
          message: c,
          diffReport: o,
          comparisonGraphViewModel: S
        }, this.writableContent.set(this.localContent), this.dataLoaded = true;
      }
    );
  }
  updateYAxisRange(e) {
    var t;
    if (this.activeYMin = e == null ? void 0 : e.min, this.activeYMax = e == null ? void 0 : e.max, this.localContent) {
      const l = this.localContent.comparisonGraphViewModel;
      l.yMin = this.activeYMin, l.yMax = this.activeYMax, (t = l.onUpdated) == null || t.call(l);
    }
  }
  clearData() {
    this.dataRequested && (this.localContent = void 0, this.writableContent.set(void 0), this.dataLoaded || this.dataCoordinator.cancelRequest(this.requestKey), this.dataRequested = false, this.dataLoaded = false);
  }
};
function ws(n, e, t, l) {
  const i = t == null ? void 0 : t.get(e), s = l == null ? void 0 : l.get(e), r = diffDatasets(i, s);
  return {
    scenarioKey: n,
    datasetKey: e,
    diffReport: r
  };
}
function Oe(n, e, t, l, i, s, r) {
  const o = [];
  for (const d of r) {
    if (d === void 0) {
      o.push(void 0);
      continue;
    }
    let m, g;
    switch (l) {
      case "scenarios":
        m = `…${d.subtitle}`;
        break;
      case "datasets":
        m = d.title;
        break;
      case "freeform":
        m = d.title, g = d.subtitle;
        break;
      default:
        (0, import_assert_never13.default)(l);
    }
    let v, y;
    switch (l) {
      case "scenarios":
        v = "scenario", y = d.scenario.key;
        break;
      case "datasets":
        v = "dataset", y = d.testSummary.d;
        break;
      case "freeform":
        v = "freeform", y = `${d.scenario.key}::${d.testSummary.d}`;
        break;
      default:
        (0, import_assert_never13.default)(l);
    }
    o.push(
      new Xn(
        n,
        e,
        v,
        m,
        g,
        d.scenario,
        d.testSummary.d,
        y
      )
    );
  }
  const a = Se(
    o.map((d) => d.yRange),
    (d) => {
      let m = Number.POSITIVE_INFINITY, g = Number.NEGATIVE_INFINITY;
      for (const v of d)
        (v == null ? void 0 : v.min) < m && (m = v.min), (v == null ? void 0 : v.max) > g && (g = v.max);
      return {
        min: m,
        max: g
      };
    }
  );
  Se(
    [t.consistentYRange, a],
    ([d, m]) => d ? m : void 0
  ).subscribe((d) => {
    for (const m of o)
      m.updateYAxisRange(d);
  });
  const u = `row_${o.map((d) => d.pinnedItemKey).join("_")}`;
  return {
    kind: l,
    title: i,
    subtitle: s,
    showTitle: l !== "datasets",
    items: r,
    boxes: o,
    pinnedItemKey: u
  };
}
function ks(n) {
  var a, c;
  const e = n.comparisonConfig, t = n.dataCoordinator, l = t.bundleModelL, i = t.bundleModelR;
  function s(f, u, d) {
    return new Un(e, t, d, f, u);
  }
  const r = e.datasets.getContextGraphIdsForDataset(n.datasetKey, n.scenario), o = [];
  for (const f of r) {
    const u = (a = l.modelSpec.graphSpecs) == null ? void 0 : a.find((m) => m.id === f), d = (c = i.modelSpec.graphSpecs) == null ? void 0 : c.find((m) => m.id === f);
    o.push({
      graphL: s(n.scenario, u, "left"),
      graphR: s(n.scenario, d, "right")
    });
  }
  return o;
}
var Yt = "#444";
var et = "Roboto Condensed";
var Ot = 14;
var Ut = "#777";
var Xt = "rgba(0, 0, 0, 0)";
var ys = {
  beforeDatasetsDraw: (n) => {
    const e = n.ctx;
    e.save();
    const t = n.data.datasets;
    for (let l = 0; l < t.length; l++) {
      const i = t[l];
      if (i.data.length !== 1)
        continue;
      const r = n.getDatasetMeta(l).data[0];
      let o;
      if (i.fill === "+1") {
        if (l + 1 >= t.length)
          break;
        const c = n.getDatasetMeta(l + 1).data[0];
        o = { x: c._view.x, y: c._view.y };
      } else if (i.fill === "start")
        o = { x: r._view.x, y: n.chartArea.bottom };
      else if (i.fill === "end")
        o = { x: r._view.x, y: n.chartArea.top };
      else
        return;
      e.beginPath(), e.moveTo(r._view.x, r._view.y), e.lineTo(o.x, o.y), e.closePath(), e.strokeStyle = i.backgroundColor, e.lineWidth = 4, e.stroke();
    }
    e.restore();
  }
};
import_chart.Chart.pluginService.register(ys);
var Ms = class {
  constructor(e, t) {
    this.canvas = e, this.viewModel = t, this.chart = $s(e, t);
  }
  /**
   * Update the view when one or more "mutable" properties in the view model has changed.
   */
  update() {
    const e = this.chart;
    function t(l, i) {
      const s = e.data.datasets.find((r) => r.label === l);
      if (s) {
        const r = s.data[0];
        r.y = i;
      }
    }
    e && (t("hidden-y-min", this.viewModel.yMin), t("hidden-y-max", this.viewModel.yMax), e.update());
  }
  /**
   * Destroy the chart and any associated resources.
   */
  destroy() {
    var e;
    (e = this.chart) == null || e.destroy(), this.chart = void 0;
  }
};
function $s(n, e) {
  const t = [], l = (f, u, d) => {
    t.push({
      label: f,
      type: "scatter",
      fill: false,
      borderColor: Xt,
      backgroundColor: Xt,
      pointHitRadius: 0,
      pointHoverRadius: 0,
      pointRadius: 0,
      data: [{ x: u, y: d }]
    });
  };
  let i = Number.NEGATIVE_INFINITY;
  function s(f) {
    let u, d = false;
    switch (f.style) {
      case "dashed":
        u = [8, 2];
        break;
      case "fill-to-next":
        d = "+1";
        break;
      case "fill-above":
        d = "end";
        break;
      case "fill-below":
        d = "start";
        break;
    }
    let m;
    d !== false && (m = `rgba(0, 128, 0, ${f.points.length > 1 ? 0.1 : 0.3})`);
    let g = 0, v;
    f.points.length === 1 && f.style !== "dashed" && (g = 5, v = f.color);
    for (const y of f.points)
      y.x > i && (i = y.x);
    t.push({
      data: f.points,
      borderColor: f.color,
      borderWidth: f.lineWidth !== void 0 ? f.lineWidth : 3,
      borderDash: u,
      backgroundColor: m,
      fill: d,
      pointRadius: g,
      pointBackgroundColor: v,
      pointBorderWidth: 0,
      pointBorderColor: "transparent",
      lineTension: 0
    });
  }
  for (const f of e.plots)
    s(f);
  const r = e.xMin, o = e.xMax, a = r === 1990, c = o !== void 0 ? o : i;
  return l("hidden-y-min", c, e.yMin), l("hidden-y-max", c, e.yMax), new import_chart.Chart(n, {
    type: "line",
    data: {
      datasets: t
    },
    options: {
      // Use built-in responsive resizing support.  Note that for this to work
      // correctly, the canvas parent must be a container with a fixed size
      // (in `vw` units) and `position: relative`.  For more information:
      //   https://www.chartjs.org/docs/latest/general/responsive.html
      responsive: true,
      maintainAspectRatio: false,
      // Disable animation
      animation: { duration: 0 },
      hover: { animationDuration: 0 },
      responsiveAnimationDuration: 0,
      // Disable the built-in title and legend
      title: { display: false },
      legend: { display: false },
      // Don't show points
      elements: {
        point: {
          radius: 0
        }
      },
      // Customize tooltip font
      tooltips: {
        titleFontFamily: et,
        bodyFontFamily: et
      },
      // Axis configurations
      scales: {
        xAxes: [
          {
            type: "linear",
            position: "bottom",
            gridLines: {
              color: Yt
            },
            ticks: {
              maxTicksLimit: 6,
              maxRotation: 0,
              min: r,
              max: o,
              fontFamily: et,
              fontSize: Ot,
              fontColor: Ut,
              callback: (f, u) => a && u === 0 ? "" : f
            }
          }
        ],
        yAxes: [
          {
            gridLines: {
              color: Yt
            },
            ticks: {
              fontFamily: et,
              fontSize: Ot,
              fontColor: Ut
            }
          }
        ]
      }
    }
  });
}
function Rs(n) {
  ce(n, "svelte-bdlfj4", ".graph-inner-container.svelte-bdlfj4{position:absolute;top:0;left:0;bottom:0;right:0}");
}
function Ss(n) {
  let e;
  return {
    c() {
      e = p("div"), h(e, "class", "graph-inner-container svelte-bdlfj4");
    },
    m(t, l) {
      k(t, e, l), n[4](e);
    },
    p: K,
    i: K,
    o: K,
    d(t) {
      t && w(e), n[4](null);
    }
  };
}
function zs(n, e, t) {
  let { viewModel: l } = e, i, s, r;
  function o() {
    s == null || s.destroy();
    const c = document.createElement("canvas");
    for (; i.firstChild; )
      i.firstChild.remove();
    i.appendChild(c), t(3, r = l.key), t(2, s = new Ms(c, l)), t(
      1,
      l.onUpdated = () => {
        s == null || s.update();
      },
      l
    );
  }
  at(() => (o(), () => {
    s == null || s.destroy(), t(2, s = void 0);
  }));
  function a(c) {
    be[c ? "unshift" : "push"](() => {
      i = c, t(0, i);
    });
  }
  return n.$$set = (c) => {
    "viewModel" in c && t(1, l = c.viewModel);
  }, n.$$.update = () => {
    n.$$.dirty & /*graphView, viewModel, previousKey*/
    14 && s && l.key !== r && o();
  }, [i, l, s, r, a];
}
var Zn = class extends re {
  constructor(e) {
    super(), oe(this, e, zs, Ss, te, { viewModel: 1 }, Rs);
  }
};
function Cs(n) {
  ce(n, "svelte-1dgb0oc", ".detail-box.svelte-1dgb0oc{display:flex;flex-direction:column;--box-graph-w:calc(30rem * var(--graph-zoom));--box-graph-h:calc(22rem * var(--graph-zoom))}.title-row.svelte-1dgb0oc{position:relative;max-width:calc(var(--box-graph-w) + 1rem);height:1.4rem;cursor:pointer}.title-content.svelte-1dgb0oc{position:absolute;max-width:calc(var(--box-graph-w) + 1rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.title-content.svelte-1dgb0oc:hover{width:max-content;max-width:unset;overflow:unset;z-index:100;background-color:#3c3c3c}.title.svelte-1dgb0oc{margin-left:0.7rem;font-size:1.1em;font-weight:700}.subtitle.svelte-1dgb0oc{color:#aaa;margin-left:0.4rem;margin-right:0.7rem}.content-container.svelte-1dgb0oc{display:flex;flex-direction:column;width:calc(var(--box-graph-w) + 1rem + 0.6rem);max-width:calc(var(--box-graph-w) + 1rem + 0.6rem);height:calc(var(--box-graph-h) + 4rem + 1rem + 0.6rem);max-height:calc(var(--box-graph-h) + 4rem + 1rem + 0.6rem)}.content.svelte-1dgb0oc{display:flex;flex-direction:column;height:calc(var(--box-graph-h) + 4rem);padding:0.5rem;border-width:0.3rem;border-style:solid;border-radius:0.8rem}.graph-container.svelte-1dgb0oc{position:relative;display:flex;width:var(--box-graph-w);height:var(--box-graph-h)}.message-container.svelte-1dgb0oc{display:flex;flex-direction:column;max-width:var(--box-graph-w);height:4rem;justify-content:flex-end}.message.svelte-1dgb0oc{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.data-row.svelte-1dgb0oc{display:flex;flex-direction:row;align-items:baseline}.data-label.svelte-1dgb0oc{font-size:0.9em;color:#aaa;min-width:2rem;margin-right:0.4rem;text-align:right}.data-value.svelte-1dgb0oc{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}");
}
function Zt(n) {
  let e, t, l, i = (
    /*viewModel*/
    n[0].title + ""
  ), s, r, o = (
    /*viewModel*/
    n[0].subtitle && Jt(n)
  );
  return {
    c() {
      e = p("div"), t = p("div"), l = p("span"), o && o.c(), h(l, "class", "title svelte-1dgb0oc"), h(t, "class", "title-content svelte-1dgb0oc"), h(e, "class", "title-row no-selection svelte-1dgb0oc");
    },
    m(a, c) {
      k(a, e, c), _(e, t), _(t, l), l.innerHTML = i, o && o.m(t, null), s || (r = [
        ne(
          e,
          "click",
          /*onTitleClicked*/
          n[4]
        ),
        ne(e, "contextmenu", On(
          /*onContextMenu*/
          n[5]
        ))
      ], s = true);
    },
    p(a, c) {
      c & /*viewModel*/
      1 && i !== (i = /*viewModel*/
      a[0].title + "") && (l.innerHTML = i), /*viewModel*/
      a[0].subtitle ? o ? o.p(a, c) : (o = Jt(a), o.c(), o.m(t, null)) : o && (o.d(1), o = null);
    },
    d(a) {
      a && w(e), o && o.d(), s = false, we(r);
    }
  };
}
function Jt(n) {
  let e, t = (
    /*viewModel*/
    n[0].subtitle + ""
  );
  return {
    c() {
      e = p("span"), h(e, "class", "subtitle svelte-1dgb0oc");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      l[0].subtitle + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function Qt(n) {
  let e, t, l, i, s, r;
  l = new Zn({
    props: {
      viewModel: (
        /*$content*/
        n[3].comparisonGraphViewModel
      )
    }
  });
  function o(f, u) {
    return (
      /*$content*/
      f[3].message ? Ts : Is
    );
  }
  let a = o(n), c = a(n);
  return {
    c() {
      e = p("div"), t = p("div"), A(l.$$.fragment), i = p("div"), c.c(), h(t, "class", "graph-container svelte-1dgb0oc"), h(i, "class", "message-container svelte-1dgb0oc"), h(e, "class", s = "content " + /*$content*/
      n[3].bucketClass + " svelte-1dgb0oc");
    },
    m(f, u) {
      k(f, e, u), _(e, t), E(l, t, null), _(e, i), c.m(i, null), r = true;
    },
    p(f, u) {
      const d = {};
      u & /*$content*/
      8 && (d.viewModel = /*$content*/
      f[3].comparisonGraphViewModel), l.$set(d), a === (a = o(f)) && c ? c.p(f, u) : (c.d(1), c = a(f), c && (c.c(), c.m(i, null))), (!r || u & /*$content*/
      8 && s !== (s = "content " + /*$content*/
      f[3].bucketClass + " svelte-1dgb0oc")) && h(e, "class", s);
    },
    i(f) {
      r || (b(l.$$.fragment, f), r = true);
    },
    o(f) {
      M(l.$$.fragment, f), r = false;
    },
    d(f) {
      f && w(e), F(l), c.d();
    }
  };
}
function Is(n) {
  let e, t, l, i = We(
    /*$content*/
    n[3].diffReport.avgDiff
  ) + "", s, r, o, a, c = We(
    /*$content*/
    n[3].diffReport.minDiff
  ) + "", f, u, d, m, g = tl(
    /*$content*/
    n[3]
  ) + "";
  return {
    c() {
      e = p("div"), t = p("div"), t.textContent = "avg", l = p("div"), s = P(i), r = p("div"), o = p("div"), o.textContent = "min", a = p("div"), f = P(c), u = p("div"), d = p("div"), d.textContent = "max", m = p("div"), h(t, "class", "data-label svelte-1dgb0oc"), h(l, "class", "data-value svelte-1dgb0oc"), h(e, "class", "data-row svelte-1dgb0oc"), h(o, "class", "data-label svelte-1dgb0oc"), h(a, "class", "data-value svelte-1dgb0oc"), h(r, "class", "data-row svelte-1dgb0oc"), h(d, "class", "data-label svelte-1dgb0oc"), h(m, "class", "data-value svelte-1dgb0oc"), h(u, "class", "data-row svelte-1dgb0oc");
    },
    m(v, y) {
      k(v, e, y), _(e, t), _(e, l), _(l, s), k(v, r, y), _(r, o), _(r, a), _(a, f), k(v, u, y), _(u, d), _(u, m), m.innerHTML = g;
    },
    p(v, y) {
      y & /*$content*/
      8 && i !== (i = We(
        /*$content*/
        v[3].diffReport.avgDiff
      ) + "") && W(s, i), y & /*$content*/
      8 && c !== (c = We(
        /*$content*/
        v[3].diffReport.minDiff
      ) + "") && W(f, c), y & /*$content*/
      8 && g !== (g = tl(
        /*$content*/
        v[3]
      ) + "") && (m.innerHTML = g);
    },
    d(v) {
      v && (w(e), w(r), w(u));
    }
  };
}
function Ts(n) {
  let e, t = (
    /*$content*/
    n[3].message + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "message svelte-1dgb0oc");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i & /*$content*/
      8 && t !== (t = /*$content*/
      l[3].message + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function Ds(n) {
  let e, t, l = (
    /*$content*/
    n[3] && Qt(n)
  );
  return {
    c() {
      l && l.c(), e = ee();
    },
    m(i, s) {
      l && l.m(i, s), k(i, e, s), t = true;
    },
    p(i, s) {
      i[3] ? l ? (l.p(i, s), s & /*$content*/
      8 && b(l, 1)) : (l = Qt(i), l.c(), b(l, 1), l.m(e.parentNode, e)) : l && (U(), M(l, 1, 1, () => {
        l = null;
      }), X());
    },
    i(i) {
      t || (b(l), t = true);
    },
    o(i) {
      M(l), t = false;
    },
    d(i) {
      i && w(e), l && l.d(i);
    }
  };
}
function js(n) {
  let e, t, l, i, s, r = (
    /*viewModel*/
    n[0].title && Zt(n)
  );
  function o(c) {
    n[8](c);
  }
  let a = {
    $$slots: { default: [Ds] },
    $$scope: { ctx: n }
  };
  return (
    /*visible*/
    n[1] !== void 0 && (a.visible = /*visible*/
    n[1]), l = new Dt({ props: a }), be.push(() => ut(l, "visible", o)), {
      c() {
        e = p("div"), r && r.c(), t = p("div"), A(l.$$.fragment), h(t, "class", "content-container svelte-1dgb0oc"), h(e, "class", "detail-box svelte-1dgb0oc");
      },
      m(c, f) {
        k(c, e, f), r && r.m(e, null), _(e, t), E(l, t, null), s = true;
      },
      p(c, [f]) {
        c[0].title ? r ? r.p(c, f) : (r = Zt(c), r.c(), r.m(e, t)) : r && (r.d(1), r = null);
        const u = {};
        f & /*$$scope, $content*/
        1032 && (u.$$scope = { dirty: f, ctx: c }), !i && f & /*visible*/
        2 && (i = true, u.visible = /*visible*/
        c[1], ct(() => i = false)), l.$set(u);
      },
      i(c) {
        s || (b(l.$$.fragment, c), s = true);
      },
      o(c) {
        M(l.$$.fragment, c), s = false;
      },
      d(c) {
        c && w(e), r && r.d(), F(l);
      }
    }
  );
}
function We(n) {
  return n != null ? `${n.toFixed(2)}%` : "n/a";
}
function el(n) {
  return n != null ? n.toFixed(4) : "undefined";
}
function tl(n) {
  const e = n.diffReport.maxDiffPoint;
  let t = "";
  return t += We(n.diffReport.maxDiff), e && (t += "&nbsp;(", t += `<span class="dataset-color-0">${el(e.valueL)}</span>`, t += "&nbsp;|&nbsp;", t += `<span class="dataset-color-1">${el(e.valueR)}</span>`, t += `) at ${e.time}`), t;
}
function Ls(n, e, t) {
  let l, i = K, s = () => (i(), i = je(o, (v) => t(3, l = v)), o);
  n.$$.on_destroy.push(() => i());
  let { viewModel: r } = e, o = r.content;
  s();
  let a = false, c = a, f;
  const u = Ie();
  function d() {
    u("toggle-context-graphs");
  }
  function m(v) {
    r.kind !== "freeform" && u("show-context-menu", {
      kind: "box",
      itemKey: r.pinnedItemKey,
      clickEvent: v
    });
  }
  function g(v) {
    a = v, t(1, a);
  }
  return n.$$set = (v) => {
    "viewModel" in v && t(0, r = v.viewModel);
  }, n.$$.update = () => {
    n.$$.dirty & /*visible, previousVisible, viewModel, previousViewModel*/
    195 && (a !== c || r.requestKey !== (f == null ? void 0 : f.requestKey)) && (f == null || f.clearData(), t(6, c = a), t(7, f = r), s(t(2, o = r.content)), a && r.requestData());
  }, [
    r,
    a,
    o,
    l,
    d,
    m,
    c,
    f,
    g
  ];
}
var Jn = class extends re {
  constructor(e) {
    super(), oe(this, e, Ls, js, te, { viewModel: 0 }, Cs);
  }
};
function Vs(n) {
  ce(n, "svelte-er6ug6", ".detail-row.svelte-er6ug6{display:flex;flex-direction:column}.title-row.svelte-er6ug6{align-items:baseline;margin-bottom:0.5rem}.title.svelte-er6ug6{margin-right:0.8rem;font-size:1.5em;font-weight:700}.subtitle.svelte-er6ug6{font-size:1.3em;color:#aaa}.subtitle.svelte-er6ug6 .subtitle-sep{color:#666}.boxes.svelte-er6ug6{display:flex;flex-direction:row}.box-container.dimmed.svelte-er6ug6{opacity:0.2}.spacer-fixed.svelte-er6ug6{min-width:1.5rem}.context-graphs-container.svelte-er6ug6{display:inline-flex;flex-direction:row;margin-top:1rem;padding:0 1rem;background-color:#555}.context-graphs-column.svelte-er6ug6{display:inline-flex;flex-direction:column}.context-graph-row.svelte-er6ug6{display:flex;flex-direction:row;width:77.5rem;margin:1rem 0}.context-graph-spacer.svelte-er6ug6{min-width:1.5rem}");
}
function ll(n, e, t) {
  const l = n.slice();
  return l[9] = e[t], l;
}
function nl(n, e, t) {
  const l = n.slice();
  return l[12] = e[t], l[14] = t, l;
}
function il(n) {
  let e, t, l = (
    /*viewModel*/
    n[0].title + ""
  ), i, s, r, o = (
    /*viewModel*/
    n[0].subtitle && sl(n)
  );
  return {
    c() {
      e = p("div"), t = p("div"), i = Me(), o && o.c(), h(t, "class", "title svelte-er6ug6"), h(e, "class", "title-row svelte-er6ug6");
    },
    m(a, c) {
      k(a, e, c), _(e, t), t.innerHTML = l, _(e, i), o && o.m(e, null), s || (r = ne(e, "contextmenu", On(
        /*onContextMenu*/
        n[3]
      )), s = true);
    },
    p(a, c) {
      c & /*viewModel*/
      1 && l !== (l = /*viewModel*/
      a[0].title + "") && (t.innerHTML = l), /*viewModel*/
      a[0].subtitle ? o ? o.p(a, c) : (o = sl(a), o.c(), o.m(e, null)) : o && (o.d(1), o = null);
    },
    d(a) {
      a && w(e), o && o.d(), s = false, r();
    }
  };
}
function sl(n) {
  let e, t = (
    /*viewModel*/
    n[0].subtitle + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "subtitle svelte-er6ug6");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      l[0].subtitle + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function xs(n) {
  let e;
  return {
    c() {
      e = p("div"), h(e, "class", "spacer-fixed svelte-er6ug6");
    },
    m(t, l) {
      k(t, e, l);
    },
    d(t) {
      t && w(e);
    }
  };
}
function ol(n) {
  let e, t, l, i, s, r = (
    /*i*/
    n[14] > 0 && xs()
  );
  function o() {
    return (
      /*toggle_context_graphs_handler*/
      n[6](
        /*i*/
        n[14]
      )
    );
  }
  return l = new Jn({
    props: { viewModel: (
      /*boxViewModel*/
      n[12]
    ) }
  }), l.$on("toggle-context-graphs", o), l.$on(
    "show-context-menu",
    /*show_context_menu_handler*/
    n[7]
  ), {
    c() {
      r && r.c(), e = Me(), t = p("div"), A(l.$$.fragment), i = Me(), h(t, "class", "box-container svelte-er6ug6"), de(t, "dimmed", fl(
        /*i*/
        n[14],
        /*expandedIndex*/
        n[1]
      ));
    },
    m(a, c) {
      r && r.m(a, c), k(a, e, c), k(a, t, c), E(l, t, null), _(t, i), s = true;
    },
    p(a, c) {
      n = a;
      const f = {};
      c & /*viewModel*/
      1 && (f.viewModel = /*boxViewModel*/
      n[12]), l.$set(f), (!s || c & /*isDimmed, expandedIndex*/
      2) && de(t, "dimmed", fl(
        /*i*/
        n[14],
        /*expandedIndex*/
        n[1]
      ));
    },
    i(a) {
      s || (b(l.$$.fragment, a), s = true);
    },
    o(a) {
      M(l.$$.fragment, a), s = false;
    },
    d(a) {
      a && (w(e), w(t)), r && r.d(a), F(l);
    }
  };
}
function rl(n) {
  let e, t, l, i, s, r = (
    /*contextGraphRows*/
    n[2] && al(n)
  );
  return {
    c() {
      e = p("div"), t = p("div"), l = Me(), i = p("div"), r && r.c(), ie(t, "min-width", "max(0%, min(calc(" + /*getContextGraphPadding*/
      n[5](
        /*expandedIndex*/
        n[1]
      ) + "% - 38.75rem), calc(100% - 77.5rem)))"), h(i, "class", "context-graphs-column svelte-er6ug6"), h(e, "class", "context-graphs-container svelte-er6ug6");
    },
    m(o, a) {
      k(o, e, a), _(e, t), _(e, l), _(e, i), r && r.m(i, null), s = true;
    },
    p(o, a) {
      (!s || a & /*expandedIndex*/
      2) && ie(t, "min-width", "max(0%, min(calc(" + /*getContextGraphPadding*/
      o[5](
        /*expandedIndex*/
        o[1]
      ) + "% - 38.75rem), calc(100% - 77.5rem)))"), /*contextGraphRows*/
      o[2] ? r ? (r.p(o, a), a & /*contextGraphRows*/
      4 && b(r, 1)) : (r = al(o), r.c(), b(r, 1), r.m(i, null)) : r && (U(), M(r, 1, 1, () => {
        r = null;
      }), X());
    },
    i(o) {
      s || (b(r), s = true);
    },
    o(o) {
      M(r), s = false;
    },
    d(o) {
      o && w(e), r && r.d();
    }
  };
}
function al(n) {
  let e, t, l = B(
    /*contextGraphRows*/
    n[2]
  ), i = [];
  for (let r = 0; r < l.length; r += 1)
    i[r] = cl(ll(n, l, r));
  const s = (r) => M(i[r], 1, 1, () => {
    i[r] = null;
  });
  return {
    c() {
      for (let r = 0; r < i.length; r += 1)
        i[r].c();
      e = ee();
    },
    m(r, o) {
      for (let a = 0; a < i.length; a += 1)
        i[a] && i[a].m(r, o);
      k(r, e, o), t = true;
    },
    p(r, o) {
      if (o & /*contextGraphRows*/
      4) {
        l = B(
          /*contextGraphRows*/
          r[2]
        );
        let a;
        for (a = 0; a < l.length; a += 1) {
          const c = ll(r, l, a);
          i[a] ? (i[a].p(c, o), b(i[a], 1)) : (i[a] = cl(c), i[a].c(), b(i[a], 1), i[a].m(e.parentNode, e));
        }
        for (U(), a = l.length; a < i.length; a += 1)
          s(a);
        X();
      }
    },
    i(r) {
      if (!t) {
        for (let o = 0; o < l.length; o += 1)
          b(i[o]);
        t = true;
      }
    },
    o(r) {
      i = i.filter(Boolean);
      for (let o = 0; o < i.length; o += 1)
        M(i[o]);
      t = false;
    },
    d(r) {
      r && w(e), se(i, r);
    }
  };
}
function cl(n) {
  let e, t, l, i, s, r, o, a;
  return t = new ot({
    props: {
      viewModel: (
        /*rowViewModel*/
        n[9].graphL
      )
    }
  }), r = new ot({
    props: {
      viewModel: (
        /*rowViewModel*/
        n[9].graphR
      )
    }
  }), {
    c() {
      e = p("div"), A(t.$$.fragment), l = Me(), i = p("div"), s = Me(), A(r.$$.fragment), o = Me(), h(i, "class", "context-graph-spacer svelte-er6ug6"), h(e, "class", "context-graph-row svelte-er6ug6");
    },
    m(c, f) {
      k(c, e, f), E(t, e, null), _(e, l), _(e, i), _(e, s), E(r, e, null), _(e, o), a = true;
    },
    p(c, f) {
      const u = {};
      f & /*contextGraphRows*/
      4 && (u.viewModel = /*rowViewModel*/
      c[9].graphL), t.$set(u);
      const d = {};
      f & /*contextGraphRows*/
      4 && (d.viewModel = /*rowViewModel*/
      c[9].graphR), r.$set(d);
    },
    i(c) {
      a || (b(t.$$.fragment, c), b(r.$$.fragment, c), a = true);
    },
    o(c) {
      M(t.$$.fragment, c), M(r.$$.fragment, c), a = false;
    },
    d(c) {
      c && w(e), F(t), F(r);
    }
  };
}
function Ns(n) {
  let e, t, l, i, s, r = (
    /*viewModel*/
    n[0].showTitle && il(n)
  ), o = B(
    /*viewModel*/
    n[0].boxes
  ), a = [];
  for (let u = 0; u < o.length; u += 1)
    a[u] = ol(nl(n, o, u));
  const c = (u) => M(a[u], 1, 1, () => {
    a[u] = null;
  });
  let f = (
    /*expandedIndex*/
    n[1] !== void 0 && rl(n)
  );
  return {
    c() {
      e = p("div"), r && r.c(), t = Me(), l = p("div");
      for (let u = 0; u < a.length; u += 1)
        a[u].c();
      i = Me(), f && f.c(), h(l, "class", "boxes svelte-er6ug6"), h(e, "class", "detail-row svelte-er6ug6");
    },
    m(u, d) {
      k(u, e, d), r && r.m(e, null), _(e, t), _(e, l);
      for (let m = 0; m < a.length; m += 1)
        a[m] && a[m].m(l, null);
      _(e, i), f && f.m(e, null), s = true;
    },
    p(u, [d]) {
      if (
        /*viewModel*/
        u[0].showTitle ? r ? r.p(u, d) : (r = il(u), r.c(), r.m(e, t)) : r && (r.d(1), r = null), d & /*isDimmed, expandedIndex, viewModel, onToggleContextGraphs*/
        19
      ) {
        o = B(
          /*viewModel*/
          u[0].boxes
        );
        let m;
        for (m = 0; m < o.length; m += 1) {
          const g = nl(u, o, m);
          a[m] ? (a[m].p(g, d), b(a[m], 1)) : (a[m] = ol(g), a[m].c(), b(a[m], 1), a[m].m(l, null));
        }
        for (U(), m = o.length; m < a.length; m += 1)
          c(m);
        X();
      }
      u[1] !== void 0 ? f ? (f.p(u, d), d & /*expandedIndex*/
      2 && b(f, 1)) : (f = rl(u), f.c(), b(f, 1), f.m(e, null)) : f && (U(), M(f, 1, 1, () => {
        f = null;
      }), X());
    },
    i(u) {
      if (!s) {
        for (let d = 0; d < o.length; d += 1)
          b(a[d]);
        b(f), s = true;
      }
    },
    o(u) {
      a = a.filter(Boolean);
      for (let d = 0; d < a.length; d += 1)
        M(a[d]);
      M(f), s = false;
    },
    d(u) {
      u && w(e), r && r.d(), se(a, u), f && f.d();
    }
  };
}
function fl(n, e) {
  return e !== void 0 && n !== e;
}
function Ps(n, e, t) {
  let { viewModel: l } = e, i, s;
  const r = Ie();
  function o(d) {
    r("show-context-menu", {
      kind: "row",
      itemKey: l.pinnedItemKey,
      clickEvent: d
    });
  }
  function a(d) {
    d === i ? (t(1, i = void 0), t(2, s = void 0)) : (t(1, i = d), t(2, s = ks(l.boxes[d])));
  }
  function c(d) {
    return d === void 0 ? 0 : l.boxes.length > 0 ? (d + 0.5) / l.boxes.length * 100 : 0;
  }
  const f = (d) => a(d);
  function u(d) {
    he.call(this, n, d);
  }
  return n.$$set = (d) => {
    "viewModel" in d && t(0, l = d.viewModel);
  }, n.$$.update = () => {
    n.$$.dirty & /*viewModel*/
    1 && l && (t(1, i = void 0), t(2, s = void 0));
  }, [
    l,
    i,
    s,
    o,
    a,
    c,
    f,
    u
  ];
}
var Qn = class extends re {
  constructor(e) {
    super(), oe(this, e, Ps, Ns, te, { viewModel: 0 }, Vs);
  }
};
function qs(n) {
  ce(n, "svelte-4p3lgl", '.dataset-container.svelte-4p3lgl{display:flex;flex:1;flex-direction:column}.dataset-row.svelte-4p3lgl{display:flex;flex:1;align-items:baseline;margin-left:0.6rem;cursor:pointer}.dataset-row.svelte-4p3lgl:hover{background-color:rgba(255, 255, 255, 0.05)}.dataset-arrow.svelte-4p3lgl{color:#777}.legend-item.svelte-4p3lgl{font-family:"Roboto Condensed";font-weight:700;font-size:1rem;margin:0.2rem 0.4rem;padding:0.25rem 0.6rem 0.2rem 0.6rem;color:#fff;text-align:center}.detail-box-container.svelte-4p3lgl{display:flex;flex:1;margin-top:0.2rem;margin-bottom:0.8rem;margin-left:0.4rem}');
}
function Ks(n) {
  let e, t = (
    /*legendLabelR*/
    n[7].toUpperCase() + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "legend-item svelte-4p3lgl"), ie(
        e,
        "background-color",
        /*legendColorR*/
        n[5]
      );
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p: K,
    d(l) {
      l && w(e);
    }
  };
}
function Bs(n) {
  let e, t = (
    /*legendLabelL*/
    n[6].toUpperCase() + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "legend-item svelte-4p3lgl"), ie(
        e,
        "background-color",
        /*legendColorL*/
        n[4]
      );
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p: K,
    d(l) {
      l && w(e);
    }
  };
}
function Es(n) {
  let e, t;
  return {
    c() {
      e = p("div"), t = P(
        /*nameR*/
        n[3]
      ), h(e, "class", "dataset-name " + /*bucketClass*/
      n[8] + " svelte-4p3lgl");
    },
    m(l, i) {
      k(l, e, i), _(e, t);
    },
    p: K,
    d(l) {
      l && w(e);
    }
  };
}
function Fs(n) {
  let e, t;
  return {
    c() {
      e = p("div"), t = P(
        /*nameL*/
        n[2]
      ), h(e, "class", "dataset-name " + /*bucketClass*/
      n[8] + " svelte-4p3lgl");
    },
    m(l, i) {
      k(l, e, i), _(e, t);
    },
    p: K,
    d(l) {
      l && w(e);
    }
  };
}
function Hs(n) {
  let e, t, l, i, s;
  return {
    c() {
      e = p("div"), t = P(
        /*nameL*/
        n[2]
      ), l = p("span"), l.textContent = " -> ", i = p("div"), s = P(
        /*nameR*/
        n[3]
      ), h(e, "class", "dataset-name " + /*bucketClass*/
      n[8] + " svelte-4p3lgl"), h(l, "class", "dataset-arrow svelte-4p3lgl"), h(i, "class", "dataset-name " + /*bucketClass*/
      n[8] + " svelte-4p3lgl");
    },
    m(r, o) {
      k(r, e, o), _(e, t), k(r, l, o), k(r, i, o), _(i, s);
    },
    p: K,
    d(r) {
      r && (w(e), w(l), w(i));
    }
  };
}
function ul(n) {
  let e, t, l;
  return t = new Jn({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].detailBoxViewModel
      )
    }
  }), {
    c() {
      e = p("div"), A(t.$$.fragment), h(e, "class", "detail-box-container svelte-4p3lgl");
    },
    m(i, s) {
      k(i, e, s), E(t, e, null), l = true;
    },
    p(i, s) {
      const r = {};
      s & /*viewModel*/
      1 && (r.viewModel = /*viewModel*/
      i[0].detailBoxViewModel), t.$set(r);
    },
    i(i) {
      l || (b(t.$$.fragment, i), l = true);
    },
    o(i) {
      M(t.$$.fragment, i), l = false;
    },
    d(i) {
      i && w(e), F(t);
    }
  };
}
function As(n) {
  let e, t, l, i, s, r;
  function o(g, v) {
    if (
      /*legendLabelL*/
      g[6] && !/*legendLabelR*/
      g[7]
    ) return Bs;
    if (
      /*legendLabelR*/
      g[7]
    ) return Ks;
  }
  let a = o(n), c = a && a(n);
  function f(g, v) {
    if (
      /*nameL*/
      g[2] && /*nameR*/
      g[3] && /*nameL*/
      g[2] !== /*nameR*/
      g[3]
    ) return Hs;
    if (
      /*nameL*/
      g[2] && !/*nameR*/
      g[3]
    ) return Fs;
    if (
      /*nameR*/
      g[3]
    ) return Es;
  }
  let u = f(n), d = u && u(n), m = (
    /*$detailBoxVisible*/
    n[1] && ul(n)
  );
  return {
    c() {
      e = p("div"), t = p("div"), c && c.c(), l = ee(), d && d.c(), m && m.c(), h(t, "class", "dataset-row svelte-4p3lgl"), h(e, "class", "dataset-container svelte-4p3lgl");
    },
    m(g, v) {
      k(g, e, v), _(e, t), c && c.m(t, null), _(t, l), d && d.m(t, null), m && m.m(e, null), i = true, s || (r = ne(
        t,
        "click",
        /*onDatasetClicked*/
        n[10]
      ), s = true);
    },
    p(g, [v]) {
      c && c.p(g, v), d && d.p(g, v), /*$detailBoxVisible*/
      g[1] ? m ? (m.p(g, v), v & /*$detailBoxVisible*/
      2 && b(m, 1)) : (m = ul(g), m.c(), b(m, 1), m.m(e, null)) : m && (U(), M(m, 1, 1, () => {
        m = null;
      }), X());
    },
    i(g) {
      i || (b(m), i = true);
    },
    o(g) {
      M(m), i = false;
    },
    d(g) {
      g && w(e), c && c.d(), d && d.d(), m && m.d(), s = false, r();
    }
  };
}
function Gs(n, e, t) {
  let l, { viewModel: i } = e;
  const s = i.nameL, r = i.nameR, o = i.legendColorL, a = i.legendColorR, c = i.legendLabelL, f = i.legendLabelR, u = i.bucketClass, d = i.detailBoxVisible;
  ve(n, d, (g) => t(1, l = g));
  function m() {
    d.update((g) => !g);
  }
  return n.$$set = (g) => {
    "viewModel" in g && t(0, i = g.viewModel);
  }, [
    i,
    l,
    s,
    r,
    o,
    a,
    c,
    f,
    u,
    d,
    m
  ];
}
var Ws = class extends re {
  constructor(e) {
    super(), oe(this, e, Gs, As, te, { viewModel: 0 }, qs);
  }
};
function Ys(n) {
  ce(n, "svelte-1scaj70", ".graphs-row.svelte-1scaj70{display:flex;flex-direction:row;flex:1}.spacer-flex.svelte-1scaj70{flex:1}.spacer-fixed.svelte-1scaj70{flex:0 0 2rem}.content.svelte-1scaj70{display:flex;flex-direction:column;flex:1}.graphs-container.svelte-1scaj70{display:flex;flex-direction:row}.metadata-container.svelte-1scaj70{display:flex;flex-direction:column}.metadata-header.svelte-1scaj70{margin-top:0.6rem}.metadata-row.svelte-1scaj70{display:flex;flex-direction:row}.metadata-row.svelte-1scaj70:hover{background-color:rgba(255, 255, 255, 0.05)}.metadata-col.svelte-1scaj70{display:flex;width:38rem;align-items:baseline}.metadata-key.svelte-1scaj70{color:#aaa;font-size:0.8em;margin-left:1rem}");
}
function dl(n, e, t) {
  const l = n.slice();
  return l[2] = e[t], l;
}
function ml(n, e, t) {
  const l = n.slice();
  return l[2] = e[t], l;
}
function hl(n) {
  let e;
  return {
    c() {
      e = p("div"), h(e, "class", "spacer-flex svelte-1scaj70");
    },
    m(t, l) {
      k(t, e, l);
    },
    d(t) {
      t && w(e);
    }
  };
}
function pl(n) {
  let e, t, l = B(
    /*viewModel*/
    n[0].metadataRows
  ), i = [];
  for (let s = 0; s < l.length; s += 1)
    i[s] = vl(ml(n, l, s));
  return {
    c() {
      e = p("div"), e.textContent = "Metadata differences:";
      for (let s = 0; s < i.length; s += 1)
        i[s].c();
      t = ee(), h(e, "class", "metadata-header svelte-1scaj70");
    },
    m(s, r) {
      k(s, e, r);
      for (let o = 0; o < i.length; o += 1)
        i[o] && i[o].m(s, r);
      k(s, t, r);
    },
    p(s, r) {
      if (r & /*viewModel*/
      1) {
        l = B(
          /*viewModel*/
          s[0].metadataRows
        );
        let o;
        for (o = 0; o < l.length; o += 1) {
          const a = ml(s, l, o);
          i[o] ? i[o].p(a, r) : (i[o] = vl(a), i[o].c(), i[o].m(t.parentNode, t));
        }
        for (; o < i.length; o += 1)
          i[o].d(1);
        i.length = l.length;
      }
    },
    d(s) {
      s && (w(e), w(t)), se(i, s);
    }
  };
}
function vl(n) {
  let e, t, l, i = (
    /*row*/
    n[2].key + ""
  ), s, r, o, a = (
    /*row*/
    (n[2].valueL || "n/a") + ""
  ), c, f, u, d, m = (
    /*row*/
    n[2].key + ""
  ), g, v, y, R = (
    /*row*/
    (n[2].valueR || "n/a") + ""
  ), $;
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), s = P(i), r = p("span"), r.textContent = " ", o = p("div"), c = P(a), f = p("div"), u = p("div"), d = p("div"), g = P(m), v = p("span"), v.textContent = " ", y = p("div"), $ = P(R), h(l, "class", "metadata-key svelte-1scaj70"), h(o, "class", "metadata-value"), h(t, "class", "metadata-col svelte-1scaj70"), h(f, "class", "spacer-fixed svelte-1scaj70"), h(d, "class", "metadata-key svelte-1scaj70"), h(y, "class", "metadata-value"), h(u, "class", "metadata-col svelte-1scaj70"), h(e, "class", "metadata-row svelte-1scaj70");
    },
    m(C, I) {
      k(C, e, I), _(e, t), _(t, l), _(l, s), _(t, r), _(t, o), _(o, c), _(e, f), _(e, u), _(u, d), _(d, g), _(u, v), _(u, y), _(y, $);
    },
    p(C, I) {
      I & /*viewModel*/
      1 && i !== (i = /*row*/
      C[2].key + "") && W(s, i), I & /*viewModel*/
      1 && a !== (a = /*row*/
      (C[2].valueL || "n/a") + "") && W(c, a), I & /*viewModel*/
      1 && m !== (m = /*row*/
      C[2].key + "") && W(g, m), I & /*viewModel*/
      1 && R !== (R = /*row*/
      (C[2].valueR || "n/a") + "") && W($, R);
    },
    d(C) {
      C && w(e);
    }
  };
}
function gl(n) {
  let e, t, l, i = B(
    /*viewModel*/
    n[0].datasetRows
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = _l(dl(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("div"), e.textContent = "Dataset differences:";
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      t = ee(), h(e, "class", "metadata-header svelte-1scaj70");
    },
    m(o, a) {
      k(o, e, a);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(o, a);
      k(o, t, a), l = true;
    },
    p(o, a) {
      if (a & /*viewModel*/
      1) {
        i = B(
          /*viewModel*/
          o[0].datasetRows
        );
        let c;
        for (c = 0; c < i.length; c += 1) {
          const f = dl(o, i, c);
          s[c] ? (s[c].p(f, a), b(s[c], 1)) : (s[c] = _l(f), s[c].c(), b(s[c], 1), s[c].m(t.parentNode, t));
        }
        for (U(), c = i.length; c < s.length; c += 1)
          r(c);
        X();
      }
    },
    i(o) {
      if (!l) {
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && (w(e), w(t)), se(s, o);
    }
  };
}
function _l(n) {
  let e, t;
  return e = new Ws({ props: { viewModel: (
    /*row*/
    n[2]
  ) } }), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*row*/
      l[2]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function bl(n) {
  let e;
  return {
    c() {
      e = p("div"), h(e, "class", "spacer-flex svelte-1scaj70");
    },
    m(t, l) {
      k(t, e, l);
    },
    d(t) {
      t && w(e);
    }
  };
}
function Os(n) {
  let e, t, l, i, s, r, o, a, c, f = (
    /*viewModel*/
    n[0].graphId + ""
  ), u, d, m, g = (
    /*align*/
    n[1] === "center" && hl()
  );
  i = new ot({
    props: { viewModel: (
      /*viewModel*/
      n[0].graphL
    ) }
  }), r = new ot({
    props: { viewModel: (
      /*viewModel*/
      n[0].graphR
    ) }
  });
  let v = (
    /*viewModel*/
    n[0].metadataRows.length > 0 && pl(n)
  ), y = (
    /*viewModel*/
    n[0].datasetRows.length > 0 && gl(n)
  ), R = (
    /*align*/
    n[1] === "center" && bl()
  );
  return {
    c() {
      e = p("div"), g && g.c(), t = p("div"), l = p("div"), A(i.$$.fragment), s = p("div"), A(r.$$.fragment), o = p("div"), a = p("div"), c = P("id "), u = P(f), v && v.c(), d = ee(), y && y.c(), R && R.c(), h(s, "class", "spacer-fixed svelte-1scaj70"), h(l, "class", "graphs-container svelte-1scaj70"), h(a, "class", "metadata-header svelte-1scaj70"), h(o, "class", "metadata-container svelte-1scaj70"), h(t, "class", "content svelte-1scaj70"), h(e, "class", "graphs-row svelte-1scaj70");
    },
    m($, C) {
      k($, e, C), g && g.m(e, null), _(e, t), _(t, l), E(i, l, null), _(l, s), E(r, l, null), _(t, o), _(o, a), _(a, c), _(a, u), v && v.m(o, null), _(o, d), y && y.m(o, null), R && R.m(e, null), m = true;
    },
    p($, [C]) {
      $[1] === "center" ? g || (g = hl(), g.c(), g.m(e, t)) : g && (g.d(1), g = null);
      const I = {};
      C & /*viewModel*/
      1 && (I.viewModel = /*viewModel*/
      $[0].graphL), i.$set(I);
      const D = {};
      C & /*viewModel*/
      1 && (D.viewModel = /*viewModel*/
      $[0].graphR), r.$set(D), (!m || C & /*viewModel*/
      1) && f !== (f = /*viewModel*/
      $[0].graphId + "") && W(u, f), /*viewModel*/
      $[0].metadataRows.length > 0 ? v ? v.p($, C) : (v = pl($), v.c(), v.m(o, d)) : v && (v.d(1), v = null), /*viewModel*/
      $[0].datasetRows.length > 0 ? y ? (y.p($, C), C & /*viewModel*/
      1 && b(y, 1)) : (y = gl($), y.c(), b(y, 1), y.m(o, null)) : y && (U(), M(y, 1, 1, () => {
        y = null;
      }), X()), /*align*/
      $[1] === "center" ? R || (R = bl(), R.c(), R.m(e, null)) : R && (R.d(1), R = null);
    },
    i($) {
      m || (b(i.$$.fragment, $), b(r.$$.fragment, $), b(y), m = true);
    },
    o($) {
      M(i.$$.fragment, $), M(r.$$.fragment, $), M(y), m = false;
    },
    d($) {
      $ && w(e), g && g.d(), F(i), F(r), v && v.d(), y && y.d(), R && R.d();
    }
  };
}
function Us(n, e, t) {
  let { viewModel: l } = e, { align: i = "center" } = e;
  return n.$$set = (s) => {
    "viewModel" in s && t(0, l = s.viewModel), "align" in s && t(1, i = s.align);
  }, [l, i];
}
var Xs = class extends re {
  constructor(e) {
    super(), oe(this, e, Us, Os, te, { viewModel: 0, align: 1 }, Ys);
  }
};
function Zs(n) {
  ce(n, "svelte-u2txzu", ".compare-detail-container.svelte-u2txzu{display:flex;flex-direction:column;flex:1}.header-container.svelte-u2txzu{display:flex;flex-direction:column;width:calc(100vw - 2rem);margin:0 -1rem;padding:0 2rem;box-shadow:0 1rem 0.5rem -0.5rem rgba(0, 0, 0, 0.5);z-index:1}.title-and-links.svelte-u2txzu{display:flex;flex-direction:row;align-items:center;height:4.5rem}.spacer-flex.svelte-u2txzu{flex:1}.nav-links.svelte-u2txzu{display:flex;flex-direction:row;font-size:0.8em}.nav-link-sep.svelte-u2txzu{color:#444}.nav-link.svelte-u2txzu{cursor:pointer;color:#777}.title-container.svelte-u2txzu{display:flex;flex-direction:column}.pretitle.svelte-u2txzu{margin-bottom:0.2rem;font-size:0.9em;font-weight:700;color:#aaa}.title-and-subtitle.svelte-u2txzu{display:flex;flex-direction:row;align-items:baseline}.title.svelte-u2txzu{margin-bottom:0.4rem;font-size:2em;font-weight:700;cursor:pointer}.subtitle.svelte-u2txzu{font-size:1.2em;font-weight:700;margin-left:1.2rem;color:#aaa}.annotations.svelte-u2txzu{margin-left:0.3rem;color:#aaa}.annotations.svelte-u2txzu .annotation{margin:0 0.3rem;padding:0.1rem 0.3rem;background-color:#222;border:0.5px solid #555;border-radius:0.4rem}.related.svelte-u2txzu{font-size:1em;color:#aaa;margin-bottom:0.6rem}ul.svelte-u2txzu{margin:0.1rem 0;padding-left:2rem}.related.svelte-u2txzu .related-sep{color:#666}.scroll-container.svelte-u2txzu{display:flex;flex-direction:row;max-width:100vw;flex:1 0 1px;overflow:auto;outline:none;background-color:#3c3c3c}.scroll-content.svelte-u2txzu{position:relative;margin-bottom:2rem}.section-title.svelte-u2txzu{width:calc(100vw - 2rem);margin:1.5rem 1rem 2rem 1rem;padding:0.2rem 0;border-bottom:solid 1px #555;color:#ccc;font-size:1.4em;font-weight:700}.section-title.svelte-u2txzu:not(:first-child){margin-top:5rem}.row-container.svelte-u2txzu{display:flex;flex-direction:row;margin-top:0.5rem;margin-bottom:3rem;margin-left:1rem;margin-right:1rem}.row-container.svelte-u2txzu:first-child{margin-top:3rem}");
}
function wl(n, e, t) {
  const l = n.slice();
  return l[22] = e[t], l;
}
function kl(n, e, t) {
  const l = n.slice();
  return l[22] = e[t], l;
}
function yl(n, e, t) {
  const l = n.slice();
  return l[27] = e[t], l;
}
function Ml(n, e, t) {
  const l = n.slice();
  return l[30] = e[t], l;
}
function $l(n, e, t) {
  const l = n.slice();
  return l[33] = e[t], l;
}
function Rl(n) {
  let e, t = (
    /*viewModel*/
    n[0].pretitle + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "pretitle svelte-u2txzu");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i[0] & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      l[0].pretitle + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function Sl(n) {
  let e, t = (
    /*viewModel*/
    n[0].subtitle + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "subtitle svelte-u2txzu");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i[0] & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      l[0].subtitle + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function zl(n) {
  let e, t = (
    /*viewModel*/
    n[0].annotations + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "annotations svelte-u2txzu");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i[0] & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      l[0].annotations + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function Cl(n) {
  let e, t, l = (
    /*viewModel*/
    n[0].relatedListHeader + ""
  ), i, s, r = B(
    /*viewModel*/
    n[0].relatedItems
  ), o = [];
  for (let a = 0; a < r.length; a += 1)
    o[a] = Il($l(n, r, a));
  return {
    c() {
      e = p("div"), t = p("span"), i = P(l), s = p("ul");
      for (let a = 0; a < o.length; a += 1)
        o[a].c();
      h(s, "class", "svelte-u2txzu"), h(e, "class", "related svelte-u2txzu");
    },
    m(a, c) {
      k(a, e, c), _(e, t), _(t, i), _(e, s);
      for (let f = 0; f < o.length; f += 1)
        o[f] && o[f].m(s, null);
    },
    p(a, c) {
      if (c[0] & /*viewModel*/
      1 && l !== (l = /*viewModel*/
      a[0].relatedListHeader + "") && W(i, l), c[0] & /*viewModel*/
      1) {
        r = B(
          /*viewModel*/
          a[0].relatedItems
        );
        let f;
        for (f = 0; f < r.length; f += 1) {
          const u = $l(a, r, f);
          o[f] ? o[f].p(u, c) : (o[f] = Il(u), o[f].c(), o[f].m(s, null));
        }
        for (; f < o.length; f += 1)
          o[f].d(1);
        o.length = r.length;
      }
    },
    d(a) {
      a && w(e), se(o, a);
    }
  };
}
function Il(n) {
  let e, t = (
    /*relatedItem*/
    n[33] + ""
  );
  return {
    c() {
      e = p("li"), h(e, "class", "related-item");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i[0] & /*viewModel*/
      1 && t !== (t = /*relatedItem*/
      l[33] + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function Tl(n) {
  let e, t, l, i = B(
    /*viewModel*/
    n[0].graphSections
  ), s = [];
  for (let a = 0; a < i.length; a += 1)
    s[a] = Ll(yl(n, i, a));
  const r = (a) => M(s[a], 1, 1, () => {
    s[a] = null;
  });
  let o = (
    /*$pinnedDetailRows*/
    n[8].length === 0 && Vl(n)
  );
  return {
    c() {
      for (let a = 0; a < s.length; a += 1)
        s[a].c();
      e = ee(), o && o.c(), t = ee();
    },
    m(a, c) {
      for (let f = 0; f < s.length; f += 1)
        s[f] && s[f].m(a, c);
      k(a, e, c), o && o.m(a, c), k(a, t, c), l = true;
    },
    p(a, c) {
      if (c[0] & /*viewModel*/
      1) {
        i = B(
          /*viewModel*/
          a[0].graphSections
        );
        let f;
        for (f = 0; f < i.length; f += 1) {
          const u = yl(a, i, f);
          s[f] ? (s[f].p(u, c), b(s[f], 1)) : (s[f] = Ll(u), s[f].c(), b(s[f], 1), s[f].m(e.parentNode, e));
        }
        for (U(), f = i.length; f < s.length; f += 1)
          r(f);
        X();
      }
      a[8].length === 0 ? o ? o.p(a, c) : (o = Vl(a), o.c(), o.m(t.parentNode, t)) : o && (o.d(1), o = null);
    },
    i(a) {
      if (!l) {
        for (let c = 0; c < i.length; c += 1)
          b(s[c]);
        l = true;
      }
    },
    o(a) {
      s = s.filter(Boolean);
      for (let c = 0; c < s.length; c += 1)
        M(s[c]);
      l = false;
    },
    d(a) {
      a && (w(e), w(t)), se(s, a), o && o.d(a);
    }
  };
}
function Dl(n) {
  let e, t;
  return e = new Xs({
    props: {
      viewModel: (
        /*graphsRowViewModel*/
        n[30]
      ),
      align: "left"
    }
  }), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i[0] & /*viewModel*/
      1 && (s.viewModel = /*graphsRowViewModel*/
      l[30]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function jl(n) {
  let e, t = (
    /*graphsRowViewModel*/
    n[30]
  ), l, i = Dl(n);
  return {
    c() {
      e = p("div"), i.c(), h(e, "class", "row-container svelte-u2txzu");
    },
    m(s, r) {
      k(s, e, r), i.m(e, null), l = true;
    },
    p(s, r) {
      r[0] & /*viewModel*/
      1 && te(t, t = /*graphsRowViewModel*/
      s[30]) ? (U(), M(i, 1, 1, K), X(), i = Dl(s), i.c(), b(i, 1), i.m(e, null)) : i.p(s, r);
    },
    i(s) {
      l || (b(i), l = true);
    },
    o(s) {
      M(i), l = false;
    },
    d(s) {
      s && w(e), i.d(s);
    }
  };
}
function Ll(n) {
  let e, t = (
    /*graphsSectionViewModel*/
    n[27].title + ""
  ), l, i, s, r = B(
    /*graphsSectionViewModel*/
    n[27].rows
  ), o = [];
  for (let c = 0; c < r.length; c += 1)
    o[c] = jl(Ml(n, r, c));
  const a = (c) => M(o[c], 1, 1, () => {
    o[c] = null;
  });
  return {
    c() {
      e = p("div"), l = P(t);
      for (let c = 0; c < o.length; c += 1)
        o[c].c();
      i = ee(), h(e, "class", "section-title svelte-u2txzu");
    },
    m(c, f) {
      k(c, e, f), _(e, l);
      for (let u = 0; u < o.length; u += 1)
        o[u] && o[u].m(c, f);
      k(c, i, f), s = true;
    },
    p(c, f) {
      if ((!s || f[0] & /*viewModel*/
      1) && t !== (t = /*graphsSectionViewModel*/
      c[27].title + "") && W(l, t), f[0] & /*viewModel*/
      1) {
        r = B(
          /*graphsSectionViewModel*/
          c[27].rows
        );
        let u;
        for (u = 0; u < r.length; u += 1) {
          const d = Ml(c, r, u);
          o[u] ? (o[u].p(d, f), b(o[u], 1)) : (o[u] = jl(d), o[u].c(), b(o[u], 1), o[u].m(i.parentNode, i));
        }
        for (U(), u = r.length; u < o.length; u += 1)
          a(u);
        X();
      }
    },
    i(c) {
      if (!s) {
        for (let f = 0; f < r.length; f += 1)
          b(o[f]);
        s = true;
      }
    },
    o(c) {
      o = o.filter(Boolean);
      for (let f = 0; f < o.length; f += 1)
        M(o[f]);
      s = false;
    },
    d(c) {
      c && (w(e), w(i)), se(o, c);
    }
  };
}
function Vl(n) {
  let e, t, l;
  return {
    c() {
      e = p("div"), t = P("All "), l = P(
        /*itemKindPlural*/
        n[2]
      ), h(e, "class", "section-title svelte-u2txzu");
    },
    m(i, s) {
      k(i, e, s), _(e, t), _(e, l);
    },
    p(i, s) {
      s[0] & /*itemKindPlural*/
      4 && W(
        l,
        /*itemKindPlural*/
        i[2]
      );
    },
    d(i) {
      i && w(e);
    }
  };
}
function xl(n) {
  let e, t, l, i, s, r = B(
    /*$pinnedDetailRows*/
    n[8]
  ), o = [];
  for (let c = 0; c < r.length; c += 1)
    o[c] = Nl(kl(n, r, c));
  const a = (c) => M(o[c], 1, 1, () => {
    o[c] = null;
  });
  return {
    c() {
      e = p("div"), t = P("Pinned "), l = P(
        /*itemKindPlural*/
        n[2]
      );
      for (let c = 0; c < o.length; c += 1)
        o[c].c();
      i = ee(), h(e, "class", "section-title svelte-u2txzu");
    },
    m(c, f) {
      k(c, e, f), _(e, t), _(e, l);
      for (let u = 0; u < o.length; u += 1)
        o[u] && o[u].m(c, f);
      k(c, i, f), s = true;
    },
    p(c, f) {
      if ((!s || f[0] & /*itemKindPlural*/
      4) && W(
        l,
        /*itemKindPlural*/
        c[2]
      ), f[0] & /*$pinnedDetailRows, onShowContextMenu*/
      1280) {
        r = B(
          /*$pinnedDetailRows*/
          c[8]
        );
        let u;
        for (u = 0; u < r.length; u += 1) {
          const d = kl(c, r, u);
          o[u] ? (o[u].p(d, f), b(o[u], 1)) : (o[u] = Nl(d), o[u].c(), b(o[u], 1), o[u].m(i.parentNode, i));
        }
        for (U(), u = r.length; u < o.length; u += 1)
          a(u);
        X();
      }
    },
    i(c) {
      if (!s) {
        for (let f = 0; f < r.length; f += 1)
          b(o[f]);
        s = true;
      }
    },
    o(c) {
      o = o.filter(Boolean);
      for (let f = 0; f < o.length; f += 1)
        M(o[f]);
      s = false;
    },
    d(c) {
      c && (w(e), w(i)), se(o, c);
    }
  };
}
function Nl(n) {
  let e, t, l;
  return t = new Qn({
    props: {
      viewModel: (
        /*detailRowViewModel*/
        n[22]
      )
    }
  }), t.$on(
    "show-context-menu",
    /*onShowContextMenu*/
    n[10]
  ), {
    c() {
      e = p("div"), A(t.$$.fragment), h(e, "class", "row-container svelte-u2txzu");
    },
    m(i, s) {
      k(i, e, s), E(t, e, null), l = true;
    },
    p(i, s) {
      const r = {};
      s[0] & /*$pinnedDetailRows*/
      256 && (r.viewModel = /*detailRowViewModel*/
      i[22]), t.$set(r);
    },
    i(i) {
      l || (b(t.$$.fragment, i), l = true);
    },
    o(i) {
      M(t.$$.fragment, i), l = false;
    },
    d(i) {
      i && w(e), F(t);
    }
  };
}
function Pl(n) {
  let e, t, l;
  return {
    c() {
      e = p("div"), t = P("All "), l = P(
        /*itemKindPlural*/
        n[2]
      ), h(e, "class", "section-title svelte-u2txzu");
    },
    m(i, s) {
      k(i, e, s), _(e, t), _(e, l);
    },
    p(i, s) {
      s[0] & /*itemKindPlural*/
      4 && W(
        l,
        /*itemKindPlural*/
        i[2]
      );
    },
    d(i) {
      i && w(e);
    }
  };
}
function ql(n) {
  let e, t, l;
  return t = new Qn({
    props: {
      viewModel: (
        /*detailRowViewModel*/
        n[22]
      )
    }
  }), t.$on(
    "show-context-menu",
    /*onShowContextMenu*/
    n[10]
  ), {
    c() {
      e = p("div"), A(t.$$.fragment), h(e, "class", "row-container svelte-u2txzu");
    },
    m(i, s) {
      k(i, e, s), E(t, e, null), l = true;
    },
    p(i, s) {
      const r = {};
      s[0] & /*viewModel*/
      1 && (r.viewModel = /*detailRowViewModel*/
      i[22]), t.$set(r);
    },
    i(i) {
      l || (b(t.$$.fragment, i), l = true);
    },
    o(i) {
      M(t.$$.fragment, i), l = false;
    },
    d(i) {
      i && w(e), F(t);
    }
  };
}
function Js(n) {
  let e, t, l, i, s, r, o = (
    /*viewModel*/
    n[0].title + ""
  ), a, c, f, u, d, m, g, v, y, R, $, C, I, D, V, q, S = (
    /*viewModel*/
    n[0].pretitle && Rl(n)
  ), j = (
    /*viewModel*/
    n[0].subtitle && Sl(n)
  ), x = (
    /*viewModel*/
    n[0].annotations && zl(n)
  ), T = (
    /*relatedItemsVisible*/
    n[7] && /*viewModel*/
    n[0].relatedItems.length > 0 && Cl(n)
  ), z = (
    /*viewModel*/
    n[0].graphSections.length > 0 && Tl(n)
  ), N = (
    /*$pinnedDetailRows*/
    n[8].length > 0 && xl(n)
  ), H = (
    /*$pinnedDetailRows*/
    n[8].length > 0 && Pl(n)
  ), G = B(
    /*viewModel*/
    n[0].regularDetailRows
  ), Y = [];
  for (let L = 0; L < G.length; L += 1)
    Y[L] = ql(wl(n, G, L));
  const J = (L) => M(Y[L], 1, 1, () => {
    Y[L] = null;
  });
  return I = new Zi({
    props: {
      items: (
        /*contextMenuItems*/
        n[5]
      ),
      parentElem: (
        /*scrollContent*/
        n[4]
      ),
      initialEvent: (
        /*contextMenuEvent*/
        n[6]
      )
    }
  }), I.$on(
    "item-selected",
    /*onContextMenuItemSelected*/
    n[12]
  ), I.$on(
    "clickout",
    /*onHideContextMenu*/
    n[11]
  ), {
    c() {
      e = p("div"), t = p("div"), l = p("div"), i = p("div"), S && S.c(), s = p("div"), r = p("div"), j && j.c(), a = ee(), x && x.c(), c = p("div"), f = p("div"), u = p("div"), u.textContent = "previous", d = p("div"), d.textContent = " | ", m = p("div"), m.textContent = "next", T && T.c(), g = p("div"), v = p("div"), z && z.c(), y = ee(), N && N.c(), R = ee(), H && H.c(), $ = ee();
      for (let L = 0; L < Y.length; L += 1)
        Y[L].c();
      C = ee(), A(I.$$.fragment), h(r, "class", "title svelte-u2txzu"), h(s, "class", "title-and-subtitle svelte-u2txzu"), h(i, "class", "title-container svelte-u2txzu"), h(c, "class", "spacer-flex svelte-u2txzu"), h(u, "class", "nav-link svelte-u2txzu"), h(d, "class", "nav-link-sep svelte-u2txzu"), h(m, "class", "nav-link svelte-u2txzu"), h(f, "class", "nav-links no-selection svelte-u2txzu"), h(l, "class", "title-and-links svelte-u2txzu"), h(t, "class", "header-container svelte-u2txzu"), h(v, "class", "scroll-content svelte-u2txzu"), h(g, "class", "scroll-container svelte-u2txzu"), h(g, "tabindex", "0"), h(e, "class", "compare-detail-container svelte-u2txzu");
    },
    m(L, O) {
      k(L, e, O), _(e, t), _(t, l), _(l, i), S && S.m(i, null), _(i, s), _(s, r), r.innerHTML = o, j && j.m(s, null), _(s, a), x && x.m(s, null), _(l, c), _(l, f), _(f, u), _(f, d), _(f, m), T && T.m(t, null), _(e, g), _(g, v), z && z.m(v, null), _(v, y), N && N.m(v, null), _(v, R), H && H.m(v, null), _(v, $);
      for (let Z = 0; Z < Y.length; Z += 1)
        Y[Z] && Y[Z].m(v, null);
      _(v, C), E(I, v, null), n[18](v), n[19](g), D = true, V || (q = [
        ne(
          window,
          "keydown",
          /*onKeyDown*/
          n[13]
        ),
        ne(
          r,
          "click",
          /*toggleRelatedItems*/
          n[14]
        ),
        ne(
          u,
          "click",
          /*click_handler*/
          n[16]
        ),
        ne(
          m,
          "click",
          /*click_handler_1*/
          n[17]
        )
      ], V = true);
    },
    p(L, O) {
      if (
        /*viewModel*/
        L[0].pretitle ? S ? S.p(L, O) : (S = Rl(L), S.c(), S.m(i, s)) : S && (S.d(1), S = null), (!D || O[0] & /*viewModel*/
        1) && o !== (o = /*viewModel*/
        L[0].title + "") && (r.innerHTML = o), /*viewModel*/
        L[0].subtitle ? j ? j.p(L, O) : (j = Sl(L), j.c(), j.m(s, a)) : j && (j.d(1), j = null), /*viewModel*/
        L[0].annotations ? x ? x.p(L, O) : (x = zl(L), x.c(), x.m(s, null)) : x && (x.d(1), x = null), /*relatedItemsVisible*/
        L[7] && /*viewModel*/
        L[0].relatedItems.length > 0 ? T ? T.p(L, O) : (T = Cl(L), T.c(), T.m(t, null)) : T && (T.d(1), T = null), /*viewModel*/
        L[0].graphSections.length > 0 ? z ? (z.p(L, O), O[0] & /*viewModel*/
        1 && b(z, 1)) : (z = Tl(L), z.c(), b(z, 1), z.m(v, y)) : z && (U(), M(z, 1, 1, () => {
          z = null;
        }), X()), /*$pinnedDetailRows*/
        L[8].length > 0 ? N ? (N.p(L, O), O[0] & /*$pinnedDetailRows*/
        256 && b(N, 1)) : (N = xl(L), N.c(), b(N, 1), N.m(v, R)) : N && (U(), M(N, 1, 1, () => {
          N = null;
        }), X()), /*$pinnedDetailRows*/
        L[8].length > 0 ? H ? H.p(L, O) : (H = Pl(L), H.c(), H.m(v, $)) : H && (H.d(1), H = null), O[0] & /*viewModel, onShowContextMenu*/
        1025
      ) {
        G = B(
          /*viewModel*/
          L[0].regularDetailRows
        );
        let Q;
        for (Q = 0; Q < G.length; Q += 1) {
          const ae = wl(L, G, Q);
          Y[Q] ? (Y[Q].p(ae, O), b(Y[Q], 1)) : (Y[Q] = ql(ae), Y[Q].c(), b(Y[Q], 1), Y[Q].m(v, C));
        }
        for (U(), Q = G.length; Q < Y.length; Q += 1)
          J(Q);
        X();
      }
      const Z = {};
      O[0] & /*contextMenuItems*/
      32 && (Z.items = /*contextMenuItems*/
      L[5]), O[0] & /*scrollContent*/
      16 && (Z.parentElem = /*scrollContent*/
      L[4]), O[0] & /*contextMenuEvent*/
      64 && (Z.initialEvent = /*contextMenuEvent*/
      L[6]), I.$set(Z);
    },
    i(L) {
      if (!D) {
        b(z), b(N);
        for (let O = 0; O < G.length; O += 1)
          b(Y[O]);
        b(I.$$.fragment, L), D = true;
      }
    },
    o(L) {
      M(z), M(N), Y = Y.filter(Boolean);
      for (let O = 0; O < Y.length; O += 1)
        M(Y[O]);
      M(I.$$.fragment, L), D = false;
    },
    d(L) {
      L && w(e), S && S.d(), j && j.d(), x && x.d(), T && T.d(), z && z.d(), N && N.d(), H && H.d(), se(Y, L), F(I), n[18](null), n[19](null), V = false, we(q);
    }
  };
}
function Qs(n, e, t) {
  let l, i = K, s = () => (i(), i = je(c, (T) => t(8, l = T)), c);
  n.$$.on_destroy.push(() => i());
  let { viewModel: r } = e, o, a, c, f, u, d, m = [], g, v = false;
  const y = Ie();
  function R(T) {
    switch (T) {
      case "detail-previous":
      case "detail-next": {
        let z;
        switch (r.kind) {
          case "freeform-view":
          case "scenario-view":
            z = "views";
            break;
          case "scenario":
            z = "by-scenario";
            break;
          case "dataset":
            z = "by-dataset";
            break;
          default:
            (0, import_assert_never13.default)(r.kind);
        }
        y("command", {
          cmd: T === "detail-previous" ? "show-comparison-detail-for-previous" : "show-comparison-detail-for-next",
          kind: z,
          summaryRowKey: r.summaryRowKey
        });
        break;
      }
      default:
        y("command", { cmd: T });
        break;
    }
  }
  function $(T) {
    var z;
    const N = (z = T.detail) === null || z === void 0 ? void 0 : z.kind;
    switch (N) {
      case "box":
      case "row": {
        const H = T.detail.itemKey, G = Ce(r.pinnedItemState.getPinned(H)), Y = G ? "Unpin" : "Pin", J = N === "row" ? "Row" : o;
        if (d = H, t(5, m = [
          {
            key: "toggle-item-pinned",
            displayText: `${Y} ${J}`
          }
        ]), G) {
          const L = Ce(r.pinnedItemState.orderedKeys);
          L.length > 1 && L[0] !== H && m.push({
            key: "move-item-to-top",
            displayText: `Move ${J} to Top`
          });
        }
        t(6, g = T.detail.clickEvent);
        break;
      }
      default:
        d = void 0, t(5, m = []), t(6, g = void 0);
        break;
    }
  }
  function C() {
    t(6, g = void 0);
  }
  function I(T) {
    t(6, g = void 0);
    const z = d, N = T.detail;
    switch (N) {
      case "toggle-item-pinned":
        r.pinnedItemState.toggleItemPinned(z);
        break;
      case "move-item-to-top":
        r.pinnedItemState.moveItemToTop(z);
        break;
      default:
        console.error(`ERROR: Unhandled context menu command '${N}'`);
        break;
    }
  }
  function D(T) {
    T.key === "ArrowLeft" ? (R("detail-previous"), T.preventDefault()) : T.key === "ArrowRight" ? (R("detail-next"), T.preventDefault()) : T.key === "ArrowUp" && f.scrollTop === 0 && (R("show-summary"), T.preventDefault());
  }
  function V() {
    t(7, v = !v);
  }
  at(() => {
    f.focus();
  });
  const q = () => R("detail-previous"), S = () => R("detail-next");
  function j(T) {
    be[T ? "unshift" : "push"](() => {
      u = T, t(4, u);
    });
  }
  function x(T) {
    be[T ? "unshift" : "push"](() => {
      f = T, t(1, f), t(0, r), t(15, o);
    });
  }
  return n.$$set = (T) => {
    "viewModel" in T && t(0, r = T.viewModel);
  }, n.$$.update = () => {
    if (n.$$.dirty[0] & /*viewModel, itemKind, scrollContainer*/
    32771 && r) {
      switch (r.kind) {
        case "freeform-view":
          t(15, o = "Row");
          break;
        case "scenario":
        case "scenario-view":
          t(15, o = "Dataset");
          break;
        case "dataset":
          t(15, o = "Scenario");
          break;
        default:
          t(15, o = "Item");
          break;
      }
      t(2, a = `${o}s`), s(t(3, c = r.pinnedDetailRows)), f && t(1, f.scrollTop = 0, f), t(7, v = false);
    }
  }, [
    r,
    f,
    a,
    c,
    u,
    m,
    g,
    v,
    l,
    R,
    $,
    C,
    I,
    D,
    V,
    o,
    q,
    S,
    j,
    x
  ];
}
var eo = class extends re {
  constructor(e) {
    super(), oe(this, e, Qs, Js, te, { viewModel: 0 }, Zs, [-1, -1]);
  }
};
function to(n) {
  let e;
  return {
    c() {
      e = Ue("g");
    },
    m(t, l) {
      k(t, e, l), e.innerHTML = /*raw*/
      n[0];
    },
    p(t, [l]) {
      l & /*raw*/
      1 && (e.innerHTML = /*raw*/
      t[0]);
    },
    i: K,
    o: K,
    d(t) {
      t && w(e);
    }
  };
}
function lo(n, e, t) {
  let l = 870711;
  function i() {
    return l += 1, `fa-${l.toString(16)}`;
  }
  let s = "", { data: r } = e;
  function o(a) {
    if (!a || !a.raw)
      return "";
    let c = a.raw;
    const f = {};
    return c = c.replace(/\s(?:xml:)?id=["']?([^"')\s]+)/g, (u, d) => {
      const m = i();
      return f[d] = m, ` id="${m}"`;
    }), c = c.replace(/#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g, (u, d, m, g) => {
      const v = d || g;
      return !v || !f[v] ? u : `#${f[v]}`;
    }), c;
  }
  return n.$$set = (a) => {
    "data" in a && t(1, r = a.data);
  }, n.$$.update = () => {
    n.$$.dirty & /*data*/
    2 && t(0, s = o(r));
  }, [s, r];
}
var no = class extends re {
  constructor(e) {
    super(), oe(this, e, lo, to, te, { data: 1 });
  }
};
function io(n) {
  ce(n, "svelte-1mc5hvj", ".fa-icon.svelte-1mc5hvj{display:inline-block;fill:currentColor}.fa-flip-horizontal.svelte-1mc5hvj{transform:scale(-1, 1)}.fa-flip-vertical.svelte-1mc5hvj{transform:scale(1, -1)}.fa-spin.svelte-1mc5hvj{animation:svelte-1mc5hvj-fa-spin 1s 0s infinite linear}.fa-inverse.svelte-1mc5hvj{color:#fff}.fa-pulse.svelte-1mc5hvj{animation:svelte-1mc5hvj-fa-spin 1s infinite steps(8)}@keyframes svelte-1mc5hvj-fa-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}");
}
function so(n) {
  let e, t, l, i;
  const s = (
    /*#slots*/
    n[12].default
  ), r = Rt(
    s,
    n,
    /*$$scope*/
    n[11],
    null
  );
  let o = [
    { version: "1.1" },
    {
      class: t = "fa-icon " + /*className*/
      n[0]
    },
    { width: (
      /*width*/
      n[1]
    ) },
    { height: (
      /*height*/
      n[2]
    ) },
    { "aria-label": (
      /*label*/
      n[9]
    ) },
    {
      role: l = /*label*/
      n[9] ? "img" : "presentation"
    },
    { viewBox: (
      /*box*/
      n[3]
    ) },
    { style: (
      /*style*/
      n[8]
    ) },
    /*$$restProps*/
    n[10]
  ], a = {};
  for (let c = 0; c < o.length; c += 1)
    a = Re(a, o[c]);
  return {
    c() {
      e = Ue("svg"), r && r.c(), Be(e, a), de(
        e,
        "fa-spin",
        /*spin*/
        n[4]
      ), de(
        e,
        "fa-pulse",
        /*pulse*/
        n[6]
      ), de(
        e,
        "fa-inverse",
        /*inverse*/
        n[5]
      ), de(
        e,
        "fa-flip-horizontal",
        /*flip*/
        n[7] === "horizontal"
      ), de(
        e,
        "fa-flip-vertical",
        /*flip*/
        n[7] === "vertical"
      ), de(e, "svelte-1mc5hvj", true);
    },
    m(c, f) {
      k(c, e, f), r && r.m(e, null), i = true;
    },
    p(c, [f]) {
      r && r.p && (!i || f & /*$$scope*/
      2048) && zt(
        r,
        s,
        c,
        /*$$scope*/
        c[11],
        i ? St(
          s,
          /*$$scope*/
          c[11],
          f,
          null
        ) : Ct(
          /*$$scope*/
          c[11]
        ),
        null
      ), Be(e, a = ft(o, [
        { version: "1.1" },
        (!i || f & /*className*/
        1 && t !== (t = "fa-icon " + /*className*/
        c[0])) && { class: t },
        (!i || f & /*width*/
        2) && { width: (
          /*width*/
          c[1]
        ) },
        (!i || f & /*height*/
        4) && { height: (
          /*height*/
          c[2]
        ) },
        (!i || f & /*label*/
        512) && { "aria-label": (
          /*label*/
          c[9]
        ) },
        (!i || f & /*label*/
        512 && l !== (l = /*label*/
        c[9] ? "img" : "presentation")) && { role: l },
        (!i || f & /*box*/
        8) && { viewBox: (
          /*box*/
          c[3]
        ) },
        (!i || f & /*style*/
        256) && { style: (
          /*style*/
          c[8]
        ) },
        f & /*$$restProps*/
        1024 && /*$$restProps*/
        c[10]
      ])), de(
        e,
        "fa-spin",
        /*spin*/
        c[4]
      ), de(
        e,
        "fa-pulse",
        /*pulse*/
        c[6]
      ), de(
        e,
        "fa-inverse",
        /*inverse*/
        c[5]
      ), de(
        e,
        "fa-flip-horizontal",
        /*flip*/
        c[7] === "horizontal"
      ), de(
        e,
        "fa-flip-vertical",
        /*flip*/
        c[7] === "vertical"
      ), de(e, "svelte-1mc5hvj", true);
    },
    i(c) {
      i || (b(r, c), i = true);
    },
    o(c) {
      M(r, c), i = false;
    },
    d(c) {
      c && w(e), r && r.d(c);
    }
  };
}
function oo(n, e, t) {
  const l = ["class", "width", "height", "box", "spin", "inverse", "pulse", "flip", "style", "label"];
  let i = st(e, l), { $$slots: s = {}, $$scope: r } = e, { class: o = "" } = e, { width: a } = e, { height: c } = e, { box: f = "0 0 0 0" } = e, { spin: u = false } = e, { inverse: d = false } = e, { pulse: m = false } = e, { flip: g = "none" } = e, { style: v = "" } = e, { label: y = "" } = e;
  return n.$$set = (R) => {
    e = Re(Re({}, e), Yn(R)), t(10, i = st(e, l)), "class" in R && t(0, o = R.class), "width" in R && t(1, a = R.width), "height" in R && t(2, c = R.height), "box" in R && t(3, f = R.box), "spin" in R && t(4, u = R.spin), "inverse" in R && t(5, d = R.inverse), "pulse" in R && t(6, m = R.pulse), "flip" in R && t(7, g = R.flip), "style" in R && t(8, v = R.style), "label" in R && t(9, y = R.label), "$$scope" in R && t(11, r = R.$$scope);
  }, [
    o,
    a,
    c,
    f,
    u,
    d,
    m,
    g,
    v,
    y,
    i,
    r,
    s
  ];
}
var ro = class extends re {
  constructor(e) {
    super(), oe(
      this,
      e,
      oo,
      so,
      te,
      {
        class: 0,
        width: 1,
        height: 2,
        box: 3,
        spin: 4,
        inverse: 5,
        pulse: 6,
        flip: 7,
        style: 8,
        label: 9
      },
      io
    );
  }
};
function Kl(n, e, t) {
  const l = n.slice();
  return l[24] = e[t], l;
}
function Bl(n, e, t) {
  const l = n.slice();
  return l[27] = e[t], l;
}
function El(n) {
  let e, t = [
    /*path*/
    n[27]
  ], l = {};
  for (let i = 0; i < t.length; i += 1)
    l = Re(l, t[i]);
  return {
    c() {
      e = Ue("path"), Be(e, l);
    },
    m(i, s) {
      k(i, e, s);
    },
    p(i, s) {
      Be(e, l = ft(t, [s & /*iconData*/
      64 && /*path*/
      i[27]]));
    },
    d(i) {
      i && w(e);
    }
  };
}
function Fl(n) {
  let e, t = [
    /*polygon*/
    n[24]
  ], l = {};
  for (let i = 0; i < t.length; i += 1)
    l = Re(l, t[i]);
  return {
    c() {
      e = Ue("polygon"), Be(e, l);
    },
    m(i, s) {
      k(i, e, s);
    },
    p(i, s) {
      Be(e, l = ft(t, [s & /*iconData*/
      64 && /*polygon*/
      i[24]]));
    },
    d(i) {
      i && w(e);
    }
  };
}
function Hl(n) {
  let e, t, l;
  function i(r) {
    n[16](r);
  }
  let s = {};
  return (
    /*iconData*/
    n[6] !== void 0 && (s.data = /*iconData*/
    n[6]), e = new no({ props: s }), be.push(() => ut(e, "data", i)), {
      c() {
        A(e.$$.fragment);
      },
      m(r, o) {
        E(e, r, o), l = true;
      },
      p(r, o) {
        const a = {};
        !t && o & /*iconData*/
        64 && (t = true, a.data = /*iconData*/
        r[6], ct(() => t = false)), e.$set(a);
      },
      i(r) {
        l || (b(e.$$.fragment, r), l = true);
      },
      o(r) {
        M(e.$$.fragment, r), l = false;
      },
      d(r) {
        F(e, r);
      }
    }
  );
}
function ao(n) {
  var f, u, d;
  let e, t, l, i, s = B(
    /*iconData*/
    ((f = n[6]) == null ? void 0 : f.paths) || []
  ), r = [];
  for (let m = 0; m < s.length; m += 1)
    r[m] = El(Bl(n, s, m));
  let o = B(
    /*iconData*/
    ((u = n[6]) == null ? void 0 : u.polygons) || []
  ), a = [];
  for (let m = 0; m < o.length; m += 1)
    a[m] = Fl(Kl(n, o, m));
  let c = (
    /*iconData*/
    ((d = n[6]) == null ? void 0 : d.raw) && Hl(n)
  );
  return {
    c() {
      for (let m = 0; m < r.length; m += 1)
        r[m].c();
      e = Me();
      for (let m = 0; m < a.length; m += 1)
        a[m].c();
      t = Me(), c && c.c(), l = ee();
    },
    m(m, g) {
      for (let v = 0; v < r.length; v += 1)
        r[v] && r[v].m(m, g);
      k(m, e, g);
      for (let v = 0; v < a.length; v += 1)
        a[v] && a[v].m(m, g);
      k(m, t, g), c && c.m(m, g), k(m, l, g), i = true;
    },
    p(m, g) {
      var v, y, R;
      if (g & /*iconData*/
      64) {
        s = B(
          /*iconData*/
          ((v = m[6]) == null ? void 0 : v.paths) || []
        );
        let $;
        for ($ = 0; $ < s.length; $ += 1) {
          const C = Bl(m, s, $);
          r[$] ? r[$].p(C, g) : (r[$] = El(C), r[$].c(), r[$].m(e.parentNode, e));
        }
        for (; $ < r.length; $ += 1)
          r[$].d(1);
        r.length = s.length;
      }
      if (g & /*iconData*/
      64) {
        o = B(
          /*iconData*/
          ((y = m[6]) == null ? void 0 : y.polygons) || []
        );
        let $;
        for ($ = 0; $ < o.length; $ += 1) {
          const C = Kl(m, o, $);
          a[$] ? a[$].p(C, g) : (a[$] = Fl(C), a[$].c(), a[$].m(t.parentNode, t));
        }
        for (; $ < a.length; $ += 1)
          a[$].d(1);
        a.length = o.length;
      }
      (R = m[6]) != null && R.raw ? c ? (c.p(m, g), g & /*iconData*/
      64 && b(c, 1)) : (c = Hl(m), c.c(), b(c, 1), c.m(l.parentNode, l)) : c && (U(), M(c, 1, 1, () => {
        c = null;
      }), X());
    },
    i(m) {
      i || (b(c), i = true);
    },
    o(m) {
      M(c), i = false;
    },
    d(m) {
      m && (w(e), w(t), w(l)), se(r, m), se(a, m), c && c.d(m);
    }
  };
}
function co(n) {
  let e;
  const t = (
    /*#slots*/
    n[15].default
  ), l = Rt(
    t,
    n,
    /*$$scope*/
    n[17],
    null
  ), i = l || ao(n);
  return {
    c() {
      i && i.c();
    },
    m(s, r) {
      i && i.m(s, r), e = true;
    },
    p(s, r) {
      l ? l.p && (!e || r & /*$$scope*/
      131072) && zt(
        l,
        t,
        s,
        /*$$scope*/
        s[17],
        e ? St(
          t,
          /*$$scope*/
          s[17],
          r,
          null
        ) : Ct(
          /*$$scope*/
          s[17]
        ),
        null
      ) : i && i.p && (!e || r & /*iconData*/
      64) && i.p(s, e ? r : -1);
    },
    i(s) {
      e || (b(i, s), e = true);
    },
    o(s) {
      M(i, s), e = false;
    },
    d(s) {
      i && i.d(s);
    }
  };
}
function fo(n) {
  let e, t;
  const l = [
    { label: (
      /*label*/
      n[5]
    ) },
    { width: (
      /*width*/
      n[7]
    ) },
    { height: (
      /*height*/
      n[8]
    ) },
    { box: (
      /*box*/
      n[10]
    ) },
    { style: (
      /*combinedStyle*/
      n[9]
    ) },
    { spin: (
      /*spin*/
      n[1]
    ) },
    { flip: (
      /*flip*/
      n[4]
    ) },
    { inverse: (
      /*inverse*/
      n[2]
    ) },
    { pulse: (
      /*pulse*/
      n[3]
    ) },
    { class: (
      /*className*/
      n[0]
    ) },
    /*$$restProps*/
    n[11]
  ];
  let i = {
    $$slots: { default: [co] },
    $$scope: { ctx: n }
  };
  for (let s = 0; s < l.length; s += 1)
    i = Re(i, l[s]);
  return e = new ro({ props: i }), {
    c() {
      A(e.$$.fragment);
    },
    m(s, r) {
      E(e, s, r), t = true;
    },
    p(s, [r]) {
      const o = r & /*label, width, height, box, combinedStyle, spin, flip, inverse, pulse, className, $$restProps*/
      4031 ? ft(l, [
        r & /*label*/
        32 && { label: (
          /*label*/
          s[5]
        ) },
        r & /*width*/
        128 && { width: (
          /*width*/
          s[7]
        ) },
        r & /*height*/
        256 && { height: (
          /*height*/
          s[8]
        ) },
        r & /*box*/
        1024 && { box: (
          /*box*/
          s[10]
        ) },
        r & /*combinedStyle*/
        512 && { style: (
          /*combinedStyle*/
          s[9]
        ) },
        r & /*spin*/
        2 && { spin: (
          /*spin*/
          s[1]
        ) },
        r & /*flip*/
        16 && { flip: (
          /*flip*/
          s[4]
        ) },
        r & /*inverse*/
        4 && { inverse: (
          /*inverse*/
          s[2]
        ) },
        r & /*pulse*/
        8 && { pulse: (
          /*pulse*/
          s[3]
        ) },
        r & /*className*/
        1 && { class: (
          /*className*/
          s[0]
        ) },
        r & /*$$restProps*/
        2048 && Ei(
          /*$$restProps*/
          s[11]
        )
      ]) : {};
      r & /*$$scope, iconData*/
      131136 && (o.$$scope = { dirty: r, ctx: s }), e.$set(o);
    },
    i(s) {
      t || (b(e.$$.fragment, s), t = true);
    },
    o(s) {
      M(e.$$.fragment, s), t = false;
    },
    d(s) {
      F(e, s);
    }
  };
}
var Al = 1;
function uo(n) {
  let e, t;
  if (n)
    if ("definition" in n) {
      console.error("`import faIconName from '@fortawesome/package-name/faIconName` not supported - Please use `import { faIconName } from '@fortawesome/package-name/faIconName'` instead");
      return;
    } else if ("iconName" in n && "icon" in n) {
      e = n.iconName;
      const [l, i, , , s] = n.icon, r = Array.isArray(s) ? s : [s];
      t = {
        width: l,
        height: i,
        paths: r.map((o) => ({ d: o }))
      };
    } else
      e = Object.keys(n)[0], t = n[e];
  else return;
  return t;
}
function mo(n, e, t) {
  const l = ["class", "data", "scale", "spin", "inverse", "pulse", "flip", "label", "style"];
  let i = st(e, l), { $$slots: s = {}, $$scope: r } = e, { class: o = "" } = e, { data: a } = e, c, { scale: f = 1 } = e, { spin: u = false } = e, { inverse: d = false } = e, { pulse: m = false } = e, { flip: g = void 0 } = e, { label: v = "" } = e, { style: y = "" } = e, R = 10, $ = 10, C, I;
  function D() {
    let z = 1;
    return typeof f < "u" && (z = Number(f)), isNaN(z) || z <= 0 ? (console.warn('Invalid prop: prop "scale" should be a number over 0.'), Al) : z * Al;
  }
  function V() {
    return c ? `0 0 ${c.width} ${c.height}` : `0 0 ${R} ${$}`;
  }
  function q() {
    return c ? Math.max(c.width, c.height) / 16 : 1;
  }
  function S() {
    return c ? c.width / q() * D() : 0;
  }
  function j() {
    return c ? c.height / q() * D() : 0;
  }
  function x() {
    let z = "";
    y !== null && (z += y);
    let N = D();
    return N === 1 ? z.length === 0 ? "" : z : (z !== "" && !z.endsWith(";") && (z += "; "), `${z}font-size: ${N}em`);
  }
  function T(z) {
    c = z, t(6, c), t(12, a), t(14, y), t(13, f);
  }
  return n.$$set = (z) => {
    e = Re(Re({}, e), Yn(z)), t(11, i = st(e, l)), "class" in z && t(0, o = z.class), "data" in z && t(12, a = z.data), "scale" in z && t(13, f = z.scale), "spin" in z && t(1, u = z.spin), "inverse" in z && t(2, d = z.inverse), "pulse" in z && t(3, m = z.pulse), "flip" in z && t(4, g = z.flip), "label" in z && t(5, v = z.label), "style" in z && t(14, y = z.style), "$$scope" in z && t(17, r = z.$$scope);
  }, n.$$.update = () => {
    n.$$.dirty & /*data, style, scale*/
    28672 && (t(6, c = uo(a)), t(7, R = S()), t(8, $ = j()), t(9, C = x()), t(10, I = V()));
  }, [
    o,
    u,
    d,
    m,
    g,
    v,
    c,
    R,
    $,
    C,
    I,
    i,
    a,
    f,
    y,
    s,
    T,
    r
  ];
}
var ei = class extends re {
  constructor(e) {
    super(), oe(this, e, mo, fo, te, {
      class: 0,
      data: 12,
      scale: 13,
      spin: 1,
      inverse: 2,
      pulse: 3,
      flip: 4,
      label: 5,
      style: 14
    });
  }
};
function ho(n) {
  ce(n, "svelte-1tdmciz", `.header-container.svelte-1tdmciz{display:flex;flex-direction:column;box-sizing:border-box;width:100vw;padding:0 1rem;color:#aaa}.header-content.svelte-1tdmciz{display:flex;flex-direction:row;margin:0.4rem 0}.header-group.svelte-1tdmciz{display:flex;flex-direction:row;align-items:center}.spacer-flex.svelte-1tdmciz{flex:1}.spacer-fixed.svelte-1tdmciz{width:2rem}.icon-button.svelte-1tdmciz{color:#bbb;cursor:pointer}.icon-button.svelte-1tdmciz:hover{color:#fff}.label.svelte-1tdmciz:not(:last-child){margin-right:1rem}select.svelte-1tdmciz{margin-right:1rem;font-family:Roboto, sans-serif;font-size:1em;-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:0.2rem 1.6rem 0.2rem 0.4rem;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23555'><polygon points='0,0 100,0 50,60'/></svg>") no-repeat;background-size:0.8rem;background-position:calc(100% - 0.4rem) 70%;background-repeat:no-repeat;background-color:#353535;border:none;border-radius:0.4rem}.header-controls.svelte-1tdmciz{display:flex;flex-direction:row;margin:0.4rem 0;align-items:center}input[type=range].svelte-1tdmciz{width:10rem;margin:0 0.4rem}.line.svelte-1tdmciz{min-height:1px;margin-bottom:1rem;background-color:#555}`);
}
function Gl(n, e, t) {
  const l = n.slice();
  return l[21] = e[t], l;
}
function Wl(n, e, t) {
  const l = n.slice();
  return l[21] = e[t], l;
}
function po(n) {
  let e, t, l, i, s;
  return {
    c() {
      e = p("div"), t = p("input"), l = p("label"), l.textContent = "Simplify Scenarios", h(t, "class", "checkbox"), h(t, "type", "checkbox"), h(t, "name", "simplify-toggle"), h(l, "for", "simplify-toggle"), h(e, "class", "header-group svelte-1tdmciz");
    },
    m(r, o) {
      k(r, e, o), _(e, t), t.checked = /*$simplifyScenarios*/
      n[1], _(e, l), i || (s = ne(
        t,
        "change",
        /*input_change_handler*/
        n[17]
      ), i = true);
    },
    p(r, o) {
      o & /*$simplifyScenarios*/
      2 && (t.checked = /*$simplifyScenarios*/
      r[1]);
    },
    d(r) {
      r && w(e), i = false, s();
    }
  };
}
function Yl(n) {
  let e, t, l, i, s, r, o, a, c = (
    /*thresholds*/
    n[8][0] + ""
  ), f, u = (
    /*thresholds*/
    n[8][1] + ""
  ), d, m = (
    /*thresholds*/
    n[8][2] + ""
  ), g, v = (
    /*thresholds*/
    n[8][3] + ""
  ), y, R = (
    /*thresholds*/
    n[8][4] + ""
  ), $, C, I, D, V, q, S;
  function j(G, Y) {
    return (
      /*$bundleNamesL*/
      G[2].length > 1 ? go : vo
    );
  }
  let x = j(n), T = x(n);
  function z(G, Y) {
    return (
      /*$bundleNamesR*/
      G[3].length > 1 ? bo : _o
    );
  }
  let N = z(n), H = N(n);
  return D = new ei({ props: { class: "icon", data: faCog } }), {
    c() {
      e = p("div"), t = p("div"), l = p("div"), l.textContent = "Comparing:", T.c(), i = ee(), H.c(), s = p("div"), r = p("div"), o = p("div"), o.textContent = "Thresholds:", a = p("div"), f = p("div"), d = p("div"), g = p("div"), y = p("div"), $ = p("div"), C = p("div"), I = p("div"), A(D.$$.fragment), h(e, "class", "spacer-fixed svelte-1tdmciz"), h(l, "class", "label svelte-1tdmciz"), h(t, "class", "header-group svelte-1tdmciz"), h(s, "class", "spacer-fixed svelte-1tdmciz"), h(o, "class", "label svelte-1tdmciz"), h(a, "class", "label bucket-color-0 svelte-1tdmciz"), h(f, "class", "label bucket-color-1 svelte-1tdmciz"), h(d, "class", "label bucket-color-2 svelte-1tdmciz"), h(g, "class", "label bucket-color-3 svelte-1tdmciz"), h(y, "class", "label bucket-color-4 svelte-1tdmciz"), h(r, "class", "header-group svelte-1tdmciz"), h($, "class", "spacer-fixed svelte-1tdmciz"), h(I, "class", "icon-button controls svelte-1tdmciz"), h(C, "class", "header-group svelte-1tdmciz");
    },
    m(G, Y) {
      k(G, e, Y), k(G, t, Y), _(t, l), T.m(t, null), _(t, i), H.m(t, null), k(G, s, Y), k(G, r, Y), _(r, o), _(r, a), a.innerHTML = c, _(r, f), f.innerHTML = u, _(r, d), d.innerHTML = m, _(r, g), g.innerHTML = v, _(r, y), y.innerHTML = R, k(G, $, Y), k(G, C, Y), _(C, I), E(D, I, null), V = true, q || (S = ne(
        I,
        "click",
        /*onToggleControls*/
        n[15]
      ), q = true);
    },
    p(G, Y) {
      x === (x = j(G)) && T ? T.p(G, Y) : (T.d(1), T = x(G), T && (T.c(), T.m(t, i))), N === (N = z(G)) && H ? H.p(G, Y) : (H.d(1), H = N(G), H && (H.c(), H.m(t, null)));
    },
    i(G) {
      V || (b(D.$$.fragment, G), V = true);
    },
    o(G) {
      M(D.$$.fragment, G), V = false;
    },
    d(G) {
      G && (w(e), w(t), w(s), w(r), w($), w(C)), T.d(), H.d(), F(D), q = false, S();
    }
  };
}
function vo(n) {
  let e, t = (
    /*viewModel*/
    n[0].nameL + ""
  ), l;
  return {
    c() {
      e = p("div"), l = P(t), h(e, "class", "label dataset-color-0 svelte-1tdmciz");
    },
    m(i, s) {
      k(i, e, s), _(e, l);
    },
    p(i, s) {
      s & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      i[0].nameL + "") && W(l, t);
    },
    d(i) {
      i && w(e);
    }
  };
}
function go(n) {
  let e, t, l, i = B(
    /*$bundleNamesL*/
    n[2]
  ), s = [];
  for (let r = 0; r < i.length; r += 1)
    s[r] = Ol(Wl(n, i, r));
  return {
    c() {
      e = p("select");
      for (let r = 0; r < s.length; r += 1)
        s[r].c();
      h(e, "class", "selector dataset-color-0 svelte-1tdmciz");
    },
    m(r, o) {
      k(r, e, o);
      for (let a = 0; a < s.length; a += 1)
        s[a] && s[a].m(e, null);
      t || (l = ne(e, "change", ko), t = true);
    },
    p(r, o) {
      if (o & /*$bundleNamesL, viewModel*/
      5) {
        i = B(
          /*$bundleNamesL*/
          r[2]
        );
        let a;
        for (a = 0; a < i.length; a += 1) {
          const c = Wl(r, i, a);
          s[a] ? s[a].p(c, o) : (s[a] = Ol(c), s[a].c(), s[a].m(e, null));
        }
        for (; a < s.length; a += 1)
          s[a].d(1);
        s.length = i.length;
      }
    },
    d(r) {
      r && w(e), se(s, r), t = false, l();
    }
  };
}
function Ol(n) {
  let e, t = (
    /*name*/
    n[21] + ""
  ), l, i, s;
  return {
    c() {
      e = p("option"), l = P(t), e.selected = i = /*name*/
      n[21] === /*viewModel*/
      n[0].nameL, e.__value = s = /*name*/
      n[21], Ee(e, e.__value);
    },
    m(r, o) {
      k(r, e, o), _(e, l);
    },
    p(r, o) {
      o & /*$bundleNamesL*/
      4 && t !== (t = /*name*/
      r[21] + "") && W(l, t), o & /*$bundleNamesL, viewModel*/
      5 && i !== (i = /*name*/
      r[21] === /*viewModel*/
      r[0].nameL) && (e.selected = i), o & /*$bundleNamesL*/
      4 && s !== (s = /*name*/
      r[21]) && (e.__value = s, Ee(e, e.__value));
    },
    d(r) {
      r && w(e);
    }
  };
}
function _o(n) {
  let e, t = (
    /*viewModel*/
    n[0].nameR + ""
  ), l;
  return {
    c() {
      e = p("div"), l = P(t), h(e, "class", "label dataset-color-1 svelte-1tdmciz");
    },
    m(i, s) {
      k(i, e, s), _(e, l);
    },
    p(i, s) {
      s & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      i[0].nameR + "") && W(l, t);
    },
    d(i) {
      i && w(e);
    }
  };
}
function bo(n) {
  let e, t, l, i = B(
    /*$bundleNamesR*/
    n[3]
  ), s = [];
  for (let r = 0; r < i.length; r += 1)
    s[r] = Ul(Gl(n, i, r));
  return {
    c() {
      e = p("select");
      for (let r = 0; r < s.length; r += 1)
        s[r].c();
      h(e, "class", "selector dataset-color-1 svelte-1tdmciz");
    },
    m(r, o) {
      k(r, e, o);
      for (let a = 0; a < s.length; a += 1)
        s[a] && s[a].m(e, null);
      t || (l = ne(e, "change", yo), t = true);
    },
    p(r, o) {
      if (o & /*$bundleNamesR, viewModel*/
      9) {
        i = B(
          /*$bundleNamesR*/
          r[3]
        );
        let a;
        for (a = 0; a < i.length; a += 1) {
          const c = Gl(r, i, a);
          s[a] ? s[a].p(c, o) : (s[a] = Ul(c), s[a].c(), s[a].m(e, null));
        }
        for (; a < s.length; a += 1)
          s[a].d(1);
        s.length = i.length;
      }
    },
    d(r) {
      r && w(e), se(s, r), t = false, l();
    }
  };
}
function Ul(n) {
  let e, t = (
    /*name*/
    n[21] + ""
  ), l, i, s;
  return {
    c() {
      e = p("option"), l = P(t), e.selected = i = /*name*/
      n[21] === /*viewModel*/
      n[0].nameR, e.__value = s = /*name*/
      n[21], Ee(e, e.__value);
    },
    m(r, o) {
      k(r, e, o), _(e, l);
    },
    p(r, o) {
      o & /*$bundleNamesR*/
      8 && t !== (t = /*name*/
      r[21] + "") && W(l, t), o & /*$bundleNamesR, viewModel*/
      9 && i !== (i = /*name*/
      r[21] === /*viewModel*/
      r[0].nameR) && (e.selected = i), o & /*$bundleNamesR*/
      8 && s !== (s = /*name*/
      r[21]) && (e.__value = s, Ee(e, e.__value));
    },
    d(r) {
      r && w(e);
    }
  };
}
function Xl(n) {
  let e, t, l, i, s, r, o, a, c = `${/*$zoom*/
  n[6].toFixed(1)}x`, f, u, d;
  return {
    c() {
      e = p("div"), t = p("div"), l = p("input"), i = p("label"), i.textContent = "Consistent Y-Axis Ranges", s = p("div"), r = p("div"), r.textContent = "Graph Zoom:", o = p("input"), a = p("div"), f = P(c), h(t, "class", "spacer-flex svelte-1tdmciz"), h(l, "class", "checkbox"), h(l, "type", "checkbox"), h(l, "name", "toggle-consistent-y-range"), h(i, "for", "toggle-consistent-y-range"), h(s, "class", "spacer-fixed svelte-1tdmciz"), h(r, "class", "control-label"), h(o, "type", "range"), h(o, "min", "0.3"), h(o, "max", "2.5"), h(o, "step", "0.1"), h(o, "class", "svelte-1tdmciz"), h(a, "class", "control-label"), h(e, "class", "header-controls svelte-1tdmciz");
    },
    m(m, g) {
      k(m, e, g), _(e, t), _(e, l), l.checked = /*$consistentYRange*/
      n[5], _(e, i), _(e, s), _(e, r), _(e, o), Ee(
        o,
        /*$zoom*/
        n[6]
      ), _(e, a), _(a, f), u || (d = [
        ne(
          l,
          "change",
          /*input0_change_handler*/
          n[18]
        ),
        ne(
          o,
          "change",
          /*input1_change_input_handler*/
          n[19]
        ),
        ne(
          o,
          "input",
          /*input1_change_input_handler*/
          n[19]
        )
      ], u = true);
    },
    p(m, g) {
      g & /*$consistentYRange*/
      32 && (l.checked = /*$consistentYRange*/
      m[5]), g & /*$zoom*/
      64 && Ee(
        o,
        /*$zoom*/
        m[6]
      ), g & /*$zoom*/
      64 && c !== (c = `${/*$zoom*/
      m[6].toFixed(1)}x`) && W(f, c);
    },
    d(m) {
      m && w(e), u = false, we(d);
    }
  };
}
function wo(n) {
  let e, t, l, i, s, r, o, a, c, f, u;
  s = new ei({ props: { class: "icon", data: faHome } });
  let d = (
    /*simplifyScenarios*/
    n[7] !== void 0 && po(n)
  ), m = (
    /*viewModel*/
    (n[0].nameL || /*$bundleNamesL*/
    n[2].length > 1) && Yl(n)
  ), g = (
    /*$controlsVisible*/
    n[4] && Xl(n)
  );
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), i = p("div"), A(s.$$.fragment), r = p("div"), d && d.c(), o = ee(), m && m.c(), g && g.c(), a = p("div"), h(i, "class", "icon-button home svelte-1tdmciz"), h(l, "class", "header-group svelte-1tdmciz"), h(r, "class", "spacer-flex svelte-1tdmciz"), h(t, "class", "header-content svelte-1tdmciz"), h(a, "class", "line svelte-1tdmciz"), h(e, "class", "header-container svelte-1tdmciz");
    },
    m(v, y) {
      k(v, e, y), _(e, t), _(t, l), _(l, i), E(s, i, null), _(t, r), d && d.m(t, null), _(t, o), m && m.m(t, null), g && g.m(e, null), _(e, a), c = true, f || (u = ne(
        i,
        "click",
        /*onHome*/
        n[14]
      ), f = true);
    },
    p(v, [y]) {
      v[7] !== void 0 && d.p(v, y), /*viewModel*/
      v[0].nameL || /*$bundleNamesL*/
      v[2].length > 1 ? m ? (m.p(v, y), y & /*viewModel, $bundleNamesL*/
      5 && b(m, 1)) : (m = Yl(v), m.c(), b(m, 1), m.m(t, null)) : m && (U(), M(m, 1, 1, () => {
        m = null;
      }), X()), /*$controlsVisible*/
      v[4] ? g ? g.p(v, y) : (g = Xl(v), g.c(), g.m(e, a)) : g && (g.d(1), g = null);
    },
    i(v) {
      c || (b(s.$$.fragment, v), b(m), c = true);
    },
    o(v) {
      M(s.$$.fragment, v), M(m), c = false;
    },
    d(v) {
      v && w(e), F(s), d && d.d(), m && m.d(), g && g.d(), f = false, u();
    }
  };
}
function ti(n, e) {
  const t = new CustomEvent("sde-check-bundle", { detail: { kind: n, name: e } });
  document.dispatchEvent(t);
}
function ko(n) {
  ti("left", n.target.value);
}
function yo(n) {
  ti("right", n.target.value);
}
function Mo(n, e, t) {
  let l, i, s, r, o, a, { viewModel: c } = e;
  const f = c.simplifyScenarios;
  ve(n, f, (S) => t(1, l = S));
  const u = c.thresholds, d = c.bundleNamesL;
  ve(n, d, (S) => t(2, i = S));
  const m = c.bundleNamesR;
  ve(n, m, (S) => t(3, s = S));
  const g = c.controlsVisible;
  ve(n, g, (S) => t(4, r = S));
  const v = c.zoom;
  ve(n, v, (S) => t(6, a = S));
  const y = c.consistentYRange;
  ve(n, y, (S) => t(5, o = S));
  const R = Ie();
  function $() {
    R("command", { cmd: "show-summary" });
  }
  function C() {
    c.controlsVisible.update((S) => !S);
  }
  let I = true;
  function D() {
    l = this.checked, f.set(l);
  }
  function V() {
    o = this.checked, y.set(o);
  }
  function q() {
    a = ji(this.value), v.set(a);
  }
  return n.$$set = (S) => {
    "viewModel" in S && t(0, c = S.viewModel);
  }, n.$$.update = () => {
    n.$$.dirty & /*$simplifyScenarios, firstSimplify*/
    65538 && l !== void 0 && (I ? t(16, I = false) : document.dispatchEvent(new CustomEvent("sde-check-simplify-scenarios-toggled")));
  }, [
    c,
    l,
    i,
    s,
    r,
    o,
    a,
    f,
    u,
    d,
    m,
    g,
    v,
    y,
    $,
    C,
    I,
    D,
    V,
    q
  ];
}
var $o = class extends re {
  constructor(e) {
    super(), oe(this, e, Mo, wo, te, { viewModel: 0 }, ho);
  }
};
function Ro(n) {
  ce(n, "svelte-1j1xz6h", ".dot-plot-container.svelte-1j1xz6h{position:relative;width:100%;height:1.6rem}.hline.svelte-1j1xz6h{position:absolute;left:0;top:0.7rem;width:100%;height:1px;background-color:#555}.vline.svelte-1j1xz6h{position:absolute;left:0;height:1.4rem;width:1px}.end-line.svelte-1j1xz6h{background-color:#555}.avg-line.svelte-1j1xz6h{width:2px;margin-left:-1px}.dot.svelte-1j1xz6h{position:absolute;top:0.3rem;width:0.8rem;height:0.8rem;margin-left:-0.4rem;border-radius:0.4rem;opacity:0.2}");
}
function Zl(n, e, t) {
  const l = n.slice();
  return l[2] = e[t], l;
}
function Jl(n) {
  let e, t;
  return {
    c() {
      e = p("div"), h(e, "class", t = "dot " + /*colorClass*/
      n[1] + " svelte-1j1xz6h"), ie(
        e,
        "left",
        /*point*/
        n[2] + "%"
      );
    },
    m(l, i) {
      k(l, e, i);
    },
    p(l, i) {
      i & /*colorClass*/
      2 && t !== (t = "dot " + /*colorClass*/
      l[1] + " svelte-1j1xz6h") && h(e, "class", t), i & /*viewModel*/
      1 && ie(
        e,
        "left",
        /*point*/
        l[2] + "%"
      );
    },
    d(l) {
      l && w(e);
    }
  };
}
function So(n) {
  let e, t, l, i, s, r, o = B(
    /*viewModel*/
    n[0].points
  ), a = [];
  for (let c = 0; c < o.length; c += 1)
    a[c] = Jl(Zl(n, o, c));
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), i = p("div");
      for (let c = 0; c < a.length; c += 1)
        a[c].c();
      s = p("div"), h(t, "class", "hline svelte-1j1xz6h"), h(l, "class", "vline end-line svelte-1j1xz6h"), ie(l, "left", "0"), h(i, "class", "vline end-line svelte-1j1xz6h"), ie(i, "left", "100%"), h(s, "class", r = "vline avg-line " + /*colorClass*/
      n[1] + " svelte-1j1xz6h"), ie(
        s,
        "left",
        /*viewModel*/
        n[0].avgPoint + "%"
      ), h(e, "class", "dot-plot-container svelte-1j1xz6h");
    },
    m(c, f) {
      k(c, e, f), _(e, t), _(e, l), _(e, i);
      for (let u = 0; u < a.length; u += 1)
        a[u] && a[u].m(e, null);
      _(e, s);
    },
    p(c, [f]) {
      if (f & /*colorClass, viewModel*/
      3) {
        o = B(
          /*viewModel*/
          c[0].points
        );
        let u;
        for (u = 0; u < o.length; u += 1) {
          const d = Zl(c, o, u);
          a[u] ? a[u].p(d, f) : (a[u] = Jl(d), a[u].c(), a[u].m(e, s));
        }
        for (; u < a.length; u += 1)
          a[u].d(1);
        a.length = o.length;
      }
      f & /*colorClass*/
      2 && r !== (r = "vline avg-line " + /*colorClass*/
      c[1] + " svelte-1j1xz6h") && h(s, "class", r), f & /*viewModel*/
      1 && ie(
        s,
        "left",
        /*viewModel*/
        c[0].avgPoint + "%"
      );
    },
    i: K,
    o: K,
    d(c) {
      c && w(e), se(a, c);
    }
  };
}
function zo(n, e, t) {
  let { viewModel: l } = e, { colorClass: i } = e;
  return n.$$set = (s) => {
    "viewModel" in s && t(0, l = s.viewModel), "colorClass" in s && t(1, i = s.colorClass);
  }, [l, i];
}
var Mt = class extends re {
  constructor(e) {
    super(), oe(this, e, zo, So, te, { viewModel: 0, colorClass: 1 }, Ro);
  }
};
function Co(n) {
  ce(n, "svelte-15dp53", ".perf-container.svelte-15dp53{display:flex;flex-direction:column;padding:0 1rem}.controls-container.svelte-15dp53{display:flex;flex-direction:column;align-items:flex-start;height:3rem}.table-container.svelte-15dp53{display:flex;flex:1}table.svelte-15dp53{border-collapse:collapse}td.svelte-15dp53,th.svelte-15dp53{padding-top:0.2rem;padding-bottom:0.2rem}th.svelte-15dp53{color:#aaa;text-align:right;font-weight:500}td.svelte-15dp53{width:4.5rem;text-align:right;font-family:monospace}td.rownum.svelte-15dp53{width:2rem}td.dim.svelte-15dp53{color:#777}td.plot.svelte-15dp53{width:30rem;padding-left:2rem;padding-right:2rem}");
}
function Ql(n, e, t) {
  const l = n.slice();
  return l[5] = e[t], l;
}
function Io(n) {
  let e;
  return {
    c() {
      e = p("div"), e.textContent = "Running performance tests, please wait…";
    },
    m(t, l) {
      k(t, e, l);
    },
    p: K,
    d(t) {
      t && w(e);
    }
  };
}
function To(n) {
  let e, t, l, i;
  return {
    c() {
      e = p("button"), t = P("Run"), h(e, "class", "run"), e.disabled = /*running*/
      n[0];
    },
    m(s, r) {
      k(s, e, r), _(e, t), l || (i = ne(
        e,
        "click",
        /*onRun*/
        n[3]
      ), l = true);
    },
    p(s, r) {
      r & /*running*/
      1 && (e.disabled = /*running*/
      s[0]);
    },
    d(s) {
      s && w(e), l = false, i();
    }
  };
}
function en(n) {
  let e, t, l, i = B(
    /*$rows*/
    n[1]
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = tn(Ql(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("table"), t = p("tr"), t.innerHTML = '<th class="svelte-15dp53">run</th><th class="svelte-15dp53">min</th><th class="svelte-15dp53">avg</th><th class="svelte-15dp53">max</th>';
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      h(e, "class", "svelte-15dp53");
    },
    m(o, a) {
      k(o, e, a), _(e, t);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(e, null);
      l = true;
    },
    p(o, a) {
      if (a & /*$rows*/
      2) {
        i = B(
          /*$rows*/
          o[1]
        );
        let c;
        for (c = 0; c < i.length; c += 1) {
          const f = Ql(o, i, c);
          s[c] ? (s[c].p(f, a), b(s[c], 1)) : (s[c] = tn(f), s[c].c(), b(s[c], 1), s[c].m(e, null));
        }
        for (U(), c = i.length; c < s.length; c += 1)
          r(c);
        X();
      }
    },
    i(o) {
      if (!l) {
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && w(e), se(s, o);
    }
  };
}
function tn(n) {
  let e, t, l = (
    /*row*/
    n[5].num + ""
  ), i, s, r = (
    /*row*/
    n[5].minTimeL + ""
  ), o, a, c = (
    /*row*/
    n[5].avgTimeL + ""
  ), f, u, d = (
    /*row*/
    n[5].maxTimeL + ""
  ), m, g, v, y, R, $ = (
    /*row*/
    n[5].minTimeR + ""
  ), C, I, D = (
    /*row*/
    n[5].avgTimeR + ""
  ), V, q, S = (
    /*row*/
    n[5].maxTimeR + ""
  ), j, x, T, z;
  return v = new Mt({
    props: {
      viewModel: (
        /*row*/
        n[5].dotPlotL
      ),
      colorClass: "dataset-bg-0"
    }
  }), T = new Mt({
    props: {
      viewModel: (
        /*row*/
        n[5].dotPlotR
      ),
      colorClass: "dataset-bg-1"
    }
  }), {
    c() {
      e = p("tr"), t = p("td"), i = P(l), s = p("td"), o = P(r), a = p("td"), f = P(c), u = p("td"), m = P(d), g = p("td"), A(v.$$.fragment), y = p("tr"), R = p("td"), C = P($), I = p("td"), V = P(D), q = p("td"), j = P(S), x = p("td"), A(T.$$.fragment), h(t, "class", "rownum svelte-15dp53"), h(t, "rowspan", "2"), h(s, "class", "dim svelte-15dp53"), h(a, "class", "value dataset-color-0 svelte-15dp53"), h(u, "class", "dim svelte-15dp53"), h(g, "class", "plot svelte-15dp53"), h(R, "class", "dim svelte-15dp53"), h(I, "class", "value dataset-color-1 svelte-15dp53"), h(q, "class", "dim svelte-15dp53"), h(x, "class", "plot svelte-15dp53");
    },
    m(N, H) {
      k(N, e, H), _(e, t), _(t, i), _(e, s), _(s, o), _(e, a), _(a, f), _(e, u), _(u, m), _(e, g), E(v, g, null), k(N, y, H), _(y, R), _(R, C), _(y, I), _(I, V), _(y, q), _(q, j), _(y, x), E(T, x, null), z = true;
    },
    p(N, H) {
      (!z || H & /*$rows*/
      2) && l !== (l = /*row*/
      N[5].num + "") && W(i, l), (!z || H & /*$rows*/
      2) && r !== (r = /*row*/
      N[5].minTimeL + "") && W(o, r), (!z || H & /*$rows*/
      2) && c !== (c = /*row*/
      N[5].avgTimeL + "") && W(f, c), (!z || H & /*$rows*/
      2) && d !== (d = /*row*/
      N[5].maxTimeL + "") && W(m, d);
      const G = {};
      H & /*$rows*/
      2 && (G.viewModel = /*row*/
      N[5].dotPlotL), v.$set(G), (!z || H & /*$rows*/
      2) && $ !== ($ = /*row*/
      N[5].minTimeR + "") && W(C, $), (!z || H & /*$rows*/
      2) && D !== (D = /*row*/
      N[5].avgTimeR + "") && W(V, D), (!z || H & /*$rows*/
      2) && S !== (S = /*row*/
      N[5].maxTimeR + "") && W(j, S);
      const Y = {};
      H & /*$rows*/
      2 && (Y.viewModel = /*row*/
      N[5].dotPlotR), T.$set(Y);
    },
    i(N) {
      z || (b(v.$$.fragment, N), b(T.$$.fragment, N), z = true);
    },
    o(N) {
      M(v.$$.fragment, N), M(T.$$.fragment, N), z = false;
    },
    d(N) {
      N && (w(e), w(y)), F(v), F(T);
    }
  };
}
function Do(n) {
  let e, t, l, i;
  function s(c, f) {
    return (
      /*running*/
      c[0] ? Io : To
    );
  }
  let r = s(n), o = r(n), a = (
    /*$rows*/
    n[1].length > 0 && en(n)
  );
  return {
    c() {
      e = p("div"), t = p("div"), o.c(), l = p("div"), a && a.c(), h(t, "class", "controls-container svelte-15dp53"), h(l, "class", "table-container svelte-15dp53"), h(e, "class", "perf-container svelte-15dp53");
    },
    m(c, f) {
      k(c, e, f), _(e, t), o.m(t, null), _(e, l), a && a.m(l, null), i = true;
    },
    p(c, [f]) {
      r === (r = s(c)) && o ? o.p(c, f) : (o.d(1), o = r(c), o && (o.c(), o.m(t, null))), /*$rows*/
      c[1].length > 0 ? a ? (a.p(c, f), f & /*$rows*/
      2 && b(a, 1)) : (a = en(c), a.c(), b(a, 1), a.m(l, null)) : a && (U(), M(a, 1, 1, () => {
        a = null;
      }), X());
    },
    i(c) {
      i || (b(a), i = true);
    },
    o(c) {
      M(a), i = false;
    },
    d(c) {
      c && w(e), o.d(), a && a.d();
    }
  };
}
function jo(n, e, t) {
  let l, { viewModel: i } = e;
  const s = i.rows;
  ve(n, s, (a) => t(1, l = a));
  let r = false;
  function o() {
    t(0, r = true);
    const a = new PerfRunner(i.bundleModelL, i.bundleModelR);
    a.onComplete = (c, f) => {
      i.addRow(c, f), t(0, r = false);
    }, a.onError = (c) => {
      console.error(c), t(0, r = false);
    }, a.start();
  }
  return n.$$set = (a) => {
    "viewModel" in a && t(4, i = a.viewModel);
  }, [r, l, s, o, i];
}
var Lo = class extends re {
  constructor(e) {
    super(), oe(this, e, jo, Do, te, { viewModel: 4 }, Co);
  }
};
function Vo(n) {
  ce(n, "svelte-1xosw0f", ".graph-container.svelte-1xosw0f{position:relative;display:flex;width:36rem;height:22rem;margin-left:1rem;margin-top:0.5rem;margin-bottom:1rem}");
}
function ln(n) {
  let e, t, l;
  return t = new Zn({
    props: {
      viewModel: (
        /*$content*/
        n[2].comparisonGraphViewModel
      )
    }
  }), {
    c() {
      e = p("div"), A(t.$$.fragment), h(e, "class", "graph-container svelte-1xosw0f");
    },
    m(i, s) {
      k(i, e, s), E(t, e, null), l = true;
    },
    p(i, s) {
      const r = {};
      s & /*$content*/
      4 && (r.viewModel = /*$content*/
      i[2].comparisonGraphViewModel), t.$set(r);
    },
    i(i) {
      l || (b(t.$$.fragment, i), l = true);
    },
    o(i) {
      M(t.$$.fragment, i), l = false;
    },
    d(i) {
      i && w(e), F(t);
    }
  };
}
function xo(n) {
  let e, t, l = (
    /*$content*/
    n[2] && ln(n)
  );
  return {
    c() {
      l && l.c(), e = ee();
    },
    m(i, s) {
      l && l.m(i, s), k(i, e, s), t = true;
    },
    p(i, s) {
      i[2] ? l ? (l.p(i, s), s & /*$content*/
      4 && b(l, 1)) : (l = ln(i), l.c(), b(l, 1), l.m(e.parentNode, e)) : l && (U(), M(l, 1, 1, () => {
        l = null;
      }), X());
    },
    i(i) {
      t || (b(l), t = true);
    },
    o(i) {
      M(l), t = false;
    },
    d(i) {
      i && w(e), l && l.d(i);
    }
  };
}
function No(n) {
  let e, t, l;
  function i(r) {
    n[6](r);
  }
  let s = {
    $$slots: { default: [xo] },
    $$scope: { ctx: n }
  };
  return (
    /*visible*/
    n[0] !== void 0 && (s.visible = /*visible*/
    n[0]), e = new Dt({ props: s }), be.push(() => ut(e, "visible", i)), {
      c() {
        A(e.$$.fragment);
      },
      m(r, o) {
        E(e, r, o), l = true;
      },
      p(r, [o]) {
        const a = {};
        o & /*$$scope, $content*/
        132 && (a.$$scope = { dirty: o, ctx: r }), !t && o & /*visible*/
        1 && (t = true, a.visible = /*visible*/
        r[0], ct(() => t = false)), e.$set(a);
      },
      i(r) {
        l || (b(e.$$.fragment, r), l = true);
      },
      o(r) {
        M(e.$$.fragment, r), l = false;
      },
      d(r) {
        F(e, r);
      }
    }
  );
}
function Po(n, e, t) {
  let l, i = K, s = () => (i(), i = je(o, (d) => t(2, l = d)), o);
  n.$$.on_destroy.push(() => i());
  let { viewModel: r } = e, o = r.content;
  s();
  let a = false, c = a, f;
  function u(d) {
    a = d, t(0, a);
  }
  return n.$$set = (d) => {
    "viewModel" in d && t(3, r = d.viewModel);
  }, n.$$.update = () => {
    n.$$.dirty & /*visible, previousVisible, viewModel, previousViewModel*/
    57 && (a !== c || r.baseRequestKey !== (f == null ? void 0 : f.baseRequestKey)) && (f == null || f.clearData(), t(4, c = a), t(5, f = r), s(t(1, o = r.content)), a && r.requestData());
  }, [
    a,
    o,
    l,
    r,
    c,
    f,
    u
  ];
}
var qo = class extends re {
  constructor(e) {
    super(), oe(this, e, Po, No, te, { viewModel: 3 }, Vo);
  }
};
function Ko(n) {
  ce(n, "svelte-1l9dja1", ".check-graph.svelte-1l9dja1{height:23rem;margin-left:8.5rem}");
}
function nn(n) {
  let e, t, l, i;
  return t = new qo({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].graphBoxViewModel
      )
    }
  }), {
    c() {
      e = p("div"), A(t.$$.fragment), h(e, "class", l = "row check-graph " + /*viewModel*/
      n[0].rowClasses + " svelte-1l9dja1");
    },
    m(s, r) {
      k(s, e, r), E(t, e, null), i = true;
    },
    p(s, r) {
      const o = {};
      r & /*viewModel*/
      1 && (o.viewModel = /*viewModel*/
      s[0].graphBoxViewModel), t.$set(o), (!i || r & /*viewModel*/
      1 && l !== (l = "row check-graph " + /*viewModel*/
      s[0].rowClasses + " svelte-1l9dja1")) && h(e, "class", l);
    },
    i(s) {
      i || (b(t.$$.fragment, s), i = true);
    },
    o(s) {
      M(t.$$.fragment, s), i = false;
    },
    d(s) {
      s && w(e), F(t);
    }
  };
}
function Bo(n) {
  let e, t, l = (
    /*viewModel*/
    n[0].span + ""
  ), i, s, r, o, a, c = (
    /*viewModel*/
    n[0].graphBoxViewModel && /*$graphVisible*/
    n[1] && nn(n)
  );
  return {
    c() {
      e = p("div"), t = p("span"), c && c.c(), s = ee(), h(t, "class", "label"), h(e, "class", i = "row " + /*viewModel*/
      n[0].rowClasses + " svelte-1l9dja1");
    },
    m(f, u) {
      k(f, e, u), _(e, t), t.innerHTML = l, c && c.m(f, u), k(f, s, u), r = true, o || (a = ne(
        t,
        "click",
        /*onLabelClicked*/
        n[3]
      ), o = true);
    },
    p(f, [u]) {
      (!r || u & /*viewModel*/
      1) && l !== (l = /*viewModel*/
      f[0].span + "") && (t.innerHTML = l), (!r || u & /*viewModel*/
      1 && i !== (i = "row " + /*viewModel*/
      f[0].rowClasses + " svelte-1l9dja1")) && h(e, "class", i), /*viewModel*/
      f[0].graphBoxViewModel && /*$graphVisible*/
      f[1] ? c ? (c.p(f, u), u & /*viewModel, $graphVisible*/
      3 && b(c, 1)) : (c = nn(f), c.c(), b(c, 1), c.m(s.parentNode, s)) : c && (U(), M(c, 1, 1, () => {
        c = null;
      }), X());
    },
    i(f) {
      r || (b(c), r = true);
    },
    o(f) {
      M(c), r = false;
    },
    d(f) {
      f && (w(e), w(s)), c && c.d(f), o = false, a();
    }
  };
}
function Eo(n, e, t) {
  let l, { viewModel: i } = e;
  const s = i.graphVisible;
  ve(n, s, (o) => t(1, l = o));
  function r() {
    s.update((o) => !o);
  }
  return n.$$set = (o) => {
    "viewModel" in o && t(0, i = o.viewModel);
  }, [i, l, s, r];
}
var Fo = class extends re {
  constructor(e) {
    super(), oe(this, e, Eo, Bo, te, { viewModel: 0 }, Ko);
  }
};
function sn(n, e, t) {
  const l = n.slice();
  return l[4] = e[t], l;
}
function on(n) {
  let e, t;
  return e = new Fo({ props: { viewModel: (
    /*row*/
    n[4]
  ) } }), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*row*/
      l[4]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Ho(n) {
  let e, t, l, i = (
    /*viewModel*/
    n[0].testRow.span + ""
  ), s = (
    /*$expandAll*/
    n[1] || /*viewModel*/
    n[0].testRow.status !== "passed" ? ":" : ""
  ), r, o, a, c, f, u = B(
    /*viewModel*/
    n[0].childRows
  ), d = [];
  for (let g = 0; g < u.length; g += 1)
    d[g] = on(sn(n, u, g));
  const m = (g) => M(d[g], 1, 1, () => {
    d[g] = null;
  });
  return {
    c() {
      e = p("div"), t = p("span"), l = new xi(false), r = P(s), o = p("div");
      for (let g = 0; g < d.length; g += 1)
        d[g].c();
      l.a = r, h(t, "class", "label"), h(e, "class", "row test"), h(o, "class", "test-rows"), de(
        o,
        "expand-all",
        /*$expandAll*/
        n[1]
      );
    },
    m(g, v) {
      k(g, e, v), _(e, t), l.m(i, t), _(t, r), k(g, o, v);
      for (let y = 0; y < d.length; y += 1)
        d[y] && d[y].m(o, null);
      a = true, c || (f = ne(
        t,
        "click",
        /*onTestClicked*/
        n[3]
      ), c = true);
    },
    p(g, [v]) {
      if ((!a || v & /*viewModel*/
      1) && i !== (i = /*viewModel*/
      g[0].testRow.span + "") && l.p(i), (!a || v & /*$expandAll, viewModel*/
      3) && s !== (s = /*$expandAll*/
      g[1] || /*viewModel*/
      g[0].testRow.status !== "passed" ? ":" : "") && W(r, s), v & /*viewModel*/
      1) {
        u = B(
          /*viewModel*/
          g[0].childRows
        );
        let y;
        for (y = 0; y < u.length; y += 1) {
          const R = sn(g, u, y);
          d[y] ? (d[y].p(R, v), b(d[y], 1)) : (d[y] = on(R), d[y].c(), b(d[y], 1), d[y].m(o, null));
        }
        for (U(), y = u.length; y < d.length; y += 1)
          m(y);
        X();
      }
      (!a || v & /*$expandAll*/
      2) && de(
        o,
        "expand-all",
        /*$expandAll*/
        g[1]
      );
    },
    i(g) {
      if (!a) {
        for (let v = 0; v < u.length; v += 1)
          b(d[v]);
        a = true;
      }
    },
    o(g) {
      d = d.filter(Boolean);
      for (let v = 0; v < d.length; v += 1)
        M(d[v]);
      a = false;
    },
    d(g) {
      g && (w(e), w(o)), se(d, g), c = false, f();
    }
  };
}
function Ao(n, e, t) {
  let l, { viewModel: i } = e;
  const s = i.expandAll;
  ve(n, s, (o) => t(1, l = o));
  function r() {
    s.update((o) => !o);
  }
  return n.$$set = (o) => {
    "viewModel" in o && t(0, i = o.viewModel);
  }, [i, l, s, r];
}
var Go = class extends re {
  constructor(e) {
    super(), oe(this, e, Ao, Ho, te, { viewModel: 0 });
  }
};
function Wo(n) {
  ce(n, "svelte-ffmh5y", ".check-summary-container.svelte-ffmh5y{display:flex;flex-direction:column}.check-detail.svelte-ffmh5y{display:flex;flex-direction:column}.group-container.svelte-ffmh5y{margin-bottom:1.2rem}.group-container.svelte-ffmh5y .test-rows{display:flex;flex-direction:column}.group-container.svelte-ffmh5y .row.passed{display:none}.group-container.svelte-ffmh5y .test-rows.expand-all .row.passed{display:flex}.group-container.svelte-ffmh5y .row{display:flex;flex-direction:row}.group-container.svelte-ffmh5y .row.group{font-size:1.2em}.group-container.svelte-ffmh5y .row.test{margin-top:0.4rem}.group-container.svelte-ffmh5y .row.test > .label{cursor:pointer}.group-container.svelte-ffmh5y .row.scenario{color:#777}.group-container.svelte-ffmh5y .row.dataset{color:#777}.group-container.svelte-ffmh5y .row.predicate{color:#777}.group-container.svelte-ffmh5y .row.predicate > .label{cursor:pointer}.group-container.svelte-ffmh5y .bold{font-weight:700;color:#bbb}.summary-bar-row.svelte-ffmh5y{display:flex;flex-direction:row;align-items:baseline;align-self:flex-start;margin:2.6rem 0;opacity:1}.bar-container.svelte-ffmh5y{display:flex;flex-direction:row;width:20rem;height:0.8rem}.bar.svelte-ffmh5y{height:0.8rem}.bar.gray.svelte-ffmh5y{background-color:#777}.summary-label.svelte-ffmh5y{margin-left:0.8rem;color:#fff}.sep.svelte-ffmh5y{color:#777}");
}
function rn(n, e, t) {
  const l = n.slice();
  return l[1] = e[t], l;
}
function an(n, e, t) {
  const l = n.slice();
  return l[4] = e[t], l;
}
function Yo(n) {
  let e;
  return {
    c() {
      e = p("div"), h(e, "class", "bar gray svelte-ffmh5y"), ie(e, "width", "100%");
    },
    m(t, l) {
      k(t, e, l);
    },
    p: K,
    d(t) {
      t && w(e);
    }
  };
}
function Oo(n) {
  let e, t, l;
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), h(e, "class", "bar bucket-bg-0 svelte-ffmh5y"), ie(
        e,
        "width",
        /*viewModel*/
        n[0].percents[0] + "%"
      ), h(t, "class", "bar status-bg-failed svelte-ffmh5y"), ie(
        t,
        "width",
        /*viewModel*/
        n[0].percents[1] + "%"
      ), h(l, "class", "bar status-bg-error svelte-ffmh5y"), ie(
        l,
        "width",
        /*viewModel*/
        n[0].percents[2] + "%"
      );
    },
    m(i, s) {
      k(i, e, s), k(i, t, s), k(i, l, s);
    },
    p(i, s) {
      s & /*viewModel*/
      1 && ie(
        e,
        "width",
        /*viewModel*/
        i[0].percents[0] + "%"
      ), s & /*viewModel*/
      1 && ie(
        t,
        "width",
        /*viewModel*/
        i[0].percents[1] + "%"
      ), s & /*viewModel*/
      1 && ie(
        l,
        "width",
        /*viewModel*/
        i[0].percents[2] + "%"
      );
    },
    d(i) {
      i && (w(e), w(t), w(l));
    }
  };
}
function Uo(n) {
  let e, t = (
    /*viewModel*/
    n[0].total + ""
  ), l, i, s, r, o, a = (
    /*viewModel*/
    n[0].passed && cn(n)
  ), c = (
    /*viewModel*/
    n[0].failed && fn(n)
  ), f = (
    /*viewModel*/
    n[0].errors && un(n)
  );
  return {
    c() {
      e = p("span"), l = P(t), i = P(" total"), a && a.c(), s = ee(), c && c.c(), r = ee(), f && f.c(), o = ee();
    },
    m(u, d) {
      k(u, e, d), _(e, l), _(e, i), a && a.m(u, d), k(u, s, d), c && c.m(u, d), k(u, r, d), f && f.m(u, d), k(u, o, d);
    },
    p(u, d) {
      d & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      u[0].total + "") && W(l, t), /*viewModel*/
      u[0].passed ? a ? a.p(u, d) : (a = cn(u), a.c(), a.m(s.parentNode, s)) : a && (a.d(1), a = null), /*viewModel*/
      u[0].failed ? c ? c.p(u, d) : (c = fn(u), c.c(), c.m(r.parentNode, r)) : c && (c.d(1), c = null), /*viewModel*/
      u[0].errors ? f ? f.p(u, d) : (f = un(u), f.c(), f.m(o.parentNode, o)) : f && (f.d(1), f = null);
    },
    d(u) {
      u && (w(e), w(s), w(r), w(o)), a && a.d(u), c && c.d(u), f && f.d(u);
    }
  };
}
function Xo(n) {
  let e, t = (
    /*viewModel*/
    n[0].total + ""
  ), l, i;
  return {
    c() {
      e = p("span"), l = P(t), i = P(" total passed");
    },
    m(s, r) {
      k(s, e, r), _(e, l), _(e, i);
    },
    p(s, r) {
      r & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      s[0].total + "") && W(l, t);
    },
    d(s) {
      s && w(e);
    }
  };
}
function Zo(n) {
  let e;
  return {
    c() {
      e = p("span"), e.textContent = "No checks";
    },
    m(t, l) {
      k(t, e, l);
    },
    p: K,
    d(t) {
      t && w(e);
    }
  };
}
function cn(n) {
  let e, t, l = (
    /*viewModel*/
    n[0].passed + ""
  ), i, s;
  return {
    c() {
      e = p("span"), e.textContent = " | ", t = p("span"), i = P(l), s = P(" passed"), h(e, "class", "sep svelte-ffmh5y"), h(t, "class", "status-color-passed");
    },
    m(r, o) {
      k(r, e, o), k(r, t, o), _(t, i), _(t, s);
    },
    p(r, o) {
      o & /*viewModel*/
      1 && l !== (l = /*viewModel*/
      r[0].passed + "") && W(i, l);
    },
    d(r) {
      r && (w(e), w(t));
    }
  };
}
function fn(n) {
  let e, t, l = (
    /*viewModel*/
    n[0].failed + ""
  ), i, s;
  return {
    c() {
      e = p("span"), e.textContent = " | ", t = p("span"), i = P(l), s = P(" failed"), h(e, "class", "sep svelte-ffmh5y"), h(t, "class", "status-color-failed");
    },
    m(r, o) {
      k(r, e, o), k(r, t, o), _(t, i), _(t, s);
    },
    p(r, o) {
      o & /*viewModel*/
      1 && l !== (l = /*viewModel*/
      r[0].failed + "") && W(i, l);
    },
    d(r) {
      r && (w(e), w(t));
    }
  };
}
function un(n) {
  let e, t;
  function l(r, o) {
    return (
      /*viewModel*/
      r[0].errors > 1 ? Qo : Jo
    );
  }
  let i = l(n), s = i(n);
  return {
    c() {
      e = p("span"), e.textContent = " | ", s.c(), t = ee(), h(e, "class", "sep svelte-ffmh5y");
    },
    m(r, o) {
      k(r, e, o), s.m(r, o), k(r, t, o);
    },
    p(r, o) {
      i === (i = l(r)) && s ? s.p(r, o) : (s.d(1), s = i(r), s && (s.c(), s.m(t.parentNode, t)));
    },
    d(r) {
      r && (w(e), w(t)), s.d(r);
    }
  };
}
function Jo(n) {
  let e, t = (
    /*viewModel*/
    n[0].errors + ""
  ), l, i;
  return {
    c() {
      e = p("span"), l = P(t), i = P(" error"), h(e, "class", "status-color-error");
    },
    m(s, r) {
      k(s, e, r), _(e, l), _(e, i);
    },
    p(s, r) {
      r & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      s[0].errors + "") && W(l, t);
    },
    d(s) {
      s && w(e);
    }
  };
}
function Qo(n) {
  let e, t = (
    /*viewModel*/
    n[0].errors + ""
  ), l, i;
  return {
    c() {
      e = p("span"), l = P(t), i = P(" errors"), h(e, "class", "status-color-error");
    },
    m(s, r) {
      k(s, e, r), _(e, l), _(e, i);
    },
    p(s, r) {
      r & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      s[0].errors + "") && W(l, t);
    },
    d(s) {
      s && w(e);
    }
  };
}
function er(n) {
  let e, t, l = B(
    /*viewModel*/
    n[0].groups
  ), i = [];
  for (let r = 0; r < l.length; r += 1)
    i[r] = mn(rn(n, l, r));
  const s = (r) => M(i[r], 1, 1, () => {
    i[r] = null;
  });
  return {
    c() {
      e = p("div");
      for (let r = 0; r < i.length; r += 1)
        i[r].c();
      h(e, "class", "check-detail svelte-ffmh5y");
    },
    m(r, o) {
      k(r, e, o);
      for (let a = 0; a < i.length; a += 1)
        i[a] && i[a].m(e, null);
      t = true;
    },
    p(r, o) {
      if (o & /*viewModel*/
      1) {
        l = B(
          /*viewModel*/
          r[0].groups
        );
        let a;
        for (a = 0; a < l.length; a += 1) {
          const c = rn(r, l, a);
          i[a] ? (i[a].p(c, o), b(i[a], 1)) : (i[a] = mn(c), i[a].c(), b(i[a], 1), i[a].m(e, null));
        }
        for (U(), a = l.length; a < i.length; a += 1)
          s(a);
        X();
      }
    },
    i(r) {
      if (!t) {
        for (let o = 0; o < l.length; o += 1)
          b(i[o]);
        t = true;
      }
    },
    o(r) {
      i = i.filter(Boolean);
      for (let o = 0; o < i.length; o += 1)
        M(i[o]);
      t = false;
    },
    d(r) {
      r && w(e), se(i, r);
    }
  };
}
function dn(n) {
  let e, t;
  return e = new Go({
    props: { viewModel: (
      /*testViewModel*/
      n[4]
    ) }
  }), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*testViewModel*/
      l[4]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function mn(n) {
  let e, t, l, i = (
    /*group*/
    n[1].name + ""
  ), s, r, o = B(
    /*group*/
    n[1].tests
  ), a = [];
  for (let f = 0; f < o.length; f += 1)
    a[f] = dn(an(n, o, f));
  const c = (f) => M(a[f], 1, 1, () => {
    a[f] = null;
  });
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), s = P(i);
      for (let f = 0; f < a.length; f += 1)
        a[f].c();
      h(l, "class", "label"), h(t, "class", "row group"), h(e, "class", "group-container svelte-ffmh5y");
    },
    m(f, u) {
      k(f, e, u), _(e, t), _(t, l), _(l, s);
      for (let d = 0; d < a.length; d += 1)
        a[d] && a[d].m(e, null);
      r = true;
    },
    p(f, u) {
      if ((!r || u & /*viewModel*/
      1) && i !== (i = /*group*/
      f[1].name + "") && W(s, i), u & /*viewModel*/
      1) {
        o = B(
          /*group*/
          f[1].tests
        );
        let d;
        for (d = 0; d < o.length; d += 1) {
          const m = an(f, o, d);
          a[d] ? (a[d].p(m, u), b(a[d], 1)) : (a[d] = dn(m), a[d].c(), b(a[d], 1), a[d].m(e, null));
        }
        for (U(), d = o.length; d < a.length; d += 1)
          c(d);
        X();
      }
    },
    i(f) {
      if (!r) {
        for (let u = 0; u < o.length; u += 1)
          b(a[u]);
        r = true;
      }
    },
    o(f) {
      a = a.filter(Boolean);
      for (let u = 0; u < a.length; u += 1)
        M(a[u]);
      r = false;
    },
    d(f) {
      f && w(e), se(a, f);
    }
  };
}
function tr(n) {
  let e, t, l, i, s;
  function r(m, g) {
    return (
      /*viewModel*/
      m[0].total > 0 ? Oo : Yo
    );
  }
  let o = r(n), a = o(n);
  function c(m, g) {
    return (
      /*viewModel*/
      m[0].total === 0 ? Zo : (
        /*viewModel*/
        m[0].total === /*viewModel*/
        m[0].passed ? Xo : Uo
      )
    );
  }
  let f = c(n), u = f(n), d = er(n);
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), a.c(), i = p("span"), u.c(), d && d.c(), h(l, "class", "bar-container svelte-ffmh5y"), h(i, "class", "summary-label svelte-ffmh5y"), h(t, "class", "summary-bar-row svelte-ffmh5y"), h(e, "class", "check-summary-container svelte-ffmh5y");
    },
    m(m, g) {
      k(m, e, g), _(e, t), _(t, l), a.m(l, null), _(t, i), u.m(i, null), d && d.m(e, null), s = true;
    },
    p(m, [g]) {
      o === (o = r(m)) && a ? a.p(m, g) : (a.d(1), a = o(m), a && (a.c(), a.m(l, null))), f === (f = c(m)) && u ? u.p(m, g) : (u.d(1), u = f(m), u && (u.c(), u.m(i, null))), d.p(m, g);
    },
    i(m) {
      s || (b(d), s = true);
    },
    o(m) {
      M(d), s = false;
    },
    d(m) {
      m && w(e), a.d(), u.d(), d && d.d();
    }
  };
}
function lr(n, e, t) {
  let { viewModel: l } = e;
  return n.$$set = (i) => {
    "viewModel" in i && t(0, l = i.viewModel);
  }, [l];
}
var nr = class extends re {
  constructor(e) {
    super(), oe(this, e, lr, tr, te, { viewModel: 0 }, Wo);
  }
};
function ir(n) {
  ce(n, "svelte-1050j8k", ".summary-row.svelte-1050j8k{display:flex;flex-direction:row;flex:0 0 auto;align-items:flex-end;margin:0.2rem 0;opacity:0.8}.summary-row.svelte-1050j8k:hover{opacity:1}.bar-container.svelte-1050j8k{display:flex;flex-direction:row;width:15rem;height:0.8rem;margin-bottom:0.25rem;cursor:pointer}.bar.svelte-1050j8k{height:0.8rem}.bar.striped.svelte-1050j8k{width:100%;background:repeating-linear-gradient(-45deg, goldenrod, goldenrod 0.4rem, darkgoldenrod 0.4rem, darkgoldenrod 1rem)}.title-container.svelte-1050j8k{display:flex;flex-direction:column;margin-left:0.8rem}.title-part.svelte-1050j8k{display:flex;flex-direction:row;align-items:baseline}.title.svelte-1050j8k{color:#fff;cursor:pointer}.subtitle.svelte-1050j8k{font-size:0.8em;margin-left:0.6rem;color:#aaa;cursor:pointer}.annotations.svelte-1050j8k{font-size:0.8em;margin-left:0.3rem;color:#aaa}.annotations.svelte-1050j8k .annotation{margin:0 0.3rem;padding:0.1rem 0.3rem;background-color:#1c1c1c;border:0.5px solid #555;border-radius:0.4rem}.summary-header-row.svelte-1050j8k{display:flex;flex-direction:row;flex:0 0 auto;align-items:center;margin:0.4rem 0}.header-bar.svelte-1050j8k{display:flex;width:15rem;height:1px;background-color:#555}.header-title.svelte-1050j8k{margin-left:0.8rem;color:#fff;font-size:1.2em}");
}
function sr(n) {
  let e, t, l, i, s, r = (
    /*viewModel*/
    n[0].title + ""
  ), o, a, c;
  function f(v, y) {
    return (
      /*viewModel*/
      v[0].diffPercentByBucket === void 0 ? ar : rr
    );
  }
  let u = f(n), d = u(n), m = (
    /*viewModel*/
    n[0].subtitle && hn(n)
  ), g = (
    /*viewModel*/
    n[0].annotations && pn(n)
  );
  return {
    c() {
      e = p("div"), t = p("div"), d.c(), l = p("div"), i = p("div"), s = p("div"), m && m.c(), o = ee(), g && g.c(), h(t, "class", "bar-container svelte-1050j8k"), h(s, "class", "title svelte-1050j8k"), h(i, "class", "title-part svelte-1050j8k"), h(l, "class", "title-container svelte-1050j8k"), h(e, "class", "summary-row svelte-1050j8k");
    },
    m(v, y) {
      k(v, e, y), _(e, t), d.m(t, null), _(e, l), _(l, i), _(i, s), s.innerHTML = r, m && m.m(i, null), _(i, o), g && g.m(i, null), a || (c = [
        ne(
          t,
          "click",
          /*onLinkClicked*/
          n[2]
        ),
        ne(
          s,
          "click",
          /*onLinkClicked*/
          n[2]
        )
      ], a = true);
    },
    p(v, y) {
      u === (u = f(v)) && d ? d.p(v, y) : (d.d(1), d = u(v), d && (d.c(), d.m(t, null))), y & /*viewModel*/
      1 && r !== (r = /*viewModel*/
      v[0].title + "") && (s.innerHTML = r), /*viewModel*/
      v[0].subtitle ? m ? m.p(v, y) : (m = hn(v), m.c(), m.m(i, o)) : m && (m.d(1), m = null), /*viewModel*/
      v[0].annotations ? g ? g.p(v, y) : (g = pn(v), g.c(), g.m(i, null)) : g && (g.d(1), g = null);
    },
    d(v) {
      v && w(e), d.d(), m && m.d(), g && g.d(), a = false, we(c);
    }
  };
}
function or(n) {
  let e, t, l, i = (
    /*viewModel*/
    n[0].title + ""
  );
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), h(t, "class", "header-bar svelte-1050j8k"), h(l, "class", "header-title svelte-1050j8k"), h(e, "class", "summary-header-row svelte-1050j8k");
    },
    m(s, r) {
      k(s, e, r), _(e, t), _(e, l), l.innerHTML = i;
    },
    p(s, r) {
      r & /*viewModel*/
      1 && i !== (i = /*viewModel*/
      s[0].title + "") && (l.innerHTML = i);
    },
    d(s) {
      s && w(e);
    }
  };
}
function rr(n) {
  let e, t, l, i, s;
  return {
    c() {
      e = p("div"), t = p("div"), l = p("div"), i = p("div"), s = p("div"), h(e, "class", "bar bucket-bg-0 svelte-1050j8k"), ie(
        e,
        "width",
        /*bucketPcts*/
        n[1][0] + "%"
      ), h(t, "class", "bar bucket-bg-1 svelte-1050j8k"), ie(
        t,
        "width",
        /*bucketPcts*/
        n[1][1] + "%"
      ), h(l, "class", "bar bucket-bg-2 svelte-1050j8k"), ie(
        l,
        "width",
        /*bucketPcts*/
        n[1][2] + "%"
      ), h(i, "class", "bar bucket-bg-3 svelte-1050j8k"), ie(
        i,
        "width",
        /*bucketPcts*/
        n[1][3] + "%"
      ), h(s, "class", "bar bucket-bg-4 svelte-1050j8k"), ie(
        s,
        "width",
        /*bucketPcts*/
        n[1][4] + "%"
      );
    },
    m(r, o) {
      k(r, e, o), k(r, t, o), k(r, l, o), k(r, i, o), k(r, s, o);
    },
    p: K,
    d(r) {
      r && (w(e), w(t), w(l), w(i), w(s));
    }
  };
}
function ar(n) {
  let e;
  return {
    c() {
      e = p("div"), h(e, "class", "bar striped svelte-1050j8k");
    },
    m(t, l) {
      k(t, e, l);
    },
    p: K,
    d(t) {
      t && w(e);
    }
  };
}
function hn(n) {
  let e, t = (
    /*viewModel*/
    n[0].subtitle + ""
  ), l, i;
  return {
    c() {
      e = p("div"), h(e, "class", "subtitle svelte-1050j8k");
    },
    m(s, r) {
      k(s, e, r), e.innerHTML = t, l || (i = ne(
        e,
        "click",
        /*onLinkClicked*/
        n[2]
      ), l = true);
    },
    p(s, r) {
      r & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      s[0].subtitle + "") && (e.innerHTML = t);
    },
    d(s) {
      s && w(e), l = false, i();
    }
  };
}
function pn(n) {
  let e, t = (
    /*viewModel*/
    n[0].annotations + ""
  );
  return {
    c() {
      e = p("div"), h(e, "class", "annotations svelte-1050j8k");
    },
    m(l, i) {
      k(l, e, i), e.innerHTML = t;
    },
    p(l, i) {
      i & /*viewModel*/
      1 && t !== (t = /*viewModel*/
      l[0].annotations + "") && (e.innerHTML = t);
    },
    d(l) {
      l && w(e);
    }
  };
}
function cr(n) {
  let e;
  function t(s, r) {
    return (
      /*viewModel*/
      s[0].header ? or : sr
    );
  }
  let l = t(n), i = l(n);
  return {
    c() {
      i.c(), e = ee();
    },
    m(s, r) {
      i.m(s, r), k(s, e, r);
    },
    p(s, [r]) {
      l === (l = t(s)) && i ? i.p(s, r) : (i.d(1), i = l(s), i && (i.c(), i.m(e.parentNode, e)));
    },
    i: K,
    o: K,
    d(s) {
      s && w(e), i.d(s);
    }
  };
}
function fr(n, e, t) {
  let { viewModel: l } = e;
  const i = l.diffPercentByBucket, s = Ie();
  function r() {
    l.key && s("command", {
      cmd: "show-comparison-detail",
      summaryRow: l
    });
  }
  return n.$$set = (o) => {
    "viewModel" in o && t(0, l = o.viewModel);
  }, [l, i, r];
}
var ke = class extends re {
  constructor(e) {
    super(), oe(this, e, fr, cr, te, { viewModel: 0 }, ir);
  }
};
function ur(n) {
  ce(n, "svelte-8opq0t", ".comparison-summary-container.svelte-8opq0t{display:flex;flex-direction:column;padding-top:2rem}.section-container.svelte-8opq0t{display:flex;flex-direction:column}.section-container.svelte-8opq0t:not(:last-child){margin-bottom:1.5rem}.footer.svelte-8opq0t{flex:0 0 1rem}");
}
function vn(n, e, t) {
  const l = n.slice();
  return l[10] = e[t], l;
}
function gn(n, e, t) {
  const l = n.slice();
  return l[10] = e[t], l;
}
function _n(n, e, t) {
  const l = n.slice();
  return l[10] = e[t], l;
}
function bn(n, e, t) {
  const l = n.slice();
  return l[10] = e[t], l;
}
function wn(n, e, t) {
  const l = n.slice();
  return l[10] = e[t], l;
}
function kn(n, e, t) {
  const l = n.slice();
  return l[7] = e[t], l;
}
function yn(n, e, t) {
  const l = n.slice();
  return l[10] = e[t], l;
}
function dr(n) {
  let e, t, l, i, s, r, o = (
    /*viewModel*/
    n[0].withErrors && Mn(n)
  ), a = (
    /*viewModel*/
    n[0].onlyInLeft && Rn(n)
  ), c = (
    /*viewModel*/
    n[0].onlyInRight && zn(n)
  ), f = (
    /*viewModel*/
    n[0].withDiffs && In(n)
  ), u = (
    /*viewModel*/
    n[0].withoutDiffs && Dn(n)
  );
  return {
    c() {
      o && o.c(), e = ee(), a && a.c(), t = ee(), c && c.c(), l = ee(), f && f.c(), i = ee(), u && u.c(), s = ee();
    },
    m(d, m) {
      o && o.m(d, m), k(d, e, m), a && a.m(d, m), k(d, t, m), c && c.m(d, m), k(d, l, m), f && f.m(d, m), k(d, i, m), u && u.m(d, m), k(d, s, m), r = true;
    },
    p(d, m) {
      d[0].withErrors ? o ? (o.p(d, m), m & /*viewModel*/
      1 && b(o, 1)) : (o = Mn(d), o.c(), b(o, 1), o.m(e.parentNode, e)) : o && (U(), M(o, 1, 1, () => {
        o = null;
      }), X()), /*viewModel*/
      d[0].onlyInLeft ? a ? (a.p(d, m), m & /*viewModel*/
      1 && b(a, 1)) : (a = Rn(d), a.c(), b(a, 1), a.m(t.parentNode, t)) : a && (U(), M(a, 1, 1, () => {
        a = null;
      }), X()), /*viewModel*/
      d[0].onlyInRight ? c ? (c.p(d, m), m & /*viewModel*/
      1 && b(c, 1)) : (c = zn(d), c.c(), b(c, 1), c.m(l.parentNode, l)) : c && (U(), M(c, 1, 1, () => {
        c = null;
      }), X()), /*viewModel*/
      d[0].withDiffs ? f ? (f.p(d, m), m & /*viewModel*/
      1 && b(f, 1)) : (f = In(d), f.c(), b(f, 1), f.m(i.parentNode, i)) : f && (U(), M(f, 1, 1, () => {
        f = null;
      }), X()), /*viewModel*/
      d[0].withoutDiffs ? u ? (u.p(d, m), m & /*viewModel*/
      1 && b(u, 1)) : (u = Dn(d), u.c(), b(u, 1), u.m(s.parentNode, s)) : u && (U(), M(u, 1, 1, () => {
        u = null;
      }), X());
    },
    i(d) {
      r || (b(o), b(a), b(c), b(f), b(u), r = true);
    },
    o(d) {
      M(o), M(a), M(c), M(f), M(u), r = false;
    },
    d(d) {
      d && (w(e), w(t), w(l), w(i), w(s)), o && o.d(d), a && a.d(d), c && c.d(d), f && f.d(d), u && u.d(d);
    }
  };
}
function mr(n) {
  let e, t, l = B(
    /*viewModel*/
    n[0].viewGroups
  ), i = [];
  for (let r = 0; r < l.length; r += 1)
    i[r] = Vn(kn(n, l, r));
  const s = (r) => M(i[r], 1, 1, () => {
    i[r] = null;
  });
  return {
    c() {
      for (let r = 0; r < i.length; r += 1)
        i[r].c();
      e = ee();
    },
    m(r, o) {
      for (let a = 0; a < i.length; a += 1)
        i[a] && i[a].m(r, o);
      k(r, e, o), t = true;
    },
    p(r, o) {
      if (o & /*viewModel*/
      1) {
        l = B(
          /*viewModel*/
          r[0].viewGroups
        );
        let a;
        for (a = 0; a < l.length; a += 1) {
          const c = kn(r, l, a);
          i[a] ? (i[a].p(c, o), b(i[a], 1)) : (i[a] = Vn(c), i[a].c(), b(i[a], 1), i[a].m(e.parentNode, e));
        }
        for (U(), a = l.length; a < i.length; a += 1)
          s(a);
        X();
      }
    },
    i(r) {
      if (!t) {
        for (let o = 0; o < l.length; o += 1)
          b(i[o]);
        t = true;
      }
    },
    o(r) {
      i = i.filter(Boolean);
      for (let o = 0; o < i.length; o += 1)
        M(i[o]);
      t = false;
    },
    d(r) {
      r && w(e), se(i, r);
    }
  };
}
function Mn(n) {
  let e, t, l;
  t = new ke({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].withErrors.header
      )
    }
  });
  let i = B(
    /*viewModel*/
    n[0].withErrors.rows
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = $n(wn(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("div"), A(t.$$.fragment);
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      h(e, "class", "section-container svelte-8opq0t");
    },
    m(o, a) {
      k(o, e, a), E(t, e, null);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(e, null);
      l = true;
    },
    p(o, a) {
      const c = {};
      if (a & /*viewModel*/
      1 && (c.viewModel = /*viewModel*/
      o[0].withErrors.header), t.$set(c), a & /*viewModel*/
      1) {
        i = B(
          /*viewModel*/
          o[0].withErrors.rows
        );
        let f;
        for (f = 0; f < i.length; f += 1) {
          const u = wn(o, i, f);
          s[f] ? (s[f].p(u, a), b(s[f], 1)) : (s[f] = $n(u), s[f].c(), b(s[f], 1), s[f].m(e, null));
        }
        for (U(), f = i.length; f < s.length; f += 1)
          r(f);
        X();
      }
    },
    i(o) {
      if (!l) {
        b(t.$$.fragment, o);
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      M(t.$$.fragment, o), s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && w(e), F(t), se(s, o);
    }
  };
}
function $n(n) {
  let e, t;
  return e = new ke({
    props: { viewModel: (
      /*rowViewModel*/
      n[10]
    ) }
  }), e.$on(
    "command",
    /*command_handler_1*/
    n[2]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*rowViewModel*/
      l[10]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Rn(n) {
  let e, t, l;
  t = new ke({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].onlyInLeft.header
      )
    }
  });
  let i = B(
    /*viewModel*/
    n[0].onlyInLeft.rows
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = Sn(bn(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("div"), A(t.$$.fragment);
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      h(e, "class", "section-container svelte-8opq0t");
    },
    m(o, a) {
      k(o, e, a), E(t, e, null);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(e, null);
      l = true;
    },
    p(o, a) {
      const c = {};
      if (a & /*viewModel*/
      1 && (c.viewModel = /*viewModel*/
      o[0].onlyInLeft.header), t.$set(c), a & /*viewModel*/
      1) {
        i = B(
          /*viewModel*/
          o[0].onlyInLeft.rows
        );
        let f;
        for (f = 0; f < i.length; f += 1) {
          const u = bn(o, i, f);
          s[f] ? (s[f].p(u, a), b(s[f], 1)) : (s[f] = Sn(u), s[f].c(), b(s[f], 1), s[f].m(e, null));
        }
        for (U(), f = i.length; f < s.length; f += 1)
          r(f);
        X();
      }
    },
    i(o) {
      if (!l) {
        b(t.$$.fragment, o);
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      M(t.$$.fragment, o), s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && w(e), F(t), se(s, o);
    }
  };
}
function Sn(n) {
  let e, t;
  return e = new ke({
    props: { viewModel: (
      /*rowViewModel*/
      n[10]
    ) }
  }), e.$on(
    "command",
    /*command_handler_2*/
    n[3]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*rowViewModel*/
      l[10]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function zn(n) {
  let e, t, l;
  t = new ke({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].onlyInRight.header
      )
    }
  });
  let i = B(
    /*viewModel*/
    n[0].onlyInRight.rows
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = Cn(_n(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("div"), A(t.$$.fragment);
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      h(e, "class", "section-container svelte-8opq0t");
    },
    m(o, a) {
      k(o, e, a), E(t, e, null);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(e, null);
      l = true;
    },
    p(o, a) {
      const c = {};
      if (a & /*viewModel*/
      1 && (c.viewModel = /*viewModel*/
      o[0].onlyInRight.header), t.$set(c), a & /*viewModel*/
      1) {
        i = B(
          /*viewModel*/
          o[0].onlyInRight.rows
        );
        let f;
        for (f = 0; f < i.length; f += 1) {
          const u = _n(o, i, f);
          s[f] ? (s[f].p(u, a), b(s[f], 1)) : (s[f] = Cn(u), s[f].c(), b(s[f], 1), s[f].m(e, null));
        }
        for (U(), f = i.length; f < s.length; f += 1)
          r(f);
        X();
      }
    },
    i(o) {
      if (!l) {
        b(t.$$.fragment, o);
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      M(t.$$.fragment, o), s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && w(e), F(t), se(s, o);
    }
  };
}
function Cn(n) {
  let e, t;
  return e = new ke({
    props: { viewModel: (
      /*rowViewModel*/
      n[10]
    ) }
  }), e.$on(
    "command",
    /*command_handler_3*/
    n[4]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*rowViewModel*/
      l[10]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function In(n) {
  let e, t, l;
  t = new ke({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].withDiffs.header
      )
    }
  });
  let i = B(
    /*viewModel*/
    n[0].withDiffs.rows
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = Tn(gn(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("div"), A(t.$$.fragment);
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      h(e, "class", "section-container svelte-8opq0t");
    },
    m(o, a) {
      k(o, e, a), E(t, e, null);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(e, null);
      l = true;
    },
    p(o, a) {
      const c = {};
      if (a & /*viewModel*/
      1 && (c.viewModel = /*viewModel*/
      o[0].withDiffs.header), t.$set(c), a & /*viewModel*/
      1) {
        i = B(
          /*viewModel*/
          o[0].withDiffs.rows
        );
        let f;
        for (f = 0; f < i.length; f += 1) {
          const u = gn(o, i, f);
          s[f] ? (s[f].p(u, a), b(s[f], 1)) : (s[f] = Tn(u), s[f].c(), b(s[f], 1), s[f].m(e, null));
        }
        for (U(), f = i.length; f < s.length; f += 1)
          r(f);
        X();
      }
    },
    i(o) {
      if (!l) {
        b(t.$$.fragment, o);
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      M(t.$$.fragment, o), s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && w(e), F(t), se(s, o);
    }
  };
}
function Tn(n) {
  let e, t;
  return e = new ke({
    props: { viewModel: (
      /*rowViewModel*/
      n[10]
    ) }
  }), e.$on(
    "command",
    /*command_handler_4*/
    n[5]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*rowViewModel*/
      l[10]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Dn(n) {
  let e, t, l;
  t = new ke({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].withoutDiffs.header
      )
    }
  });
  let i = B(
    /*viewModel*/
    n[0].withoutDiffs.rows
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = jn(vn(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("div"), A(t.$$.fragment);
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      h(e, "class", "section-container svelte-8opq0t");
    },
    m(o, a) {
      k(o, e, a), E(t, e, null);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(e, null);
      l = true;
    },
    p(o, a) {
      const c = {};
      if (a & /*viewModel*/
      1 && (c.viewModel = /*viewModel*/
      o[0].withoutDiffs.header), t.$set(c), a & /*viewModel*/
      1) {
        i = B(
          /*viewModel*/
          o[0].withoutDiffs.rows
        );
        let f;
        for (f = 0; f < i.length; f += 1) {
          const u = vn(o, i, f);
          s[f] ? (s[f].p(u, a), b(s[f], 1)) : (s[f] = jn(u), s[f].c(), b(s[f], 1), s[f].m(e, null));
        }
        for (U(), f = i.length; f < s.length; f += 1)
          r(f);
        X();
      }
    },
    i(o) {
      if (!l) {
        b(t.$$.fragment, o);
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      M(t.$$.fragment, o), s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && w(e), F(t), se(s, o);
    }
  };
}
function jn(n) {
  let e, t;
  return e = new ke({
    props: { viewModel: (
      /*rowViewModel*/
      n[10]
    ) }
  }), e.$on(
    "command",
    /*command_handler_5*/
    n[6]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*rowViewModel*/
      l[10]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Ln(n) {
  let e, t;
  return e = new ke({
    props: { viewModel: (
      /*rowViewModel*/
      n[10]
    ) }
  }), e.$on(
    "command",
    /*command_handler*/
    n[1]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*rowViewModel*/
      l[10]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Vn(n) {
  let e, t, l;
  t = new ke({
    props: {
      viewModel: (
        /*viewGroupViewModel*/
        n[7].header
      )
    }
  });
  let i = B(
    /*viewGroupViewModel*/
    n[7].rows
  ), s = [];
  for (let o = 0; o < i.length; o += 1)
    s[o] = Ln(yn(n, i, o));
  const r = (o) => M(s[o], 1, 1, () => {
    s[o] = null;
  });
  return {
    c() {
      e = p("div"), A(t.$$.fragment);
      for (let o = 0; o < s.length; o += 1)
        s[o].c();
      h(e, "class", "section-container svelte-8opq0t");
    },
    m(o, a) {
      k(o, e, a), E(t, e, null);
      for (let c = 0; c < s.length; c += 1)
        s[c] && s[c].m(e, null);
      l = true;
    },
    p(o, a) {
      const c = {};
      if (a & /*viewModel*/
      1 && (c.viewModel = /*viewGroupViewModel*/
      o[7].header), t.$set(c), a & /*viewModel*/
      1) {
        i = B(
          /*viewGroupViewModel*/
          o[7].rows
        );
        let f;
        for (f = 0; f < i.length; f += 1) {
          const u = yn(o, i, f);
          s[f] ? (s[f].p(u, a), b(s[f], 1)) : (s[f] = Ln(u), s[f].c(), b(s[f], 1), s[f].m(e, null));
        }
        for (U(), f = i.length; f < s.length; f += 1)
          r(f);
        X();
      }
    },
    i(o) {
      if (!l) {
        b(t.$$.fragment, o);
        for (let a = 0; a < i.length; a += 1)
          b(s[a]);
        l = true;
      }
    },
    o(o) {
      M(t.$$.fragment, o), s = s.filter(Boolean);
      for (let a = 0; a < s.length; a += 1)
        M(s[a]);
      l = false;
    },
    d(o) {
      o && w(e), F(t), se(s, o);
    }
  };
}
function hr(n) {
  let e, t, l, i, s;
  const r = [mr, dr], o = [];
  function a(c, f) {
    return (
      /*viewModel*/
      c[0].kind === "views" ? 0 : 1
    );
  }
  return t = a(n), l = o[t] = r[t](n), {
    c() {
      e = p("div"), l.c(), i = p("div"), h(i, "class", "footer svelte-8opq0t"), h(e, "class", "comparison-summary-container svelte-8opq0t");
    },
    m(c, f) {
      k(c, e, f), o[t].m(e, null), _(e, i), s = true;
    },
    p(c, [f]) {
      let u = t;
      t = a(c), t === u ? o[t].p(c, f) : (U(), M(o[u], 1, 1, () => {
        o[u] = null;
      }), X(), l = o[t], l ? l.p(c, f) : (l = o[t] = r[t](c), l.c()), b(l, 1), l.m(e, i));
    },
    i(c) {
      s || (b(l), s = true);
    },
    o(c) {
      M(l), s = false;
    },
    d(c) {
      c && w(e), o[t].d();
    }
  };
}
function pr(n, e, t) {
  let { viewModel: l } = e;
  function i(f) {
    he.call(this, n, f);
  }
  function s(f) {
    he.call(this, n, f);
  }
  function r(f) {
    he.call(this, n, f);
  }
  function o(f) {
    he.call(this, n, f);
  }
  function a(f) {
    he.call(this, n, f);
  }
  function c(f) {
    he.call(this, n, f);
  }
  return n.$$set = (f) => {
    "viewModel" in f && t(0, l = f.viewModel);
  }, [
    l,
    i,
    s,
    r,
    o,
    a,
    c
  ];
}
var Lt = class extends re {
  constructor(e) {
    super(), oe(this, e, pr, hr, te, { viewModel: 0 }, ur);
  }
};
function vr(n) {
  ce(n, "svelte-1eev7sk", "td.svelte-1eev7sk{padding:0;height:1.8rem}.name.svelte-1eev7sk{padding-right:3rem;max-width:20rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row-header{color:#aaa}.cell.svelte-1eev7sk{display:flex;width:100%;flex-direction:row;align-items:baseline;font-family:monospace}.cell.dim.svelte-1eev7sk{color:#777}.value.svelte-1eev7sk{flex:1;padding-right:0.4rem;text-align:right}.change.svelte-1eev7sk{flex:1;padding-left:0.4rem;text-align:left;font-size:0.8em}.plot.svelte-1eev7sk{width:12rem;padding-left:2rem;padding-right:2rem;cursor:pointer}");
}
function xn(n) {
  let e, t, l, i, s;
  return t = new Mt({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].dotPlot
      ),
      colorClass: (
        /*modelBgClass*/
        n[2]
      )
    }
  }), {
    c() {
      e = p("td"), A(t.$$.fragment), h(e, "class", "plot svelte-1eev7sk");
    },
    m(r, o) {
      k(r, e, o), E(t, e, null), l = true, i || (s = ne(
        e,
        "click",
        /*onShowPerf*/
        n[3]
      ), i = true);
    },
    p(r, o) {
      const a = {};
      o & /*viewModel*/
      1 && (a.viewModel = /*viewModel*/
      r[0].dotPlot), t.$set(a);
    },
    i(r) {
      l || (b(t.$$.fragment, r), l = true);
    },
    o(r) {
      M(t.$$.fragment, r), l = false;
    },
    d(r) {
      r && w(e), F(t), i = false, s();
    }
  };
}
function gr(n) {
  let e, t = (
    /*viewModel*/
    n[0].modelName + ""
  ), l, i, s, r, o = (
    /*viewModel*/
    n[0].inputs + ""
  ), a, c, f, u, d, m = (
    /*viewModel*/
    n[0].outputs + ""
  ), g, v, y, R, $, C = (
    /*viewModel*/
    n[0].modelSize + ""
  ), I, D, V = (
    /*viewModel*/
    n[0].modelSizePctChange + ""
  ), q, S, j, x, T = (
    /*viewModel*/
    n[0].dataSize + ""
  ), z, N, H = (
    /*viewModel*/
    n[0].dataSizePctChange + ""
  ), G, Y, J, L, O = (
    /*viewModel*/
    n[0].avgTime + ""
  ), Z, Q, ae = (
    /*viewModel*/
    n[0].avgTimePctChange + ""
  ), ge, _e, ye, Xe, Ze = (
    /*viewModel*/
    n[0].minTime + ""
  ), dt, mt, Fe, He, Je, Qe = (
    /*viewModel*/
    n[0].maxTime + ""
  ), ht, pt, Ae, pe, me = (
    /*viewModel*/
    n[0].dotPlot && xn(n)
  );
  return {
    c() {
      e = p("td"), l = P(t), i = p("td"), s = p("div"), r = p("div"), a = P(o), c = p("div"), f = p("td"), u = p("div"), d = p("div"), g = P(m), v = p("div"), y = p("td"), R = p("div"), $ = p("div"), I = P(C), D = p("div"), q = P(V), S = p("td"), j = p("div"), x = p("div"), z = P(T), N = p("div"), G = P(H), Y = p("td"), J = p("div"), L = p("div"), Z = P(O), Q = p("div"), ge = P(ae), _e = p("td"), ye = p("div"), Xe = p("div"), dt = P(Ze), mt = p("div"), Fe = p("td"), He = p("div"), Je = p("div"), ht = P(Qe), pt = p("div"), me && me.c(), Ae = ee(), h(e, "class", "name " + /*modelTextClass*/
      n[1] + " svelte-1eev7sk"), h(r, "class", "value svelte-1eev7sk"), h(c, "class", "change svelte-1eev7sk"), h(s, "class", "cell svelte-1eev7sk"), h(i, "class", "svelte-1eev7sk"), h(d, "class", "value svelte-1eev7sk"), h(v, "class", "change svelte-1eev7sk"), h(u, "class", "cell svelte-1eev7sk"), h(f, "class", "svelte-1eev7sk"), h($, "class", "value svelte-1eev7sk"), h(D, "class", "change svelte-1eev7sk"), h(R, "class", "cell svelte-1eev7sk"), h(y, "class", "svelte-1eev7sk"), h(x, "class", "value svelte-1eev7sk"), h(N, "class", "change svelte-1eev7sk"), h(j, "class", "cell svelte-1eev7sk"), h(S, "class", "svelte-1eev7sk"), h(L, "class", "value svelte-1eev7sk"), h(Q, "class", "change svelte-1eev7sk"), h(J, "class", "cell svelte-1eev7sk"), h(Y, "class", "svelte-1eev7sk"), h(Xe, "class", "value svelte-1eev7sk"), h(mt, "class", "change svelte-1eev7sk"), h(ye, "class", "cell dim svelte-1eev7sk"), h(_e, "class", "svelte-1eev7sk"), h(Je, "class", "value svelte-1eev7sk"), h(pt, "class", "change svelte-1eev7sk"), h(He, "class", "cell dim svelte-1eev7sk"), h(Fe, "class", "svelte-1eev7sk");
    },
    m(le, fe) {
      k(le, e, fe), _(e, l), k(le, i, fe), _(i, s), _(s, r), _(r, a), _(s, c), k(le, f, fe), _(f, u), _(u, d), _(d, g), _(u, v), k(le, y, fe), _(y, R), _(R, $), _($, I), _(R, D), _(D, q), k(le, S, fe), _(S, j), _(j, x), _(x, z), _(j, N), _(N, G), k(le, Y, fe), _(Y, J), _(J, L), _(L, Z), _(J, Q), _(Q, ge), k(le, _e, fe), _(_e, ye), _(ye, Xe), _(Xe, dt), _(ye, mt), k(le, Fe, fe), _(Fe, He), _(He, Je), _(Je, ht), _(He, pt), me && me.m(le, fe), k(le, Ae, fe), pe = true;
    },
    p(le, [fe]) {
      (!pe || fe & /*viewModel*/
      1) && t !== (t = /*viewModel*/
      le[0].modelName + "") && W(l, t), (!pe || fe & /*viewModel*/
      1) && o !== (o = /*viewModel*/
      le[0].inputs + "") && W(a, o), (!pe || fe & /*viewModel*/
      1) && m !== (m = /*viewModel*/
      le[0].outputs + "") && W(g, m), (!pe || fe & /*viewModel*/
      1) && C !== (C = /*viewModel*/
      le[0].modelSize + "") && W(I, C), (!pe || fe & /*viewModel*/
      1) && V !== (V = /*viewModel*/
      le[0].modelSizePctChange + "") && W(q, V), (!pe || fe & /*viewModel*/
      1) && T !== (T = /*viewModel*/
      le[0].dataSize + "") && W(z, T), (!pe || fe & /*viewModel*/
      1) && H !== (H = /*viewModel*/
      le[0].dataSizePctChange + "") && W(G, H), (!pe || fe & /*viewModel*/
      1) && O !== (O = /*viewModel*/
      le[0].avgTime + "") && W(Z, O), (!pe || fe & /*viewModel*/
      1) && ae !== (ae = /*viewModel*/
      le[0].avgTimePctChange + "") && W(ge, ae), (!pe || fe & /*viewModel*/
      1) && Ze !== (Ze = /*viewModel*/
      le[0].minTime + "") && W(dt, Ze), (!pe || fe & /*viewModel*/
      1) && Qe !== (Qe = /*viewModel*/
      le[0].maxTime + "") && W(ht, Qe), /*viewModel*/
      le[0].dotPlot ? me ? (me.p(le, fe), fe & /*viewModel*/
      1 && b(me, 1)) : (me = xn(le), me.c(), b(me, 1), me.m(Ae.parentNode, Ae)) : me && (U(), M(me, 1, 1, () => {
        me = null;
      }), X());
    },
    i(le) {
      pe || (b(me), pe = true);
    },
    o(le) {
      M(me), pe = false;
    },
    d(le) {
      le && (w(e), w(i), w(f), w(y), w(S), w(Y), w(_e), w(Fe), w(Ae)), me && me.d(le);
    }
  };
}
function _r(n, e, t) {
  let { viewModel: l } = e;
  const i = l.datasetClassIndex, s = i !== void 0 ? `dataset-color-${i}` : "row-header", r = i !== void 0 ? `dataset-bg-${i}` : "", o = Ie();
  function a() {
    o("command", { cmd: "show-perf" });
  }
  return n.$$set = (c) => {
    "viewModel" in c && t(0, l = c.viewModel);
  }, [l, s, r, a];
}
var gt2 = class extends re {
  constructor(e) {
    super(), oe(this, e, _r, gr, te, { viewModel: 0 }, vr);
  }
};
function br(n) {
  ce(n, "svelte-18acnq2", "table.svelte-18acnq2{border-collapse:collapse}th.svelte-18acnq2{color:#aaa;text-align:left;font-family:Roboto;font-weight:500}th.dim.svelte-18acnq2{color:#555}th.svelte-18acnq2:nth-child(2),th.svelte-18acnq2:nth-child(3){width:6rem}th.svelte-18acnq2:nth-child(4),th.svelte-18acnq2:nth-child(5){width:10rem}th.svelte-18acnq2:nth-child(6){width:8rem}th.svelte-18acnq2:nth-child(7),th.svelte-18acnq2:nth-child(8){width:8rem}");
}
function wr(n) {
  let e, t, l, i, s, r, o, a, c;
  return i = new gt2({
    props: { viewModel: (
      /*viewModel*/
      n[0].row1
    ) }
  }), i.$on(
    "command",
    /*command_handler*/
    n[1]
  ), r = new gt2({
    props: { viewModel: (
      /*viewModel*/
      n[0].row2
    ) }
  }), r.$on(
    "command",
    /*command_handler_1*/
    n[2]
  ), a = new gt2({
    props: { viewModel: (
      /*viewModel*/
      n[0].row3
    ) }
  }), a.$on(
    "command",
    /*command_handler_2*/
    n[3]
  ), {
    c() {
      e = p("table"), t = p("tr"), t.innerHTML = '<th class="svelte-18acnq2"></th><th class="svelte-18acnq2">inputs</th><th class="svelte-18acnq2">outputs</th><th class="svelte-18acnq2">model size (bytes)</th><th class="svelte-18acnq2">data size (bytes)</th><th class="svelte-18acnq2">avg time (ms)</th><th class="dim svelte-18acnq2">min time (ms)</th><th class="dim svelte-18acnq2">max time (ms)</th><th class="svelte-18acnq2"></th>', l = p("tr"), A(i.$$.fragment), s = p("tr"), A(r.$$.fragment), o = p("tr"), A(a.$$.fragment), h(e, "class", "header svelte-18acnq2");
    },
    m(f, u) {
      k(f, e, u), _(e, t), _(e, l), E(i, l, null), _(e, s), E(r, s, null), _(e, o), E(a, o, null), c = true;
    },
    p(f, [u]) {
      const d = {};
      u & /*viewModel*/
      1 && (d.viewModel = /*viewModel*/
      f[0].row1), i.$set(d);
      const m = {};
      u & /*viewModel*/
      1 && (m.viewModel = /*viewModel*/
      f[0].row2), r.$set(m);
      const g = {};
      u & /*viewModel*/
      1 && (g.viewModel = /*viewModel*/
      f[0].row3), a.$set(g);
    },
    i(f) {
      c || (b(i.$$.fragment, f), b(r.$$.fragment, f), b(a.$$.fragment, f), c = true);
    },
    o(f) {
      M(i.$$.fragment, f), M(r.$$.fragment, f), M(a.$$.fragment, f), c = false;
    },
    d(f) {
      f && w(e), F(i), F(r), F(a);
    }
  };
}
function kr(n, e, t) {
  let { viewModel: l } = e;
  function i(o) {
    he.call(this, n, o);
  }
  function s(o) {
    he.call(this, n, o);
  }
  function r(o) {
    he.call(this, n, o);
  }
  return n.$$set = (o) => {
    "viewModel" in o && t(0, l = o.viewModel);
  }, [l, i, s, r];
}
var yr = class extends re {
  constructor(e) {
    super(), oe(this, e, kr, wr, te, { viewModel: 0 }, br);
  }
};
function Mr(n) {
  ce(n, "svelte-gl55w2", ".tab-bar.svelte-gl55w2{position:sticky;top:0;display:flex;flex-direction:row;gap:3rem;background-color:#272727;z-index:1000;margin:0 -1rem;padding:0 1rem;box-shadow:0 1rem 0.5rem -0.5rem rgba(0, 0, 0, 0.8)}.tab-item.svelte-gl55w2{display:flex;flex-direction:column;padding:0.5rem 3rem 0.3rem 0;cursor:pointer;opacity:0.7;border-bottom:solid 1px transparent}.tab-item.svelte-gl55w2:hover{opacity:1}.tab-item.selected.svelte-gl55w2{opacity:1;border-bottom:solid 1px #555}.tab-title.svelte-gl55w2{font-size:1.6rem;font-weight:700;color:#fff;margin-bottom:0.2rem;cursor:pointer}.tab-subtitle.svelte-gl55w2{font-size:1rem;font-weight:400}");
}
function Nn(n, e, t) {
  const l = n.slice();
  return l[8] = e[t], l[10] = t, l;
}
function Pn(n) {
  let e, t, l = (
    /*item*/
    n[8].title + ""
  ), i, s, r = (
    /*item*/
    n[8].subtitle + ""
  ), o, a, c, f;
  function u() {
    return (
      /*click_handler*/
      n[6](
        /*index*/
        n[10]
      )
    );
  }
  return {
    c() {
      e = p("div"), t = p("div"), i = P(l), s = p("div"), o = P(r), h(t, "class", "tab-title svelte-gl55w2"), h(s, "class", a = "tab-subtitle " + /*item*/
      n[8].subtitleClass + " svelte-gl55w2"), h(e, "class", "tab-item svelte-gl55w2"), de(
        e,
        "selected",
        /*item*/
        n[8].id === /*$selectedItemId*/
        n[1]
      );
    },
    m(d, m) {
      k(d, e, m), _(e, t), _(t, i), _(e, s), _(s, o), c || (f = ne(e, "click", u), c = true);
    },
    p(d, m) {
      n = d, m & /*viewModel*/
      1 && l !== (l = /*item*/
      n[8].title + "") && W(i, l), m & /*viewModel*/
      1 && r !== (r = /*item*/
      n[8].subtitle + "") && W(o, r), m & /*viewModel*/
      1 && a !== (a = "tab-subtitle " + /*item*/
      n[8].subtitleClass + " svelte-gl55w2") && h(s, "class", a), m & /*viewModel, $selectedItemId*/
      3 && de(
        e,
        "selected",
        /*item*/
        n[8].id === /*$selectedItemId*/
        n[1]
      );
    },
    d(d) {
      d && w(e), c = false, f();
    }
  };
}
function $r(n) {
  let e, t, l, i = B(
    /*viewModel*/
    n[0].items
  ), s = [];
  for (let r = 0; r < i.length; r += 1)
    s[r] = Pn(Nn(n, i, r));
  return {
    c() {
      e = p("div");
      for (let r = 0; r < s.length; r += 1)
        s[r].c();
      h(e, "class", "tab-bar svelte-gl55w2");
    },
    m(r, o) {
      k(r, e, o);
      for (let a = 0; a < s.length; a += 1)
        s[a] && s[a].m(e, null);
      t || (l = [
        ne(
          window,
          "keydown",
          /*onKeyDown*/
          n[4]
        ),
        ne(
          e,
          "command",
          /*command_handler*/
          n[5]
        )
      ], t = true);
    },
    p(r, [o]) {
      if (o & /*viewModel, $selectedItemId, onItemClicked*/
      11) {
        i = B(
          /*viewModel*/
          r[0].items
        );
        let a;
        for (a = 0; a < i.length; a += 1) {
          const c = Nn(r, i, a);
          s[a] ? s[a].p(c, o) : (s[a] = Pn(c), s[a].c(), s[a].m(e, null));
        }
        for (; a < s.length; a += 1)
          s[a].d(1);
        s.length = i.length;
      }
    },
    i: K,
    o: K,
    d(r) {
      r && w(e), se(s, r), t = false, we(l);
    }
  };
}
function Rr(n, e, t) {
  let l, { viewModel: i } = e;
  const s = i.selectedItemId;
  ve(n, s, (u) => t(1, l = u));
  const r = Ie();
  function o(u) {
    i.selectedIndex.set(u);
  }
  function a(u) {
    u.key === "ArrowLeft" ? (i.selectedIndex.update((d) => d > 0 ? d - 1 : d), u.preventDefault()) : u.key === "ArrowRight" ? (i.selectedIndex.update((d) => d < i.items.length - 1 ? d + 1 : d), u.preventDefault()) : u.key === "ArrowDown" && (r("command", {
      cmd: "enter-tab",
      itemId: l
    }), u.preventDefault());
  }
  function c(u) {
    he.call(this, n, u);
  }
  const f = (u) => o(u);
  return n.$$set = (u) => {
    "viewModel" in u && t(0, i = u.viewModel);
  }, [
    i,
    l,
    s,
    o,
    a,
    c,
    f
  ];
}
var Sr = class extends re {
  constructor(e) {
    super(), oe(this, e, Rr, $r, te, { viewModel: 0 }, Mr);
  }
};
function zr(n) {
  ce(n, "svelte-hf3w0v", ".summary-container.svelte-hf3w0v{display:flex;flex-direction:column;flex:1}.scroll-container.svelte-hf3w0v{position:relative;display:flex;flex:1 1 1px;flex-direction:column;padding:0 1rem;overflow:auto}.header-container.svelte-hf3w0v{margin-bottom:1rem}.line.svelte-hf3w0v{min-height:1px;margin-bottom:0.5rem;background-color:#555}");
}
function qn(n) {
  let e, t, l, i;
  return t = new yr({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].statsTableViewModel
      )
    }
  }), t.$on(
    "command",
    /*command_handler*/
    n[3]
  ), {
    c() {
      e = p("div"), A(t.$$.fragment), l = p("div"), h(e, "class", "header-container svelte-hf3w0v"), h(l, "class", "line svelte-hf3w0v");
    },
    m(s, r) {
      k(s, e, r), E(t, e, null), k(s, l, r), i = true;
    },
    p(s, r) {
      const o = {};
      r & /*viewModel*/
      1 && (o.viewModel = /*viewModel*/
      s[0].statsTableViewModel), t.$set(o);
    },
    i(s) {
      i || (b(t.$$.fragment, s), i = true);
    },
    o(s) {
      M(t.$$.fragment, s), i = false;
    },
    d(s) {
      s && (w(e), w(l)), F(t);
    }
  };
}
function Cr(n) {
  let e, t;
  return e = new Lt({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].comparisonsByDatasetSummaryViewModel
      )
    }
  }), e.$on(
    "command",
    /*command_handler_4*/
    n[7]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*viewModel*/
      l[0].comparisonsByDatasetSummaryViewModel), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Ir(n) {
  let e, t;
  return e = new Lt({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].comparisonsByScenarioSummaryViewModel
      )
    }
  }), e.$on(
    "command",
    /*command_handler_3*/
    n[6]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*viewModel*/
      l[0].comparisonsByScenarioSummaryViewModel), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Tr(n) {
  let e, t;
  return e = new Lt({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].comparisonViewsSummaryViewModel
      )
    }
  }), e.$on(
    "command",
    /*command_handler_2*/
    n[5]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*viewModel*/
      l[0].comparisonViewsSummaryViewModel), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Dr(n) {
  let e, t;
  return e = new nr({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].checkSummaryViewModel
      )
    }
  }), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*viewModel*/
      l[0].checkSummaryViewModel), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function jr(n) {
  let e, t, l, i, s, r, o, a = (
    /*viewModel*/
    n[0].statsTableViewModel && qn(n)
  );
  i = new Sr({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].tabBarViewModel
      )
    }
  }), i.$on(
    "command",
    /*command_handler_1*/
    n[4]
  );
  const c = [Dr, Tr, Ir, Cr], f = [];
  function u(d, m) {
    return (
      /*$selectedTabId*/
      d[1] === "checks" ? 0 : (
        /*$selectedTabId*/
        d[1] === "comp-views" ? 1 : (
          /*$selectedTabId*/
          d[1] === "comps-by-scenario" ? 2 : (
            /*$selectedTabId*/
            d[1] === "comps-by-dataset" ? 3 : -1
          )
        )
      )
    );
  }
  return ~(s = u(n)) && (r = f[s] = c[s](n)), {
    c() {
      e = p("div"), t = p("div"), a && a.c(), l = ee(), A(i.$$.fragment), r && r.c(), h(t, "class", "scroll-container svelte-hf3w0v"), h(e, "class", "summary-container svelte-hf3w0v");
    },
    m(d, m) {
      k(d, e, m), _(e, t), a && a.m(t, null), _(t, l), E(i, t, null), ~s && f[s].m(t, null), o = true;
    },
    p(d, [m]) {
      d[0].statsTableViewModel ? a ? (a.p(d, m), m & /*viewModel*/
      1 && b(a, 1)) : (a = qn(d), a.c(), b(a, 1), a.m(t, l)) : a && (U(), M(a, 1, 1, () => {
        a = null;
      }), X());
      const g = {};
      m & /*viewModel*/
      1 && (g.viewModel = /*viewModel*/
      d[0].tabBarViewModel), i.$set(g);
      let v = s;
      s = u(d), s === v ? ~s && f[s].p(d, m) : (r && (U(), M(f[v], 1, 1, () => {
        f[v] = null;
      }), X()), ~s ? (r = f[s], r ? r.p(d, m) : (r = f[s] = c[s](d), r.c()), b(r, 1), r.m(t, null)) : r = null);
    },
    i(d) {
      o || (b(a), b(i.$$.fragment, d), b(r), o = true);
    },
    o(d) {
      M(a), M(i.$$.fragment, d), M(r), o = false;
    },
    d(d) {
      d && w(e), a && a.d(), F(i), ~s && f[s].d();
    }
  };
}
function Lr(n, e, t) {
  let l, { viewModel: i } = e;
  const s = i.tabBarViewModel.selectedItemId;
  ve(n, s, (u) => t(1, l = u));
  function r(u) {
    he.call(this, n, u);
  }
  function o(u) {
    he.call(this, n, u);
  }
  function a(u) {
    he.call(this, n, u);
  }
  function c(u) {
    he.call(this, n, u);
  }
  function f(u) {
    he.call(this, n, u);
  }
  return n.$$set = (u) => {
    "viewModel" in u && t(0, i = u.viewModel);
  }, [
    i,
    l,
    s,
    r,
    o,
    a,
    c,
    f
  ];
}
var Vr = class extends re {
  constructor(e) {
    super(), oe(this, e, Lr, jr, te, { viewModel: 0 }, zr);
  }
};
function xr(n) {
  ce(n, "svelte-1ul5lao", ".app-container.svelte-1ul5lao{display:flex;flex-direction:column;flex:1}.loading-container.svelte-1ul5lao{display:flex;flex-direction:column;flex:1 1 auto;align-items:center;justify-content:center}.progress-container.svelte-1ul5lao{display:flex;height:100vh;align-items:center;justify-content:center;font-size:2em}");
}
function Nr(n) {
  return {
    c: K,
    m: K,
    p: K,
    i: K,
    o: K,
    d: K
  };
}
function Pr(n) {
  let e, t, l, i, s;
  t = new $o({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].headerViewModel
      )
    }
  }), t.$on(
    "command",
    /*onCommand*/
    n[11]
  );
  const r = [Er, Br, Kr, qr], o = [];
  function a(c, f) {
    return (
      /*$checksInProgress*/
      c[6] ? 0 : (
        /*viewMode*/
        c[3] === "comparison-detail" ? 1 : (
          /*viewMode*/
          c[3] === "perf" ? 2 : 3
        )
      )
    );
  }
  return l = a(n), i = o[l] = r[l](n), {
    c() {
      e = p("div"), A(t.$$.fragment), i.c(), h(e, "class", "app-container svelte-1ul5lao"), h(
        e,
        "style",
        /*appStyle*/
        n[5]
      );
    },
    m(c, f) {
      k(c, e, f), E(t, e, null), o[l].m(e, null), s = true;
    },
    p(c, f) {
      const u = {};
      f & /*viewModel*/
      1 && (u.viewModel = /*viewModel*/
      c[0].headerViewModel), t.$set(u);
      let d = l;
      l = a(c), l === d ? o[l].p(c, f) : (U(), M(o[d], 1, 1, () => {
        o[d] = null;
      }), X(), i = o[l], i ? i.p(c, f) : (i = o[l] = r[l](c), i.c()), b(i, 1), i.m(e, null)), (!s || f & /*appStyle*/
      32) && h(
        e,
        "style",
        /*appStyle*/
        c[5]
      );
    },
    i(c) {
      s || (b(t.$$.fragment, c), b(i), s = true);
    },
    o(c) {
      M(t.$$.fragment, c), M(i), s = false;
    },
    d(c) {
      c && w(e), F(t), o[l].d();
    }
  };
}
function qr(n) {
  let e, t;
  return e = new Vr({
    props: {
      viewModel: (
        /*viewModel*/
        n[0].summaryViewModel
      )
    }
  }), e.$on(
    "command",
    /*onCommand*/
    n[11]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*viewModel*/
      1 && (s.viewModel = /*viewModel*/
      l[0].summaryViewModel), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Kr(n) {
  let e, t;
  return e = new Lo({
    props: { viewModel: (
      /*perfViewModel*/
      n[2]
    ) }
  }), e.$on(
    "command",
    /*onCommand*/
    n[11]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*perfViewModel*/
      4 && (s.viewModel = /*perfViewModel*/
      l[2]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Br(n) {
  let e, t;
  return e = new eo({
    props: {
      viewModel: (
        /*compareDetailViewModel*/
        n[1]
      )
    }
  }), e.$on(
    "command",
    /*onCommand*/
    n[11]
  ), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*compareDetailViewModel*/
      2 && (s.viewModel = /*compareDetailViewModel*/
      l[1]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Er(n) {
  let e, t, l;
  return {
    c() {
      e = p("div"), t = p("div"), l = P(
        /*$progress*/
        n[7]
      ), h(t, "class", "progress"), h(e, "class", "progress-container svelte-1ul5lao");
    },
    m(i, s) {
      k(i, e, s), _(e, t), _(t, l);
    },
    p(i, s) {
      s & /*$progress*/
      128 && W(
        l,
        /*$progress*/
        i[7]
      );
    },
    i: K,
    o: K,
    d(i) {
      i && w(e);
    }
  };
}
function Fr(n) {
  let e;
  return {
    c() {
      e = p("div"), h(e, "class", "loading-container svelte-1ul5lao");
    },
    m(t, l) {
      k(t, e, l);
    },
    p: K,
    i: K,
    o: K,
    d(t) {
      t && w(e);
    }
  };
}
function Hr(n) {
  let e, t, l, i, s, r = {
    ctx: n,
    current: null,
    token: null,
    hasCatch: false,
    pending: Fr,
    then: Pr,
    catch: Nr,
    value: 17,
    blocks: [, , ,]
  };
  return Nt(t = /*viewReady*/
  n[4], r), {
    c() {
      e = ee(), r.block.c();
    },
    m(o, a) {
      k(o, e, a), r.block.m(o, r.anchor = a), r.mount = () => e.parentNode, r.anchor = e, l = true, i || (s = ne(
        window,
        "keydown",
        /*onKeyDown*/
        n[12]
      ), i = true);
    },
    p(o, [a]) {
      n = o, r.ctx = n, a & /*viewReady*/
      16 && t !== (t = /*viewReady*/
      n[4]) && Nt(t, r) || Bi(r, n, a);
    },
    i(o) {
      l || (b(r.block), l = true);
    },
    o(o) {
      for (let a = 0; a < 3; a += 1) {
        const c = r.blocks[a];
        M(c);
      }
      l = false;
    },
    d(o) {
      o && w(e), r.block.d(o), r.token = null, r = null, i = false, s();
    }
  };
}
function Ar(n, e, t) {
  let l, i, s, r, { viewModel: o } = e;
  const a = o.checksInProgress;
  ve(n, a, (I) => t(6, s = I));
  const c = o.progress;
  ve(n, c, (I) => t(7, r = I));
  const f = o.headerViewModel.zoom;
  ve(n, f, (I) => t(14, i = I));
  let u, d, m = "summary";
  const g = new import_fontfaceobserver.default("Roboto Condensed", { weight: 400 });
  let v = false;
  g.load().then(() => {
    t(13, v = true);
  });
  let y = false;
  function R() {
    t(1, u = void 0), t(3, m = "summary");
  }
  function $(I) {
    const D = I.detail, V = D.cmd;
    switch (V) {
      case "show-summary":
        R();
        break;
      case "enter-tab":
        if (D.itemId !== "checks") {
          let q;
          switch (D.itemId) {
            case "comp-views":
              q = "views";
              break;
            case "comps-by-scenario":
              q = "by-scenario";
              break;
            case "comps-by-dataset":
              q = "by-dataset";
              break;
            default:
              return;
          }
          const S = o.createCompareDetailViewModelForFirstSummaryRow(q);
          S && (t(1, u = S), t(3, m = "comparison-detail"));
        }
        break;
      case "show-comparison-detail":
        t(1, u = o.createCompareDetailViewModelForSummaryRow(D.summaryRow)), t(3, m = "comparison-detail");
        break;
      case "show-comparison-detail-for-previous":
      case "show-comparison-detail-for-next": {
        const q = V === "show-comparison-detail-for-previous" ? -1 : 1, S = o.createCompareDetailViewModelForSummaryRowWithDelta(D.kind, D.summaryRowKey, q);
        S && (t(1, u = S), t(3, m = "comparison-detail"));
        break;
      }
      case "show-perf":
        d || t(2, d = o.createPerfViewModel()), t(3, m = "perf");
        break;
      default:
        console.error(`ERROR: Unhandled command ${V}`);
        break;
    }
  }
  function C(I) {
    if (!(I.altKey || I.ctrlKey || I.metaKey || I.shiftKey || I.isComposing))
      switch (I.key) {
        case "c":
          o.headerViewModel.controlsVisible.update((D) => !D), I.preventDefault();
          break;
        case "h":
          R(), I.preventDefault();
          break;
      }
  }
  return n.$$set = (I) => {
    "viewModel" in I && t(0, o = I.viewModel);
  }, n.$$.update = () => {
    n.$$.dirty & /*$zoom*/
    16384 && t(5, l = `--graph-zoom: ${i}`), n.$$.dirty & /*graphFontReady, viewModel*/
    8193 && v && (t(4, y = true), o.runTestSuite());
  }, [
    o,
    u,
    d,
    m,
    y,
    l,
    s,
    r,
    a,
    c,
    f,
    $,
    C,
    v,
    i
  ];
}
var Gr = class extends re {
  constructor(e) {
    super(), oe(this, e, Ar, Hr, te, { viewModel: 0 }, xr);
  }
};
function Kn(n) {
  let e, t;
  return e = new Gr({
    props: { viewModel: (
      /*appViewModel*/
      n[0]
    ) }
  }), {
    c() {
      A(e.$$.fragment);
    },
    m(l, i) {
      E(e, l, i), t = true;
    },
    p(l, i) {
      const s = {};
      i & /*appViewModel*/
      1 && (s.viewModel = /*appViewModel*/
      l[0]), e.$set(s);
    },
    i(l) {
      t || (b(e.$$.fragment, l), t = true);
    },
    o(l) {
      M(e.$$.fragment, l), t = false;
    },
    d(l) {
      F(e, l);
    }
  };
}
function Wr(n) {
  let e, t, l = (
    /*appViewModel*/
    n[0] && Kn(n)
  );
  return {
    c() {
      l && l.c(), e = ee();
    },
    m(i, s) {
      l && l.m(i, s), k(i, e, s), t = true;
    },
    p(i, [s]) {
      i[0] ? l ? (l.p(i, s), s & /*appViewModel*/
      1 && b(l, 1)) : (l = Kn(i), l.c(), b(l, 1), l.m(e.parentNode, e)) : l && (U(), M(l, 1, 1, () => {
        l = null;
      }), X());
    },
    i(i) {
      t || (b(l), t = true);
    },
    o(i) {
      M(l), t = false;
    },
    d(i) {
      i && w(e), l && l.d(i);
    }
  };
}
function Yr(n, e, t) {
  let { appViewModel: l } = e;
  return n.$$set = (i) => {
    "appViewModel" in i && t(0, l = i.appViewModel);
  }, [l];
}
var Or = class extends re {
  constructor(e) {
    super(), oe(this, e, Yr, Wr, te, { appViewModel: 0 });
  }
};
function Ur(n, e) {
  const t = localStorage.getItem(n);
  let l;
  if (t !== null) {
    const c = parseFloat(t);
    l = isNaN(c) ? e : c;
  } else
    l = e;
  let i = l;
  const { subscribe: s, set: r } = ue(l), o = (c) => {
    i = c, localStorage.setItem(n, c.toString()), r(c);
  };
  return {
    subscribe: s,
    set: o,
    update: (c) => {
      o(c(i));
    }
  };
}
function Bn(n, e) {
  const t = localStorage.getItem(n);
  let l;
  t !== null ? l = t === "1" : l = e;
  let i = l;
  const { subscribe: s, set: r } = ue(l), o = (c) => {
    i = c, localStorage.setItem(n, c ? "1" : "0"), r(c);
  };
  return {
    subscribe: s,
    set: o,
    update: (c) => {
      o(c(i));
    }
  };
}
var _t = class {
  constructor() {
    this.itemStates = /* @__PURE__ */ new Map(), this.writableOrderedKeys = ue([]), this.orderedKeys = this.writableOrderedKeys;
  }
  getPinned(e) {
    return Ge(e), this.getWritableItemState(e);
  }
  getWritableItemState(e) {
    Ge(e);
    let t = this.itemStates.get(e);
    return t === void 0 && (t = ue(false), this.itemStates.set(e, t)), t;
  }
  toggleItemPinned(e) {
    Ge(e);
    const t = this.getWritableItemState(e);
    Ce(t) ? (t.set(false), this.removePinnedItem(e)) : (t.set(true), this.addPinnedItem(e));
  }
  addPinnedItem(e) {
    this.writableOrderedKeys.update((t) => (t.push(e), t));
  }
  removePinnedItem(e) {
    this.writableOrderedKeys.update((t) => {
      const l = t.findIndex((i) => i === e);
      return l >= 0 && t.splice(l, 1), t;
    });
  }
  moveItemToTop(e) {
    Ge(e), this.writableOrderedKeys.update((t) => {
      const l = t.findIndex((i) => i === e);
      return l >= 0 && (t.splice(l, 1), t.unshift(e)), t;
    });
  }
  setItemOrder(e) {
    e.forEach(Ge), this.writableOrderedKeys.set(e);
  }
};
function Ge(n) {
  if (n.startsWith("pinned_"))
    throw new Error(`PinnedItemState expects regular keys but got ${n}`);
}
function Xr() {
  return {
    pinnedDatasets: new _t(),
    pinnedScenarios: new _t(),
    pinnedFreeformRows: new _t()
  };
}
function li(n, e, t) {
  const l = [];
  return n.outputVarL && n.outputVarR ? n.outputVarR.varName !== n.outputVarL.varName && l.push(Pe("warn", `variable renamed, previously '${n.outputVarL.varName}'`)) : n.outputVarL !== void 0 ? l.push(Pe("warn", `variable only defined in ${De(e, "left")}`)) : n.outputVarR !== void 0 && l.push(Pe("warn", `variable only defined in ${De(t, "right")}`)), l;
}
function ni(n, e, t) {
  var c, f;
  const l = [];
  if (n.settings.kind === "all-inputs-settings")
    return [];
  const i = [], s = [], r = [];
  for (const u of n.settings.inputs) {
    const d = (c = u.stateL.error) == null ? void 0 : c.kind, m = (f = u.stateR.error) == null ? void 0 : f.kind, g = d === "unknown-input", v = m === "unknown-input", y = d === "invalid-value", R = m === "invalid-value";
    if (g || v) {
      const $ = { requestedName: u.requestedName, kind: "unknown-input" };
      g && v ? i.push($) : g ? s.push($) : v && r.push($);
    } else if (y || R) {
      const $ = { requestedName: u.requestedName, kind: "invalid-value" };
      y && R ? i.push($) : y ? s.push($) : R && r.push($);
    }
  }
  function o(u, d) {
    const m = u.filter((g) => g.kind === d).map((g) => `'${g.requestedName}'`);
    if (m.length !== 0)
      return d === "unknown-input" ? `unknown ${m.length === 1 ? "input" : "inputs"} ${m.join(", ")}` : `value out of range for ${m.join(", ")}`;
  }
  function a(u) {
    return o(u, "unknown-input") || o(u, "invalid-value");
  }
  if (i.length > 0)
    l.push(Pe("err", `invalid scenario: ${a(i)}`));
  else if (s.length > 0) {
    const u = `scenario not valid in ${De(e, "left")}`;
    l.push(Pe("warn", `${u}: ${a(s)}`));
  } else if (r.length > 0) {
    const u = `scenario not valid in ${De(t, "right")}`;
    l.push(Pe("warn", `${u}: ${a(r)}`));
  }
  return l;
}
function Pe(n, e) {
  return `<span class="annotation"><span class="${`status-color-${n === "err" ? "failed" : "warning"}`}">${n === "err" ? "✗" : "‼"}</span>&ensp;${e}</span>`;
}
function Zr(n, e, t) {
  const l = /* @__PURE__ */ new Map();
  for (const r of e) {
    const o = n.scenarios.getScenario(r.s);
    if (o === void 0)
      continue;
    let a, c;
    switch (t) {
      case "dataset": {
        const d = n.datasets.getDataset(r.d);
        if (d === void 0)
          continue;
        const m = d.outputVarR || d.outputVarL;
        a = m.varName, c = m.sourceName;
        break;
      }
      case "scenario": {
        a = o.title, c = o.subtitle;
        break;
      }
      default:
        (0, import_assert_never13.assertNever)(t);
    }
    let f = l.get(a);
    f === void 0 && (f = {
      title: a,
      totalMaxDiff: 0,
      items: []
    }, l.set(a, f));
    const u = {
      title: a,
      subtitle: c,
      scenario: o,
      testSummary: r
    };
    f.items.push(u), f.totalMaxDiff += u.testSummary.md;
  }
  return [...l.values()].sort((r, o) => r.totalMaxDiff > o.totalMaxDiff ? -1 : r.totalMaxDiff < o.totalMaxDiff ? 1 : 0);
}
function ii(n, e, t, l, i) {
  var m, g, v, y;
  const s = (R, $) => new Un(n, e, $, t, R), r = (m = n.bundleL.model.modelSpec.graphSpecs) == null ? void 0 : m.find((R) => R.id === l), o = (g = n.bundleR.model.modelSpec.graphSpecs) == null ? void 0 : g.find((R) => R.id === l), a = s(r, "left"), c = s(o, "right"), f = /* @__PURE__ */ new Set();
  if (r)
    for (const R of r.datasets)
      f.add(R.datasetKey);
  if (o)
    for (const R of o.datasets)
      f.add(R.datasetKey);
  const u = [];
  let d = 0;
  if (i.inclusion === "both")
    for (const R of f) {
      const $ = (v = r == null ? void 0 : r.datasets) == null ? void 0 : v.find((G) => G.datasetKey === R), C = (y = o == null ? void 0 : o.datasets) == null ? void 0 : y.find((G) => G.datasetKey === R), I = $ == null ? void 0 : $.varName, D = C == null ? void 0 : C.varName, V = ($ == null ? void 0 : $.color) || "#777", q = (C == null ? void 0 : C.color) || "#777", S = $ == null ? void 0 : $.label, j = C == null ? void 0 : C.label, x = i.datasetReports.find((G) => G.datasetKey === R);
      let T = 0;
      if (x) {
        if (x.maxDiff === void 0 || x.maxDiff === 0)
          continue;
        T = x.maxDiff, T > d && (d = T);
      }
      const N = `bucket-color-${jt(T, n.thresholds)}`, H = new Xn(
        n,
        e,
        "freeform",
        "",
        "",
        t,
        R,
        void 0
      );
      u.push({
        datasetKey: R,
        nameL: I,
        nameR: D,
        legendColorL: V,
        legendColorR: q,
        legendLabelL: S,
        legendLabelR: j,
        bucketClass: N,
        maxDiff: T,
        detailBoxViewModel: H,
        detailBoxVisible: ue(false)
      });
    }
  return {
    graphId: l,
    graphL: a,
    graphR: c,
    metadataRows: i.metadataReports,
    datasetRows: u,
    maxDiffPct: d
  };
}
function Jr(n, e, t) {
  return {
    kind: "freeform-view",
    summaryRowKey: n,
    pretitle: e == null ? void 0 : e.title,
    title: "Unresolved view",
    annotations: void 0,
    relatedListHeader: "",
    relatedItems: [],
    graphSections: [],
    regularDetailRows: [],
    pinnedDetailRows: ue([]),
    pinnedItemState: void 0
  };
}
function Qr(n, e, t, l, i, s, r) {
  const o = [];
  for (const c of s.rows || []) {
    const f = [];
    for (const d of c.boxes) {
      const m = {
        title: d.title,
        subtitle: d.subtitle,
        scenario: d.scenario,
        // XXX: For now we don't need to use the real test summary here (we can use
        // `md: 0` since the data and comparison will be loaded/performed on demand)
        testSummary: {
          d: d.dataset.key,
          s: d.scenario.key,
          md: 0
        }
      };
      f.push(m);
    }
    const u = Oe(
      e,
      t,
      l,
      "freeform",
      c.title,
      c.subtitle,
      f
    );
    o.push(u);
  }
  const a = Se(r.orderedKeys, (c) => {
    const f = [];
    for (const u of c)
      if (u.startsWith("row")) {
        const d = o.find((m) => m.pinnedItemKey === u);
        d && f.push(Vt(e, t, l, d));
      }
    return f;
  });
  return {
    kind: "freeform-view",
    summaryRowKey: n,
    pretitle: i == null ? void 0 : i.title,
    title: s.title,
    subtitle: s.subtitle,
    annotations: void 0,
    // TODO
    relatedListHeader: "",
    // TODO
    relatedItems: [],
    // TODO
    graphSections: [],
    regularDetailRows: o,
    pinnedDetailRows: a,
    pinnedItemState: r
  };
}
function ea(n, e, t, l, i, s) {
  const r = e.bundleL.name, o = e.bundleR.name, a = i.root, c = a.outputVarR || a.outputVarL, f = c.varName, u = c.sourceName, d = li(a, r, o).join(" "), m = [];
  function g(D) {
    const V = D.join('&nbsp;<span class="related-sep">&gt;</span>&nbsp;');
    m.push(V);
  }
  if (c.relatedItems)
    for (const D of c.relatedItems)
      g(D.locationPath);
  const v = Zr(e, i.group.testSummaries, "scenario");
  let y;
  for (const D of v)
    for (const V of D.items)
      if (V.scenario.settings.kind === "all-inputs-settings" && V.scenario.settings.position === "at-default") {
        y = V;
        break;
      }
  const R = [];
  for (const D of v) {
    const V = D.items[0] !== y ? [y, ...D.items] : D.items, q = Oe(
      e,
      t,
      l,
      "scenarios",
      D.title,
      void 0,
      // TODO: Subtitle?
      V
    );
    R.push(q);
  }
  const $ = R.findIndex((D) => D.title === "All inputs");
  if ($ !== void 0) {
    const D = R.splice($, 1)[0];
    R.unshift(D);
  }
  function C(D) {
    for (const V of v)
      for (const q of V.items)
        if (q.scenario.key === D)
          return [V.title, q];
  }
  const I = Se(s.orderedKeys, (D) => {
    const V = [];
    for (const q of D)
      if (q.startsWith("row")) {
        const S = R.find((j) => j.pinnedItemKey === q);
        S && V.push(Vt(e, t, l, S));
      } else {
        const S = C(q);
        if (S) {
          const j = S[0], x = S[1];
          V.push(
            Oe(
              e,
              t,
              l,
              "scenarios",
              j,
              void 0,
              // TODO: Subtitle?
              [x]
            )
          );
        }
      }
    return V;
  });
  return {
    kind: "dataset",
    summaryRowKey: n,
    title: f,
    subtitle: u,
    annotations: d,
    relatedListHeader: "Appears in:",
    relatedItems: m,
    graphSections: [],
    regularDetailRows: R,
    pinnedDetailRows: I,
    pinnedItemState: s
  };
}
function ta(n, e, t, l, i, s, r, o) {
  const a = e.bundleL.name, c = e.bundleR.name, f = i.root, u = ni(f, a, c).join(" ");
  let d, m, g, v;
  r ? (d = "scenario-view", m = s == null ? void 0 : s.title, g = r.title, v = r.subtitle) : (d = "scenario", g = f.title, v = f.subtitle);
  const y = [];
  function R(S) {
    const j = S.join('&nbsp;<span class="related-sep">&gt;</span>&nbsp;');
    y.push(j);
  }
  if (f.settings.kind === "input-settings")
    for (const S of f.settings.inputs) {
      const j = S.stateR.inputVar;
      j != null && j.relatedItem && R(j.relatedItem.locationPath);
    }
  const $ = [];
  for (const S of i.group.testSummaries) {
    const j = e.scenarios.getScenario(S.s);
    if (j === void 0)
      continue;
    const x = e.datasets.getDataset(S.d), T = x.outputVarR || x.outputVarL, z = {
      title: T.varName,
      subtitle: T.sourceName,
      scenario: j,
      testSummary: S
    }, N = Oe(
      e,
      t,
      l,
      "datasets",
      g,
      v,
      [z]
    );
    $.push({
      viewModel: N,
      detailItem: z,
      maxDiff: S.md
    });
  }
  const I = $.sort((S, j) => {
    const x = S.maxDiff, T = j.maxDiff;
    if (x !== T)
      return x > T ? -1 : 1;
    {
      const z = S.viewModel.title.toLowerCase(), N = j.viewModel.title.toLowerCase();
      return z.localeCompare(N);
    }
  }).map((S) => S.viewModel);
  function D(S) {
    return I.find((j) => j.items[0].testSummary.d === S);
  }
  const V = Se(o.orderedKeys, (S) => {
    const j = [];
    for (const x of S) {
      const T = D(x);
      T && j.push(Vt(e, t, l, T));
    }
    return j;
  });
  let q;
  if (r) {
    const S = i.group.testSummaries;
    q = la(e, t, r, S);
  } else
    q = [];
  return {
    kind: d,
    summaryRowKey: n,
    pretitle: m,
    title: g,
    subtitle: v,
    annotations: u,
    relatedListHeader: "Related items:",
    relatedItems: y,
    graphSections: q,
    regularDetailRows: I,
    pinnedDetailRows: V,
    pinnedItemState: o
  };
}
function la(n, e, t, l) {
  if (t.rows !== void 0)
    throw new Error("Graphs section is not yet supported in a freeform view");
  if (t.graphIds.length === 0)
    return [];
  if (t.graphOrder === "grouped-by-diffs")
    return si(
      n,
      e,
      t.scenario,
      l,
      t.graphIds
    ).sections;
  {
    const i = n.bundleL.model.modelSpec.graphSpecs, s = n.bundleR.model.modelSpec.graphSpecs, r = t.scenario, o = [];
    for (const a of t.graphIds) {
      const c = i == null ? void 0 : i.find((d) => d.id === a), f = s == null ? void 0 : s.find((d) => d.id === a), u = diffGraphs(c, f, r.key, l);
      o.push(ii(n, e, r, a, u));
    }
    return [
      {
        title: "Featured graphs",
        rows: o
      }
    ];
  }
}
function si(n, e, t, l, i) {
  const s = [], r = [], o = [], a = [], c = [], f = [], u = n.bundleL.model.modelSpec.graphSpecs, d = n.bundleR.model.modelSpec.graphSpecs, m = Array(n.thresholds.length + 2).fill(0);
  for (const C of i) {
    const I = u == null ? void 0 : u.find((x) => x.id === C), D = d == null ? void 0 : d.find((x) => x.id === C), V = diffGraphs(I, D, t.key, l), q = na(V), S = ii(n, e, t, C, V);
    let j;
    switch (V.inclusion) {
      case "right-only":
        j = 1, s.push(S);
        break;
      case "left-only":
        j = 1, r.push(S);
        break;
      case "both":
        q > 0 ? (j = jt(q, n.thresholds), V.metadataReports.length > 0 ? o.push(S) : c.push(S)) : V.metadataReports.length > 0 ? (j = 1, a.push(S)) : (j = 0, f.push(S));
        break;
      case "neither":
        j = 0, f.push(S);
        break;
      default:
        (0, import_assert_never13.default)(V.inclusion);
    }
    m[j]++;
  }
  const g = i.length, v = g - m[0], y = m.map((C) => C / g * 100), R = [];
  function $(C, I, D) {
    if (C.length > 0) {
      const V = D ? C.sort((q, S) => q.maxDiffPct > S.maxDiffPct ? -1 : 1) : C;
      R.push({
        title: I,
        rows: V
      });
    }
  }
  return $(s, "Added graphs", false), $(r, "Removed graphs", false), $(o, "Graphs with metadata and dataset changes", true), $(a, "Graphs with metadata changes only", false), $(c, "Graphs with dataset changes only", true), $(f, "Unchanged graphs", false), {
    sections: R,
    nonZeroDiffCount: v,
    diffPercentByBucket: y
  };
}
function na(n) {
  let e = 0;
  for (const t of n.datasetReports)
    t.maxDiff !== void 0 && t.maxDiff > e && (e = t.maxDiff);
  return e;
}
function Vt(n, e, t, l) {
  return Oe(
    n,
    e,
    t,
    l.kind,
    l.title,
    l.subtitle,
    l.items
  );
}
function ia(n, e, t, l) {
  const i = ue(false);
  if (n) {
    const s = n.thresholds, r = [];
    r.push("no diff");
    for (let o = 0; o < 3; o++)
      r.push(`diff &lt; ${s[o]}%`);
    return r.push(`diff &gt;= ${s[2]}%`), {
      nameL: n.bundleL.name,
      nameR: n.bundleR.name,
      bundleNamesL: ue([n.bundleL.name]),
      bundleNamesR: ue([n.bundleR.name]),
      thresholds: r,
      simplifyScenarios: e,
      controlsVisible: i,
      zoom: t,
      consistentYRange: l
    };
  } else
    return {
      bundleNamesL: ue([]),
      bundleNamesR: ue([]),
      simplifyScenarios: e,
      controlsVisible: i,
      zoom: t,
      consistentYRange: l
    };
}
function $t(n, e, t, l) {
  const i = t - e;
  function s(r) {
    return i !== 0 ? (r - e) / (t - e) * 100 : 0;
  }
  return {
    values: n,
    avg: l,
    points: n.map((r) => s(r)),
    avgPoint: s(l)
  };
}
var sa = class {
  constructor(e, t) {
    this.bundleModelL = e, this.bundleModelR = t, this.minTime = Number.MAX_VALUE, this.maxTime = 0, this.writableRows = ue([]), this.rows = this.writableRows;
  }
  addRow(e, t) {
    const l = Math.min(e.minTime, t.minTime), i = Math.max(e.maxTime, t.maxTime), s = Math.min(this.minTime, l), r = Math.max(this.maxTime, i);
    this.minTime = s, this.maxTime = r;
    function o(f) {
      return $t(f.values, s, r, f.avg);
    }
    const a = Ce(this.writableRows);
    for (const f of a)
      f.dotPlotL = o(f.dotPlotL), f.dotPlotR = o(f.dotPlotR);
    function c(f) {
      return $t(f.allTimes, s, r, f.avgTime);
    }
    a.push({
      num: a.length + 1,
      minTimeL: e.minTime.toFixed(1),
      avgTimeL: e.avgTime.toFixed(1),
      maxTimeL: e.maxTime.toFixed(1),
      minTimeR: t.minTime.toFixed(1),
      avgTimeR: t.avgTime.toFixed(1),
      maxTimeR: t.maxTime.toFixed(1),
      dotPlotL: c(e),
      dotPlotR: c(t)
    }), this.writableRows.set(a);
  }
};
function oa(n) {
  return new sa(n.comparison.bundleL.model, n.comparison.bundleR.model);
}
var ra = 1;
var aa = class {
  constructor(e, t, l, i) {
    this.dataCoordinator = e, this.scenario = t, this.datasetKey = l, this.predicateReport = i, this.requestKeys = [], this.expectedDataKeys = [], this.resolvedDataKeys = [], this.opConstantRefs = /* @__PURE__ */ new Map(), this.resolvedData = /* @__PURE__ */ new Map(), this.dataRequested = false, this.dataLoaded = false, this.baseRequestKey = `check-graph-box::${ra++}`, this.writableContent = ue(void 0), this.content = this.writableContent;
  }
  requestData() {
    if (this.dataRequested)
      return;
    this.dataRequested = true, this.expectedDataKeys = [], this.resolvedDataKeys = [], this.requestKeys = [], this.resolvedData.clear(), this.expectedDataKeys.push("primary"), this.requestDataset("primary", this.scenario.spec, this.datasetKey);
    const e = (t) => {
      const l = this.predicateReport.opRefs.get(t);
      if (l !== void 0)
        switch (this.expectedDataKeys.push(t), l.kind) {
          case "constant":
            this.resolvedDataKeys.push(t), this.opConstantRefs.set(t, l.value);
            break;
          case "data": {
            const i = l.dataRef.scenario.spec, s = l.dataRef.dataset.datasetKey;
            this.requestDataset(t, i, s);
            break;
          }
          default:
            (0, import_assert_never13.assertNever)(l);
        }
    };
    e("gt"), e("gte"), e("lt"), e("lte"), e("eq"), e("approx");
  }
  clearData() {
    if (this.dataRequested) {
      if (this.writableContent.set(void 0), !this.dataLoaded) {
        for (const e of this.requestKeys)
          this.dataCoordinator.cancelRequest(e);
        this.requestKeys = [], this.resolvedData.clear();
      }
      this.dataRequested = false, this.dataLoaded = false;
    }
  }
  /**
   * Request a dataset for the given scenario and key.
   *
   * @param dataKey The key used to store the dataset that is received.
   * @param scenarioSpec The scenario to be configured.
   * @param datasetKey The key for the dataset to be fetched.
   */
  requestDataset(e, t, l) {
    const i = `${this.baseRequestKey}::${e}`;
    this.requestKeys.push(i), this.dataCoordinator.requestDataset(i, t, l, (s) => {
      this.dataRequested && (this.resolvedDataKeys.push(e), this.resolvedData.set(e, nt(s)), this.processResponses());
    });
  }
  /**
   * Should be called when a dataset response is received from the data coordinator.
   * If there are other pending requests, this will be a no-op.  Once all responses
   * are received, this will build the comparison graph view model.
   */
  processResponses() {
    if (this.resolvedDataKeys.length !== this.expectedDataKeys.length)
      return;
    const e = this.resolvedData.get("primary"), t = e.reduce((v, y) => y.x < v ? y.x : v, e[0].x), l = e.reduce((v, y) => y.x > v ? y.x : v, e[0].x), i = this.predicateReport.time;
    let s, r, o;
    if (i === void 0)
      s = t, r = l, o = (v) => v >= t && v <= l;
    else if (typeof i == "number")
      s = i, r = i, o = (v) => v === t;
    else if (Array.isArray(i))
      s = i[0], r = i[1], o = (v) => v >= t && v <= l;
    else {
      const v = i, y = [];
      v.after_excl !== void 0 && (y.push((R) => R > v.after_excl), s = v.after_excl), v.after_incl !== void 0 && (y.push((R) => R >= v.after_incl), s = v.after_incl), v.before_excl !== void 0 && (y.push((R) => R < i.before_excl), r = v.before_excl), v.before_incl !== void 0 && (y.push((R) => R <= i.before_incl), r = v.before_incl), s === void 0 && (s = t), r === void 0 && (r = l), o = (R) => {
        for (const $ of y)
          if (!$(R))
            return false;
        return true;
      };
    }
    const a = [];
    a.push({
      points: e,
      color: "deepskyblue",
      style: "normal"
    });
    const c = (v, y, R = 0, $) => {
      const C = "green";
      $ === void 0 && ($ = 1);
      const I = this.opConstantRefs.get(v);
      if (I !== void 0) {
        s === r ? a.push({
          points: [{ x: s, y: I + R }],
          color: C,
          style: y,
          lineWidth: $
        }) : a.push({
          points: [
            { x: s, y: I + R },
            { x: r, y: I + R }
          ],
          color: C,
          style: y,
          lineWidth: $
        });
        return;
      }
      const D = this.resolvedData.get(v);
      if (D !== void 0) {
        let V = D.filter((q) => o(q.x));
        R !== 0 && (V = V.map((q) => ({ x: q.x, y: q.y + R }))), a.push({
          points: V,
          color: C,
          style: y,
          lineWidth: $
        });
      }
    }, f = (v) => this.opConstantRefs.has(v) || this.resolvedData.has(v), u = f("gt") || f("gte"), d = f("lt") || f("lte");
    c("gt", d ? "fill-to-next" : "fill-above"), c("gte", d ? "fill-to-next" : "fill-above"), c("lt", u ? "normal" : "fill-below"), c("lte", u ? "normal" : "fill-below"), c("eq", "normal", 0, 5);
    const m = this.predicateReport.tolerance || 0.1;
    c("approx", "fill-to-next", -m), c("approx", "normal", m), c("approx", "dashed", 0);
    const g = {
      key: this.baseRequestKey,
      plots: a,
      xMin: void 0,
      xMax: void 0
    };
    this.writableContent.set({
      comparisonGraphViewModel: g
    }), this.dataLoaded = true;
  }
};
function ca(n) {
  switch (n) {
    case "passed":
      return "✓";
    case "failed":
      return "✗";
    case "error":
      return "‼";
    default:
      return "";
  }
}
function tt(n, e, t, l, i, s = false) {
  const r = "&ensp;".repeat(2 + n * 4), o = ca(t), a = `<span class="status-color-${t}">${o}</span>`, c = `${r}${a}&ensp;${l}`;
  return {
    rowClasses: `${e} ${t}`,
    status: t,
    span: c,
    graphBoxViewModel: i,
    graphVisible: ue(s)
  };
}
function bt(n) {
  return `<span class="bold">${n}</span>`;
}
function fa(n, e) {
  let t = false;
  const l = [], i = tt(0, "test", e.status, e.name);
  for (const r of e.scenarios) {
    l.push(tt(1, "scenario", r.status, scenarioMessage(r, bt)));
    for (const o of r.datasets) {
      l.push(tt(2, "dataset", o.status, datasetMessage(o, bt)));
      for (const a of o.predicates) {
        let c, f = false;
        r.checkScenario.spec && o.checkDataset.datasetKey && (c = new aa(
          n,
          r.checkScenario,
          o.checkDataset.datasetKey,
          a
        ), !t && a.result.status === "failed" && (t = true, f = true)), l.push(
          tt(
            3,
            "predicate",
            a.result.status,
            predicateMessage(a, bt),
            c,
            f
          )
        );
      }
    }
  }
  const s = ue(false);
  return {
    testRow: i,
    childRows: l,
    expandAll: s
  };
}
function ua(n, e) {
  return {
    name: e.name,
    tests: e.tests.map((t) => fa(n, t))
  };
}
function da(n, e) {
  let t = 0, l = 0, i = 0;
  for (const o of e.groups)
    for (const a of o.tests)
      for (const c of a.scenarios) {
        if (c.datasets.length === 0) {
          i++;
          continue;
        }
        for (const f of c.datasets) {
          if (f.predicates.length === 0) {
            i++;
            continue;
          }
          for (const u of f.predicates)
            switch (u.result.status) {
              case "passed":
                t++;
                break;
              case "failed":
                l++;
                break;
              case "error":
                i++;
                break;
            }
        }
      }
  const s = t + l + i;
  let r;
  return s > 0 && (r = [t / s * 100, l / s * 100, i / s * 100]), {
    total: s,
    passed: t,
    failed: l,
    errors: i,
    percents: r,
    groups: e.groups.map((o) => ua(n, o))
  };
}
var En = class {
  constructor(e, t, l, i, s, r, o) {
    this.pinnedItemState = e, this.itemKind = t, this.withErrors = l, this.onlyInLeft = i, this.onlyInRight = s, this.withDiffs = r, this.withoutDiffs = o, this.kind = "by-item";
    const a = [], c = (u) => {
      (u == null ? void 0 : u.rows.length) > 0 && a.push(...u.rows);
    };
    c(l), c(i), c(s), c(r), c(o), this.regularRows = a;
    const f = (o == null ? void 0 : o.rows.length) || 0;
    this.rowsWithDiffs = a.length - f, this.pinnedRows = Se(e.orderedKeys, (u) => {
      const d = [];
      for (const m of u) {
        if (m.startsWith("row"))
          continue;
        const g = this.regularRows.find((v) => v.key === m);
        if (g === void 0)
          throw new Error(`No regular row found for key=${m}`);
        d.push({
          ...g,
          key: `pinned_${g.key}`
        });
      }
      return d;
    }), this.allRows = Se(this.pinnedRows, (u) => [...u, ...this.regularRows]);
  }
  // TODO: This is only used in `comparison-summary-pinned.svelte` and can be removed
  // if we decide to not use that component
  toggleItemPinned(e) {
    const t = e.key.startsWith("pinned_") ? e.key.replace("pinned_", "") : e.key;
    this.pinnedItemState.toggleItemPinned(t);
  }
  // TODO: This is only used in `comparison-summary-pinned.svelte` and can be removed
  // if we decide to not use that component
  setReorderedPinnedItems(e) {
    this.pinnedItemState.setItemOrder(e.map((t) => t.key.replace("pinned_", "")));
  }
};
function ma(n, e, t) {
  const l = n.bundleL.name, i = n.bundleR.name, s = categorizeComparisonTestSummaries(n, t), r = s.allTestSummaries, o = s.byScenario, a = s.byDataset;
  let c = 1;
  function f() {
    return `view_${c++}`;
  }
  function u(J, L) {
    var ge;
    const O = J.scenario, Z = o.allGroupSummaries.get(O.key);
    let Q, ae;
    if (J.graphOrder === "grouped-by-diffs") {
      const _e = Z.group.testSummaries, ye = si(n, void 0, O, _e, J.graphIds);
      Q = ye.diffPercentByBucket, ae = ye.nonZeroDiffCount;
    } else
      Q = (ge = Z.scores) == null ? void 0 : ge.diffPercentByBucket;
    return {
      kind: "views",
      key: f(),
      title: J.title,
      subtitle: J.subtitle,
      diffPercentByBucket: Q,
      groupSummary: Z,
      viewMetadata: {
        viewGroup: L,
        view: J,
        changedGraphCount: ae
      }
    };
  }
  function d(J, L) {
    const O = [];
    for (const ae of J.rows)
      for (const ge of ae.boxes) {
        const _e = r.find((ye) => ye.d === ge.dataset.key && ye.s === ge.scenario.key);
        _e && O.push(_e);
      }
    const Q = getScoresForTestSummaries(O, n.thresholds).diffPercentByBucket;
    return {
      kind: "views",
      key: f(),
      title: J.title,
      subtitle: J.subtitle,
      diffPercentByBucket: Q,
      viewMetadata: {
        viewGroup: L,
        view: J
      }
    };
  }
  let m = 0;
  const g = [];
  for (const J of n.viewGroups) {
    const L = {
      kind: "views",
      title: J.title,
      header: true
    }, O = J.views.map((Z) => {
      switch (Z.kind) {
        case "view": {
          let Q;
          return Z.scenario ? Q = u(Z, J) : Q = d(Z, J), _s(Q.diffPercentByBucket) && m++, Q;
        }
        case "unresolved-view":
          return m++, {
            kind: "views",
            key: f(),
            title: "Unresolved view",
            viewMetadata: {
              viewGroup: J,
              view: Z
            }
          };
        default:
          (0, import_assert_never13.assertNever)(Z);
      }
    });
    g.push({
      header: L,
      rows: O
    });
  }
  function v(J, L, O) {
    return `${J} ${J !== 1 ? L.replace(O, `${O}s`) : L}`;
  }
  function y(J) {
    var ge;
    let L, O, Z, Q;
    const ae = J.root;
    switch (ae.kind) {
      case "dataset": {
        L = "by-dataset";
        const _e = ae.outputVarR || ae.outputVarL;
        O = _e.varName, Z = _e.sourceName, Q = li(ae, l, i).join(" ");
        break;
      }
      case "scenario":
        L = "by-scenario", O = ae.title, Z = ae.subtitle, Q = ni(ae, l, i).join(" ");
        break;
      default:
        (0, import_assert_never13.assertNever)(ae);
    }
    return {
      kind: L,
      key: J.group.key,
      title: O,
      subtitle: Z,
      annotations: Q,
      diffPercentByBucket: (ge = J.scores) == null ? void 0 : ge.diffPercentByBucket,
      groupSummary: J
    };
  }
  function R(J, L, O = true) {
    if (J.length > 0) {
      const Z = J.map(y);
      let Q, ae;
      return L.includes("scenario") ? (Q = "by-scenario", ae = "scenario") : (Q = "by-dataset", ae = "variable"), O && (L = v(Z.length, L, ae)), {
        header: {
          kind: Q,
          title: L,
          header: true
        },
        rows: Z
      };
    } else
      return;
  }
  const $ = De(l, "left"), C = De(i, "right"), I = R(o.withErrors, "scenario with errors…"), D = R(o.onlyInLeft, `scenario only valid in ${$}…`), V = R(o.onlyInRight, `scenario only valid in ${C}…`), q = R(o.withDiffs, "scenario producing differences…"), S = R(
    o.withoutDiffs,
    "No differences produced by the following scenarios…",
    false
  ), j = R(a.withErrors, "output variable with errors…"), x = R(a.onlyInLeft, "removed output variable…"), T = R(a.onlyInRight, "added output variable…"), z = R(a.withDiffs, "output variable with differences…"), N = R(
    a.withoutDiffs,
    "No differences detected for the following outputs…",
    false
  );
  let H;
  if (g.length > 0) {
    const J = [];
    for (const L of g)
      J.push(...L.rows);
    H = {
      kind: "views",
      allRows: ue(J),
      rowsWithDiffs: m,
      viewGroups: g
    };
  }
  const G = new En(
    e.pinnedScenarios,
    "scenario",
    I,
    D,
    V,
    q,
    S
  ), Y = new En(
    e.pinnedDatasets,
    "dataset",
    j,
    x,
    T,
    z,
    N
  );
  return {
    views: H,
    byScenario: G,
    byDataset: Y
  };
}
function ha(n, e, t) {
  function l(Z, Q = 0) {
    return Z === 0 ? "-" : `${Z <= 0 ? "" : "+"}${Z.toFixed(Q)}`;
  }
  function i(Z) {
    return Z === 0 ? "" : `${l(Z, 1)}%`;
  }
  function s(Z, Q) {
    return Z !== 0 ? (Q - Z) / Z * 100 : 0;
  }
  const r = n.bundleL.model.modelSpec, o = n.bundleR.model.modelSpec, a = r.inputVars.size, c = o.inputVars.size, f = c - a, u = r.outputVars.size, d = o.outputVars.size, m = d - u, g = r.modelSizeInBytes, v = o.modelSizeInBytes, y = v - g, R = s(g, v), $ = r.dataSizeInBytes, C = o.dataSizeInBytes, I = C - $, D = s($, C), V = e.avgTime || 0, q = t.avgTime || 0, S = q - V, j = s(V, q), x = e.minTime, T = t.minTime, z = e.maxTime, N = t.maxTime, H = Math.min(x, T), G = Math.max(z, N);
  function Y(Z) {
    return $t(Z.allTimes, H, G, Z.avgTime);
  }
  const J = {
    modelName: n.bundleL.name,
    datasetClassIndex: 0,
    inputs: a.toString(),
    outputs: u.toString(),
    modelSize: g.toString(),
    modelSizePctChange: "",
    dataSize: $.toString(),
    dataSizePctChange: "",
    avgTime: V.toFixed(1),
    avgTimePctChange: "",
    minTime: x.toFixed(1),
    maxTime: z.toFixed(1),
    dotPlot: Y(e)
  }, L = {
    modelName: n.bundleR.name,
    datasetClassIndex: 1,
    inputs: c.toString(),
    outputs: d.toString(),
    modelSize: v.toString(),
    modelSizePctChange: "",
    dataSize: C.toString(),
    dataSizePctChange: "",
    avgTime: q.toFixed(1),
    avgTimePctChange: "",
    minTime: T.toFixed(1),
    maxTime: N.toFixed(1),
    dotPlot: Y(t)
  }, O = {
    modelName: "Change",
    inputs: l(f),
    outputs: l(m),
    modelSize: l(y),
    modelSizePctChange: i(R),
    dataSize: l(I),
    dataSizePctChange: i(D),
    avgTime: l(S, 1),
    avgTimePctChange: i(j),
    minTime: "",
    maxTime: ""
  };
  return {
    row1: J,
    row2: L,
    row3: O
  };
}
var pa = class {
  constructor(e, t) {
    this.items = e, this.selectedIndex = ue(t), this.selectedItem = Se(this.selectedIndex, (l) => e[l]), this.selectedItemId = Se(this.selectedItem, (l) => l.id);
  }
};
function Fn(n, e, t, l, i) {
  var y, R;
  function s($, C) {
    if ($ === 0)
      return ["all clear", "passed"];
    {
      const I = $ === 1 ? C : `${C}s`;
      return [`${$} ${I} with diffs`, "warning"];
    }
  }
  const r = [];
  function o($, C, I) {
    r.push({
      id: $,
      title: C,
      subtitle: I[0],
      subtitleClass: `status-color-${I[1]}`
    });
  }
  const a = da(n, e);
  let c;
  if (a.total === 0)
    c = ["no checks", "none"];
  else if (a.failed > 0 || a.errors > 0) {
    const $ = [];
    a.failed > 0 && $.push(`${a.failed} failed`), a.errors > 0 && (a.errors === 1 ? $.push(`${a.errors} error`) : $.push(`${a.errors} errors`)), c = [$.join(", "), "failed"];
  } else
    c = ["all clear", "passed"];
  o("checks", "Checks", c);
  let f, u, d, m;
  if (t && l) {
    f = ha(
      t,
      l.perfReportL,
      l.perfReportR
    );
    const $ = ma(
      t,
      i,
      l.testSummaries
    );
    if ($.views) {
      u = $.views;
      let D, V = 0;
      for (const q of Ce($.views.allRows)) {
        const S = (y = q.viewMetadata) == null ? void 0 : y.view;
        (S == null ? void 0 : S.kind) === "view" && S.graphOrder === "grouped-by-diffs" && (V += ((R = q == null ? void 0 : q.viewMetadata) == null ? void 0 : R.changedGraphCount) || 0);
      }
      V > 0 ? D = s(V, "graph") : D = s(u.rowsWithDiffs, "view"), o("comp-views", "Comparison views", D);
    }
    d = $.byScenario;
    const C = s(d.rowsWithDiffs, "scenario");
    o("comps-by-scenario", "Comparisons by scenario", C), m = $.byDataset;
    const I = s(m.rowsWithDiffs, "dataset");
    o("comps-by-dataset", "Comparisons by output", I);
  }
  const g = r.findIndex(($) => $.subtitle !== "all clear"), v = new pa(r, g >= 0 ? g : 0);
  return {
    statsTableViewModel: f,
    tabBarViewModel: v,
    checkSummaryViewModel: a,
    comparisonViewsSummaryViewModel: u,
    comparisonsByScenarioSummaryViewModel: d,
    comparisonsByDatasetSummaryViewModel: m
  };
}
var va = class {
  /**
   * @param appModel The app model.
   * @param suiteSummary The test suite summary if one was already generated by
   * model-check CLI tool during the build process; if defined, this will be used
   * instead of running the checks and comparisons in the user's browser.
   */
  constructor(e, t) {
    this.appModel = e, this.suiteSummary = t, this.writableChecksInProgress = ue(true), this.checksInProgress = this.writableChecksInProgress, this.writableProgress = ue("0%"), this.progress = this.writableProgress;
    let l;
    t === void 0 ? l = Bn("sde-check-simplify-scenarios", false) : l = void 0;
    const i = Ur("sde-check-graph-zoom", 1), s = Bn("sde-check-consistent-y-range", false);
    this.userPrefs = {
      zoom: i,
      consistentYRange: s
    }, this.headerViewModel = ia(e.config.comparison, l, i, s), this.pinnedItemStates = Xr();
  }
  runTestSuite() {
    var t;
    this.cancelRunSuite && (this.cancelRunSuite(), this.cancelRunSuite = void 0), this.writableChecksInProgress.set(true), this.writableProgress.set("0%");
    const e = this.appModel.config.comparison;
    if (this.suiteSummary) {
      const l = this.appModel.config.check, i = checkReportFromSummary(l, this.suiteSummary.checkSummary), s = (t = this.suiteSummary) == null ? void 0 : t.comparisonSummary;
      this.summaryViewModel = Fn(
        this.appModel.checkDataCoordinator,
        i,
        e,
        s,
        this.pinnedItemStates
      ), this.writableChecksInProgress.set(false);
    } else {
      let l = false;
      this.headerViewModel.simplifyScenarios !== void 0 && (l = Ce(this.headerViewModel.simplifyScenarios)), this.cancelRunSuite = runSuite(
        this.appModel.config,
        {
          onProgress: (i) => {
            this.writableProgress.set(`${Math.round(i * 100)}%`);
          },
          onComplete: (i) => {
            const s = i.checkReport;
            let r;
            i.comparisonReport && (r = comparisonSummaryFromReport(i.comparisonReport)), this.summaryViewModel = Fn(
              this.appModel.checkDataCoordinator,
              s,
              e,
              r,
              this.pinnedItemStates
            ), this.writableChecksInProgress.set(false);
          },
          onError: (i) => {
            console.error(i);
          }
        },
        {
          simplifyScenarios: l
        }
      );
    }
  }
  createCompareDetailViewModelForSummaryRow(e) {
    var s, r;
    const t = e.groupSummary, l = (s = e.viewMetadata) == null ? void 0 : s.viewGroup, i = (r = e.viewMetadata) == null ? void 0 : r.view;
    return (i == null ? void 0 : i.kind) === "unresolved-view" ? Jr(e.key, l) : t !== void 0 ? t.group.kind === "by-dataset" ? ea(
      e.key,
      this.appModel.config.comparison,
      this.appModel.comparisonDataCoordinator,
      this.userPrefs,
      t,
      this.pinnedItemStates.pinnedScenarios
    ) : ta(
      e.key,
      this.appModel.config.comparison,
      this.appModel.comparisonDataCoordinator,
      this.userPrefs,
      t,
      l,
      i,
      this.pinnedItemStates.pinnedDatasets
    ) : Qr(
      e.key,
      this.appModel.config.comparison,
      this.appModel.comparisonDataCoordinator,
      this.userPrefs,
      l,
      i,
      this.pinnedItemStates.pinnedFreeformRows
    );
  }
  createCompareDetailViewModelForFirstSummaryRow(e) {
    const t = this.getComparisonSummaryViewModel(e), l = Ce(t.allRows);
    if (l.length > 0) {
      const i = l[0];
      return this.createCompareDetailViewModelForSummaryRow(i);
    } else
      return;
  }
  createCompareDetailViewModelForSummaryRowWithDelta(e, t, l) {
    const i = this.getComparisonSummaryViewModel(e), s = Ce(i.allRows), o = s.findIndex((a) => a.key === t) + l;
    if (o >= 0 && o < s.length) {
      const a = s[o];
      return this.createCompareDetailViewModelForSummaryRow(a);
    } else
      return;
  }
  getComparisonSummaryViewModel(e) {
    switch (e) {
      case "views":
        return this.summaryViewModel.comparisonViewsSummaryViewModel;
      case "by-scenario":
        return this.summaryViewModel.comparisonsByScenarioSummaryViewModel;
      case "by-dataset":
        return this.summaryViewModel.comparisonsByDatasetSummaryViewModel;
      default:
        (0, import_assert_never13.default)(e);
    }
  }
  createPerfViewModel() {
    return oa(this.appModel.config);
  }
};
function $a(n, e) {
  const t = (e == null ? void 0 : e.containerId) || "app-shell-container", l = new Or({
    target: document.getElementById(t),
    props: {
      appViewModel: void 0
    }
  });
  return Si(n).then((i) => {
    const s = new va(i, e == null ? void 0 : e.suiteSummary);
    e != null && e.bundleNames && (s.headerViewModel.bundleNamesL.set(e.bundleNames), s.headerViewModel.bundleNamesR.set(e.bundleNames)), l.$set({
      appViewModel: s
    });
  }).catch((i) => {
    console.error(`ERROR: Failed to initialize app model: ${i.message}`);
  }), l;
}
export {
  $a as initAppShell
};
//# sourceMappingURL=@sdeverywhere_check-ui-shell.js.map
