// Model variables
let __lookup1;
let _collection;
let _final_time;
let _initial_time;
let _la_collected_household;
let _la_collected_other;
let _litering_rate;
let _littering;
let _mismanaged;
let _normal_rate;
let _placed_on_market;
let _placed_on_market_data;
let _pom;
let _rate_domestic;
let _rate_dumped;
let _rate_overseas;
let _saveper;
let _sent_overseas;
let _time_step;
let _waste_collected;
let _waste_collected_sent_to_formal_domestic_treatment;
let _waste_generated;
let _waste_generation_rate;
let _wmc_collected;

// Array dimensions


// Dimension mappings


// Lookup data arrays
const __lookup1_data_ = [2012.0, 2554750.0, 2013.0, 2260620.0, 2014.0, 2221040.0, 2015.0, 2261020.0, 2016.0, 2261020.0, 2017.0, 2261020.0, 2018.0, 2362060.0, 2019.0, 2473110.0, 2020.0, 2491780.0, 2021.0, 2515490.0, 2022.0, 2246010.0, 2023.0, 2433790.0, 2024.0, 2448580.0, 2025.0, 2460630.0, 2026.0, 2469870.0, 2027.0, 2476250.0, 2030.0, 2493120.0, 2035.0, 2514140.0, 2040.0, 2529710.0, 2042.0, 2534900.0];


// Time variable
let _time;
/*export*/ function setTime(time) {
  _time = time;
}

// Control variables
let controlParamsInitialized = false;
function initControlParamsIfNeeded() {
  if (controlParamsInitialized) {
    return;
  }

  if (fns === undefined) {
    throw new Error('Must call setModelFunctions() before running the model');
  }

  // We currently require INITIAL TIME and TIME STEP to be defined
  // as constant values.  Some models may define SAVEPER in terms of
  // TIME STEP (or FINAL TIME in terms of INITIAL TIME), which means
  // that the compiler may treat them as an aux, not as a constant.
  // We call initConstants() to ensure that we have initial values
  // for these control parameters.
  initConstants();
  if (_initial_time === undefined) {
    throw new Error('INITIAL TIME must be defined as a constant value');
  }
  if (_time_step === undefined) {
    throw new Error('TIME STEP must be defined as a constant value');
  }

  if (_final_time === undefined || _saveper === undefined) {
    // If _final_time or _saveper is undefined after calling initConstants(),
    // it means one or both is defined as an aux, in which case we perform
    // an initial step of the run loop in order to initialize the value(s).
    // First, set the time and initial function context.
    setTime(_initial_time);
    fns.setContext({
      timeStep: _time_step,
      currentTime: _time
    });

    // Perform initial step to initialize _final_time and/or _saveper
    initLevels();
    evalAux();
    if (_final_time === undefined) {
      throw new Error('FINAL TIME must be defined');
    }
    if (_saveper === undefined) {
      throw new Error('SAVEPER must be defined');
    }
  }

  controlParamsInitialized = true;
}
/*export*/ function getInitialTime() {
  initControlParamsIfNeeded();
  return _initial_time;
}
/*export*/ function getFinalTime() {
  initControlParamsIfNeeded();
  return _final_time;
}
/*export*/ function getTimeStep() {
  initControlParamsIfNeeded();
  return _time_step;
}
/*export*/ function getSaveFreq() {
  initControlParamsIfNeeded();
  return _saveper;
}

// Model functions
let fns;
/*export*/ function getModelFunctions() {
  return fns;
}
/*export*/ function setModelFunctions(functions /*: JsModelFunctions*/) {
  fns = functions;
}

// Internal helper functions
function multiDimArray(dimLengths) {
  if (dimLengths.length > 0) {
    const len = dimLengths[0]
    const arr = new Array(len)
    for (let i = 0; i < len; i++) {
      arr[i] = multiDimArray(dimLengths.slice(1))
    }
    return arr
  } else {
    return 0
  }
}

// Internal constants
const _NA_ = -Number.MAX_VALUE;

// Internal state
let lookups_initialized = false;
let data_initialized = false;

function initLookups0() {
  __lookup1 = fns.createLookup(20, __lookup1_data_);
}

function initLookups() {
  // Initialize lookups
  if (!lookups_initialized) {
    initLookups0();
    lookups_initialized = true;
  }
}

function initData() {
  // Initialize data
  if (!data_initialized) {
    data_initialized = true;
  }
}

function initConstants0() {
  // FINAL TIME = 2042
  _final_time = 2042.0;
  // INITIAL TIME = 2012
  _initial_time = 2012.0;
  // TIME STEP = 1
  _time_step = 1.0;
  // la collected household = 0.5
  _la_collected_household = 0.5;
  // la collected other = 0.2
  _la_collected_other = 0.2;
  // litering rate = 0.1
  _litering_rate = 0.1;
  // normal rate = 1
  _normal_rate = 1.0;
  // rate domestic = 0.4
  _rate_domestic = 0.4;
  // rate dumped = 0.05
  _rate_dumped = 0.05;
  // rate overseas = 0.55
  _rate_overseas = 0.55;
  // wmc collected = 0.2
  _wmc_collected = 0.2;
}

/*export*/ function initConstants() {
  // Initialize constants
  initConstants0();
  initLookups();
  initData();
}

