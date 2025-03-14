let wasm;

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_4.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let cachedFloat64ArrayMemory0 = null;

function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_4.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
 * @param {number} k
 * @param {number} j
 * @param {Float64Array} partial_autocorrelate
 * @returns {number}
 */
export function partial_kj(k, j, partial_autocorrelate) {
    const ptr0 = passArrayF64ToWasm0(partial_autocorrelate, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.partial_kj(k, j, ptr0, len0);
    return ret;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_4.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * @param {Float64Array} data
 * @returns {Float64Array}
 */
export function first_difference(data) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.first_difference(ptr0, len0);
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * @param {Float64Array} data
 * @returns {Float64Array}
 */
export function second_difference(data) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.second_difference(ptr0, len0);
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * @param {Float64Array} data
 * @param {number} season
 * @returns {Float64Array}
 */
export function seasonal_difference(data, season) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.seasonal_difference(ptr0, len0, season);
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * @param {Float64Array} data
 * @param {Float64Array} forecast
 * @returns {number}
 */
export function mse(data, forecast) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.mse(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * @param {Float64Array} data
 * @param {Float64Array} forecast
 * @returns {number}
 */
export function rmse(data, forecast) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.rmse(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * @param {Float64Array} data
 * @param {Float64Array} forecast
 * @returns {number}
 */
export function mae(data, forecast) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.mae(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * @param {Float64Array} data
 * @param {Float64Array} forecast
 * @returns {number}
 */
export function mpe(data, forecast) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.mpe(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * @param {Float64Array} data
 * @param {Float64Array} forecast
 * @returns {number}
 */
export function mape(data, forecast) {
    const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.mape(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * Parse SPSS-style configuration into our internal format
 * @param {any} config_json
 * @returns {any}
 */
export function parse_clustering_config(config_json) {
    const ret = wasm.parse_clustering_config(config_json);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

const AutocorrelationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_autocorrelation_free(ptr >>> 0, 1));

export class Autocorrelation {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AutocorrelationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_autocorrelation_free(ptr, 0);
    }
    /**
     * @param {Float64Array} data
     * @param {string} data_header
     * @param {number} lag
     */
    constructor(data, data_header, lag) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(data_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.autocorrelation_new(ptr0, len0, ptr1, len1, lag);
        this.__wbg_ptr = ret >>> 0;
        AutocorrelationFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get_data() {
        const ret = wasm.autocorrelation_get_data(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {string}
     */
    get_data_header() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.autocorrelation_get_data_header(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get_lag() {
        const ret = wasm.autocorrelation_get_lag(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_acf() {
        const ret = wasm.autocorrelation_get_acf(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_acf_se() {
        const ret = wasm.autocorrelation_get_acf_se(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_pacf() {
        const ret = wasm.autocorrelation_get_pacf(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_pacf_se() {
        const ret = wasm.autocorrelation_get_pacf_se(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_lb() {
        const ret = wasm.autocorrelation_get_lb(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    get_df_lb() {
        const ret = wasm.autocorrelation_get_df_lb(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_pvalue_lb() {
        const ret = wasm.autocorrelation_get_pvalue_lb(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {Float64Array} data
     */
    set_data(data) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_data(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} data_header
     */
    set_data_header(data_header) {
        const ptr0 = passStringToWasm0(data_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_data_header(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} lag
     */
    set_lag(lag) {
        wasm.autocorrelation_set_lag(this.__wbg_ptr, lag);
    }
    /**
     * @param {Float64Array} acf
     */
    set_acf(acf) {
        const ptr0 = passArrayF64ToWasm0(acf, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_acf(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} acf_se
     */
    set_acf_se(acf_se) {
        const ptr0 = passArrayF64ToWasm0(acf_se, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_acf_se(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} pacf
     */
    set_pacf(pacf) {
        const ptr0 = passArrayF64ToWasm0(pacf, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_pacf(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} pacf_se
     */
    set_pacf_se(pacf_se) {
        const ptr0 = passArrayF64ToWasm0(pacf_se, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_pacf_se(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} lb
     */
    set_lb(lb) {
        const ptr0 = passArrayF64ToWasm0(lb, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_lb(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Uint32Array} df_lb
     */
    set_df_lb(df_lb) {
        const ptr0 = passArray32ToWasm0(df_lb, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_df_lb(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} pvalue_lb
     */
    set_pvalue_lb(pvalue_lb) {
        const ptr0 = passArrayF64ToWasm0(pvalue_lb, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_set_pvalue_lb(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} difference
     * @returns {Float64Array}
     */
    calculate_acf(difference) {
        const ptr0 = passArrayF64ToWasm0(difference, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.autocorrelation_calculate_acf(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} autocorelate
     * @returns {Float64Array}
     */
    calculate_acf_se(autocorelate) {
        const ptr0 = passArrayF64ToWasm0(autocorelate, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.autocorrelation_calculate_acf_se(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} autocorrelate
     * @returns {Float64Array}
     */
    calculate_pacf(autocorrelate) {
        const ptr0 = passArrayF64ToWasm0(autocorrelate, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.autocorrelation_calculate_pacf(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} partial_autocorelate
     * @returns {Float64Array}
     */
    calculate_pacf_se(partial_autocorelate) {
        const ptr0 = passArrayF64ToWasm0(partial_autocorelate, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.autocorrelation_calculate_pacf_se(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} autocorrelate
     * @returns {Float64Array}
     */
    calculate_ljung_box(autocorrelate) {
        const ptr0 = passArrayF64ToWasm0(autocorrelate, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.autocorrelation_calculate_ljung_box(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} ljung_box
     * @returns {Float64Array}
     */
    pvalue_ljung_box(ljung_box) {
        const ptr0 = passArrayF64ToWasm0(ljung_box, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.autocorrelation_pvalue_ljung_box(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @returns {Uint32Array}
     */
    df_ljung_box() {
        const ret = wasm.autocorrelation_df_ljung_box(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string} difference
     * @param {number} seasonally
     */
    autocorelate(difference, seasonally) {
        const ptr0 = passStringToWasm0(difference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.autocorrelation_autocorelate(this.__wbg_ptr, ptr0, len0, seasonally);
    }
}

const DecompositionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_decomposition_free(ptr >>> 0, 1));

export class Decomposition {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DecompositionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_decomposition_free(ptr, 0);
    }
    /**
     * @param {Float64Array} data
     * @param {string} data_header
     * @param {string[]} time
     * @param {string} time_header
     * @param {number} period
     */
    constructor(data, data_header, time, time_header, period) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(data_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(time, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(time_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, period);
        this.__wbg_ptr = ret >>> 0;
        DecompositionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get_data() {
        const ret = wasm.decomposition_get_data(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {string}
     */
    get_data_header() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.decomposition_get_data_header(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string[]}
     */
    get_time() {
        const ret = wasm.decomposition_get_time(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get_time_header() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.decomposition_get_time_header(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {Float64Array}
     */
    get_seasonal_component() {
        const ret = wasm.decomposition_get_seasonal_component(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_trend_component() {
        const ret = wasm.decomposition_get_trend_component(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_irregular_component() {
        const ret = wasm.decomposition_get_irregular_component(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_seasonal_indices() {
        const ret = wasm.decomposition_get_seasonal_indices(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    get_period() {
        const ret = wasm.decomposition_get_period(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string}
     */
    get_trend_equation() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.decomposition_get_trend_equation(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {Float64Array} seasonal_component
     */
    set_seasonal_component(seasonal_component) {
        const ptr0 = passArrayF64ToWasm0(seasonal_component, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decomposition_set_seasonal_component(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} trend_component
     */
    set_trend_component(trend_component) {
        const ptr0 = passArrayF64ToWasm0(trend_component, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decomposition_set_trend_component(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} irregular_component
     */
    set_irregular_component(irregular_component) {
        const ptr0 = passArrayF64ToWasm0(irregular_component, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decomposition_set_irregular_component(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} seasonal_indices
     */
    set_seasonal_indices(seasonal_indices) {
        const ptr0 = passArrayF64ToWasm0(seasonal_indices, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decomposition_set_seasonal_indices(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} trend_equation
     */
    set_trend_equation(trend_equation) {
        const ptr0 = passStringToWasm0(trend_equation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decomposition_set_trend_equation(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {Float64Array}
     */
    calculate_centered_moving_average() {
        const ret = wasm.decomposition_calculate_centered_moving_average(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {string} trend
     * @returns {Float64Array}
     */
    multiplicative_decomposition(trend) {
        const ptr0 = passStringToWasm0(trend, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_multiplicative_decomposition(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} centered_ma
     * @returns {Float64Array}
     */
    calculate_multiplicative_seasonal_component(centered_ma) {
        const ptr0 = passArrayF64ToWasm0(centered_ma, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_calculate_multiplicative_seasonal_component(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {string} trend
     * @param {Float64Array} deseasonalizing
     * @returns {Float64Array}
     */
    calculate_multiplicative_trend_component(trend, deseasonalizing) {
        const ptr0 = passStringToWasm0(trend, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(deseasonalizing, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_calculate_multiplicative_trend_component(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * @param {Float64Array} deseasonalizing
     * @returns {Float64Array}
     */
    linear_trend(deseasonalizing) {
        const ptr0 = passArrayF64ToWasm0(deseasonalizing, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_linear_trend(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} deseasonalizing
     * @returns {Float64Array}
     */
    exponential_trend(deseasonalizing) {
        const ptr0 = passArrayF64ToWasm0(deseasonalizing, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_exponential_trend(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @returns {Float64Array}
     */
    additive_decomposition() {
        const ret = wasm.decomposition_additive_decomposition(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {Float64Array} centered_ma
     * @returns {Float64Array}
     */
    calculate_additive_trend_component(centered_ma) {
        const ptr0 = passArrayF64ToWasm0(centered_ma, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_calculate_additive_trend_component(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} detrended
     * @returns {Float64Array}
     */
    calculate_additive_seasonal_component(detrended) {
        const ptr0 = passArrayF64ToWasm0(detrended, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_calculate_additive_seasonal_component(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} forecast
     * @returns {any}
     */
    decomposition_evaluation(forecast) {
        const ptr0 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_decomposition_evaluation(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
}

const DiscriminantAnalysisWasmFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_discriminantanalysiswasm_free(ptr >>> 0, 1));
/**
 * WebAssembly binding for discriminant analysis
 */
export class DiscriminantAnalysisWasm {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DiscriminantAnalysisWasmFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_discriminantanalysiswasm_free(ptr, 0);
    }
    /**
     * Create a new discriminant analysis
     *
     * # Arguments
     * * `group_variable` - JSON string containing group data
     * * `independent_variable` - JSON string containing independent variable data
     * * `min_range` - Minimum range for scaling
     * * `max_range` - Maximum range for scaling
     * * `prior_probs` - JSON string containing prior probabilities (optional)
     *
     * # Returns
     * * New instance of DiscriminantAnalysisWasm
     * @param {any} group_variable
     * @param {any} independent_variable
     * @param {number} min_range
     * @param {number} max_range
     * @param {any} prior_probs
     */
    constructor(group_variable, independent_variable, min_range, max_range, prior_probs) {
        const ret = wasm.discriminantanalysiswasm_new(group_variable, independent_variable, min_range, max_range, prior_probs);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        DiscriminantAnalysisWasmFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Compute canonical discriminant functions
     */
    compute_canonical_discriminant_functions() {
        const ret = wasm.discriminantanalysiswasm_compute_canonical_discriminant_functions(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get univariate F-statistics and Wilks' Lambda for a variable
     *
     * # Arguments
     * * `variable_index` - Index of the variable (0-based)
     *
     * # Returns
     * * JSON string with the F-Lambda result
     * @param {number} variable_index
     * @returns {any}
     */
    univariate_f_lambda(variable_index) {
        const ret = wasm.discriminantanalysiswasm_univariate_f_lambda(this.__wbg_ptr, variable_index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Perform Box's M test for equality of covariance matrices
     *
     * # Returns
     * * JSON string with the Box's M test result
     * @returns {any}
     */
    box_m_test() {
        const ret = wasm.discriminantanalysiswasm_box_m_test(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get Wilks' Lambda for the discriminant functions
     *
     * # Returns
     * * JSON string with Wilks' Lambda results
     * @returns {any}
     */
    wilks_lambda() {
        const ret = wasm.discriminantanalysiswasm_wilks_lambda(this.__wbg_ptr);
        return ret;
    }
    /**
     * Classify a new observation
     *
     * # Arguments
     * * `x` - JSON array of feature values
     *
     * # Returns
     * * JSON string with classification result
     * @param {any} x
     * @returns {any}
     */
    classify(x) {
        const ret = wasm.discriminantanalysiswasm_classify(this.__wbg_ptr, x);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Perform cross-validation
     *
     * # Returns
     * * JSON string with cross-validation results
     * @returns {any}
     */
    cross_validate() {
        const ret = wasm.discriminantanalysiswasm_cross_validate(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get group centroids
     *
     * # Returns
     * * JSON string with group centroids
     * @returns {any}
     */
    group_centroids() {
        const ret = wasm.discriminantanalysiswasm_group_centroids(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get standardized coefficients
     *
     * # Returns
     * * JSON string with standardized coefficients
     * @returns {any}
     */
    standardized_coefficients() {
        const ret = wasm.discriminantanalysiswasm_standardized_coefficients(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get structure matrix
     *
     * # Returns
     * * JSON string with structure matrix
     * @returns {any}
     */
    structure_matrix() {
        const ret = wasm.discriminantanalysiswasm_structure_matrix(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get canonical correlations
     *
     * # Returns
     * * JSON string with canonical correlations
     * @returns {any}
     */
    canonical_correlations() {
        const ret = wasm.discriminantanalysiswasm_canonical_correlations(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get classification functions
     *
     * # Returns
     * * JSON string with classification function coefficients
     * @returns {any}
     */
    classification_functions() {
        const ret = wasm.discriminantanalysiswasm_classification_functions(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get complete discriminant analysis results
     *
     * # Returns
     * * JSON string with all results
     * @returns {any}
     */
    get_results() {
        const ret = wasm.discriminantanalysiswasm_get_results(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Perform stepwise discriminant analysis
     * @returns {any}
     */
    perform_stepwise_analysis() {
        const ret = wasm.discriminantanalysiswasm_perform_stepwise_analysis(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get model summary information
     * @returns {string}
     */
    get_model_summary() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.discriminantanalysiswasm_get_model_summary(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const HierarchicalClusteringWasmFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hierarchicalclusteringwasm_free(ptr >>> 0, 1));
/**
 * WebAssembly binding for hierarchical clustering
 */
export class HierarchicalClusteringWasm {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HierarchicalClusteringWasmFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hierarchicalclusteringwasm_free(ptr, 0);
    }
    /**
     * Create a new hierarchical clustering instance with SPSS-style input format
     * @param {any} tempData
     * @param {any} slicedDataForCluster
     * @param {any} slicedDataForLabelCases
     * @param {any} varDefsForCluster
     * @param {any} varDefsForLabelCases
     */
    constructor(tempData, slicedDataForCluster, slicedDataForLabelCases, varDefsForCluster, varDefsForLabelCases) {
        const ret = wasm.hierarchicalclusteringwasm_new(tempData, slicedDataForCluster, slicedDataForLabelCases, varDefsForCluster, varDefsForLabelCases);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        HierarchicalClusteringWasmFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Perform complete hierarchical clustering analysis
     */
    perform_analysis() {
        const ret = wasm.hierarchicalclusteringwasm_perform_analysis(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Preprocess data (standardize and handle missing values)
     */
    preprocess_data() {
        const ret = wasm.hierarchicalclusteringwasm_preprocess_data(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Calculate distance matrix
     */
    calculate_distances() {
        const ret = wasm.hierarchicalclusteringwasm_calculate_distances(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Perform hierarchical clustering
     */
    cluster() {
        const ret = wasm.hierarchicalclusteringwasm_cluster(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get cluster membership for a specific number of clusters
     * @param {number} num_clusters
     * @returns {any}
     */
    get_clusters(num_clusters) {
        const ret = wasm.hierarchicalclusteringwasm_get_clusters(this.__wbg_ptr, num_clusters);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get cluster memberships for a range of solutions
     * @param {number} min_clusters
     * @param {number} max_clusters
     * @returns {any}
     */
    get_clusters_range(min_clusters, max_clusters) {
        const ret = wasm.hierarchicalclusteringwasm_get_clusters_range(this.__wbg_ptr, min_clusters, max_clusters);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Evaluate clustering solution
     * @param {number} num_clusters
     * @returns {any}
     */
    evaluate(num_clusters) {
        const ret = wasm.hierarchicalclusteringwasm_evaluate(this.__wbg_ptr, num_clusters);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get complete results
     * @returns {any}
     */
    get_results() {
        const ret = wasm.hierarchicalclusteringwasm_get_results(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get dendrogram data for visualization
     * @returns {any}
     */
    get_dendrogram_data() {
        const ret = wasm.hierarchicalclusteringwasm_get_dendrogram_data(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get variable names
     * @returns {any}
     */
    get_variable_names() {
        const ret = wasm.hierarchicalclusteringwasm_get_variable_names(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get label data
     * @returns {any}
     */
    get_label_data() {
        const ret = wasm.hierarchicalclusteringwasm_get_label_data(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get original configuration
     * @returns {any}
     */
    get_config() {
        const ret = wasm.hierarchicalclusteringwasm_get_config(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}

const SmoothingFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_smoothing_free(ptr >>> 0, 1));

export class Smoothing {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SmoothingFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_smoothing_free(ptr, 0);
    }
    /**
     * @param {string} data_header
     * @param {Float64Array} data
     * @param {string} time_header
     * @param {string[]} time
     */
    constructor(data_header, data, time_header, time) {
        const ptr0 = passStringToWasm0(data_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(time_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayJsValueToWasm0(time, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.smoothing_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        this.__wbg_ptr = ret >>> 0;
        SmoothingFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get_data_header() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.smoothing_get_data_header(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {Float64Array}
     */
    get_data() {
        const ret = wasm.smoothing_get_data(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {string[]}
     */
    get_time() {
        const ret = wasm.smoothing_get_time(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get_time_header() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.smoothing_get_time_header(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} data_header
     */
    set_data_header(data_header) {
        const ptr0 = passStringToWasm0(data_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.smoothing_set_data_header(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} data
     */
    set_data(data) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.smoothing_set_data(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string[]} time
     */
    set_time(time) {
        const ptr0 = passArrayJsValueToWasm0(time, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.smoothing_set_time(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} time_header
     */
    set_time_header(time_header) {
        const ptr0 = passStringToWasm0(time_header, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.smoothing_set_time_header(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} distance
     * @returns {Float64Array}
     */
    calculate_sma(distance) {
        const ret = wasm.smoothing_calculate_sma(this.__wbg_ptr, distance);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {number} distance
     * @returns {Float64Array}
     */
    calculate_dma(distance) {
        const ret = wasm.smoothing_calculate_dma(this.__wbg_ptr, distance);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {number} distance
     * @returns {Float64Array}
     */
    calculate_wma(distance) {
        const ret = wasm.smoothing_calculate_wma(this.__wbg_ptr, distance);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {number} alpha
     * @returns {Float64Array}
     */
    calculate_ses(alpha) {
        const ret = wasm.smoothing_calculate_ses(this.__wbg_ptr, alpha);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {number} alpha
     * @returns {Float64Array}
     */
    calculate_des(alpha) {
        const ret = wasm.smoothing_calculate_des(this.__wbg_ptr, alpha);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {number} alpha
     * @param {number} beta
     * @returns {Float64Array}
     */
    calculate_holt(alpha, beta) {
        const ret = wasm.smoothing_calculate_holt(this.__wbg_ptr, alpha, beta);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {number} alpha
     * @param {number} beta
     * @param {number} gamma
     * @param {number} period
     * @returns {Float64Array}
     */
    calculate_winter(alpha, beta, gamma, period) {
        const ret = wasm.smoothing_calculate_winter(this.__wbg_ptr, alpha, beta, gamma, period);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {Float64Array} forecast
     * @returns {any}
     */
    smoothing_evaluation(forecast) {
        const ptr0 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.smoothing_smoothing_evaluation(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_done_769e5ede4b31c67b = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_entries_3265d4158b33e5dc = function(arg0) {
        const ret = Object.entries(arg0);
        return ret;
    };
    imports.wbg.__wbg_get_67b2ba62fc30de12 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_b9b93047fe3cf45b = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_e14585432e3737fc = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Map_f3469ce2244d2430 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Map;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_17156bcf118086a9 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_a1eab7e0d067391b = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_343e2beeeece1bb0 = function(arg0) {
        const ret = Number.isSafeInteger(arg0);
        return ret;
    };
    imports.wbg.__wbg_iterator_9a24c88df860dc65 = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_e2d2a49132c1b256 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_log_c222819a41e063d3 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_5e0be73521bc8c17 = function() {
        const ret = new Map();
        return ret;
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_next_25feadfc0913fea9 = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_next_6574e1a8a62d1055 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_37837023f3d740e8 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        arg0[arg1] = arg2;
    };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_set_8fc6bf8a5b1071d1 = function(arg0, arg1, arg2) {
        const ret = arg0.set(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_set_bb8cecf6a62b9f46 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_sqrt_68a20b95bafcc1e5 = function(arg0) {
        const ret = Math.sqrt(arg0);
        return ret;
    };
    imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        const v = arg1;
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = arg0 in arg1;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_4;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        const ret = typeof(arg0) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = arg0 === null;
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = arg0 === arg1;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = arg0 == arg1;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