function initLevels0() {
  // Waste collected = INTEG(Collection-Mismanaged-Sent overseas-Waste collected sent to formal domestic treatment,2e+06)
  _waste_collected = 2000000.0;
  // Waste generated = INTEG(Waste generation rate-Collection-Littering,2.55475e+06)
  _waste_generated = 2554750.0;
  // Placed On Market data = WITH LOOKUP(Time,([(0,0)-(10,10)],(2012,2554750),(2013,2260620),(2014,2221040),(2015,2261020),(2016,2261020),(2017,2261020),(2018,2362060),(2019,2473110),(2020,2491780),(2021,2515490),(2022,2246010),(2023,2433790),(2024,2448580),(2025,2460630),(2026,2469870),(2027,2476250),(2030,2493120),(2035,2514140),(2040,2529710),(2042,2534900)))
  _placed_on_market_data = fns.WITH_LOOKUP(_time, __lookup1);
  // Placed on market = INTEG(Placed On Market data-POM,Placed On Market data)
  _placed_on_market = _placed_on_market_data;
}

/*export*/ function initLevels() {
  // Initialize variables with initialization values, such as levels, and the variables they depend on
  initLevels0();
}

function evalAux0() {
  // Collection = (la collected household+la collected other+wmc collected)*Waste generated
  _collection = (_la_collected_household + _la_collected_other + _wmc_collected) * _waste_generated;
  // Littering = litering rate*Waste generated
  _littering = _litering_rate * _waste_generated;
  // Mismanaged = rate dumped*Waste collected
  _mismanaged = _rate_dumped * _waste_collected;
  // Placed On Market data = WITH LOOKUP(Time,([(0,0)-(10,10)],(2012,2554750),(2013,2260620),(2014,2221040),(2015,2261020),(2016,2261020),(2017,2261020),(2018,2362060),(2019,2473110),(2020,2491780),(2021,2515490),(2022,2246010),(2023,2433790),(2024,2448580),(2025,2460630),(2026,2469870),(2027,2476250),(2030,2493120),(2035,2514140),(2040,2529710),(2042,2534900)))
  _placed_on_market_data = fns.WITH_LOOKUP(_time, __lookup1);
  // SAVEPER = TIME STEP
  _saveper = _time_step;
  // Sent overseas = rate overseas*Waste collected
  _sent_overseas = _rate_overseas * _waste_collected;
  // Waste collected sent to formal domestic treatment = rate domestic*Waste collected
  _waste_collected_sent_to_formal_domestic_treatment = _rate_domestic * _waste_collected;
  // POM = Placed on market
  _pom = _placed_on_market;
  // Waste generation rate = normal rate*POM
  _waste_generation_rate = _normal_rate * _pom;
}

/*export*/ function evalAux() {
  // Evaluate auxiliaries in order from the bottom up
  evalAux0();
}

function evalLevels0() {
  // Placed on market = INTEG(Placed On Market data-POM,Placed On Market data)
  _placed_on_market = fns.INTEG(_placed_on_market, _placed_on_market_data - _pom);
  // Waste collected = INTEG(Collection-Mismanaged-Sent overseas-Waste collected sent to formal domestic treatment,2e+06)
  _waste_collected = fns.INTEG(_waste_collected, _collection - _mismanaged - _sent_overseas - _waste_collected_sent_to_formal_domestic_treatment);
  // Waste generated = INTEG(Waste generation rate-Collection-Littering,2.55475e+06)
  _waste_generated = fns.INTEG(_waste_generated, _waste_generation_rate - _collection - _littering);
}

/*export*/ function evalLevels() {
  // Evaluate levels
  evalLevels0();
}

/*export*/ function setInputs(valueAtIndex /*: (index: number) => number*/) {
  _la_collected_household = valueAtIndex(0);
}

/*export*/ function setLookup(varSpec /*: VarSpec*/, points /*: Float64Array*/) {
  throw new Error('The setLookup function was not enabled for the generated model. Set the customLookups property in the spec/config file to allow for overriding lookups at runtime.');
}

/*export*/ const outputVarIds = [
  '_placed_on_market',
  '_waste_collected',
  '_waste_generated'
];

/*export*/ const outputVarNames = [
  'Placed on market',
  'Waste collected',
  'Waste generated'
];

/*export*/ function storeOutputs(storeValue /*: (value: number) => void*/) {
  storeValue(_placed_on_market);
  storeValue(_waste_collected);
  storeValue(_waste_generated);
}

/*export*/ function storeOutput(varSpec /*: VarSpec*/, storeValue /*: (value: number) => void*/) {
  throw new Error('The storeOutput function was not enabled for the generated model. Set the customOutputs property in the spec/config file to allow for capturing arbitrary variables at runtime.');
}

/*export*/ const modelListing = undefined;

export default async function () {
  return {
    kind: 'js',
    outputVarIds,
    outputVarNames,
    modelListing,

    getInitialTime,
    getFinalTime,
    getTimeStep,
    getSaveFreq,

    getModelFunctions,
    setModelFunctions,

    setTime,
    setInputs,
    setLookup,

    storeOutputs,
    storeOutput,

    initConstants,
    initLevels,
    evalAux,
    evalLevels
  }
}
