let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
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

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
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

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
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

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_2.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
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

/**
 * @returns {Float64Array}
 */
export function get_beta_inf() {
    const ret = wasm.get_beta_inf();
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * @returns {Float64Array}
 */
export function get_gamma_0_tab1() {
    const ret = wasm.get_gamma_0_tab1();
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

const AugmentedDickeyFullerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_augmenteddickeyfuller_free(ptr >>> 0, 1));

export class AugmentedDickeyFuller {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AugmentedDickeyFullerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_augmenteddickeyfuller_free(ptr, 0);
    }
    /**
     * @param {Float64Array} data
     * @param {string} equation
     * @param {string} level
     * @param {number} lag
     */
    constructor(data, equation, level, lag) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(equation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(level, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.augmenteddickeyfuller_new(ptr0, len0, ptr1, len1, ptr2, len2, lag);
        this.__wbg_ptr = ret >>> 0;
        AugmentedDickeyFullerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get_data() {
        const ret = wasm.augmenteddickeyfuller_get_data(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    get_lag() {
        const ret = wasm.augmenteddickeyfuller_get_lag(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string}
     */
    get_equation() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.augmenteddickeyfuller_get_equation(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get_level() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.augmenteddickeyfuller_get_level(this.__wbg_ptr);
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
    get_b() {
        const ret = wasm.augmenteddickeyfuller_get_b(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_se() {
        const ret = wasm.augmenteddickeyfuller_get_se(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_test_stat() {
        const ret = wasm.augmenteddickeyfuller_get_test_stat(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {Float64Array} data
     */
    set_data(data) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.augmenteddickeyfuller_set_data(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} equation
     */
    set_equation(equation) {
        const ptr0 = passStringToWasm0(equation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.augmenteddickeyfuller_set_equation(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} level
     */
    set_level(level) {
        const ptr0 = passStringToWasm0(level, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.augmenteddickeyfuller_set_level(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} b
     */
    set_b(b) {
        wasm.augmenteddickeyfuller_set_b(this.__wbg_ptr, b);
    }
    /**
     * @param {number} se
     */
    set_se(se) {
        wasm.augmenteddickeyfuller_set_se(this.__wbg_ptr, se);
    }
    /**
     * @param {number} test_stat
     */
    set_test_stat(test_stat) {
        wasm.augmenteddickeyfuller_set_test_stat(this.__wbg_ptr, test_stat);
    }
    /**
     * @returns {number}
     */
    calculate_pvalue() {
        const ret = wasm.augmenteddickeyfuller_calculate_pvalue(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    calculate_critical_value() {
        const ret = wasm.augmenteddickeyfuller_calculate_critical_value(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    calculate_test_stat() {
        const ret = wasm.augmenteddickeyfuller_calculate_test_stat(this.__wbg_ptr);
        return ret;
    }
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
    quadratic_trend(deseasonalizing) {
        const ptr0 = passArrayF64ToWasm0(deseasonalizing, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_quadratic_trend(this.__wbg_ptr, ptr0, len0);
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
    calculate_multiplicative_seasonal_component(centered_ma) {
        const ptr0 = passArrayF64ToWasm0(centered_ma, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_calculate_multiplicative_seasonal_component(this.__wbg_ptr, ptr0, len0);
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
     * @param {Float64Array} forecast
     * @returns {any}
     */
    decomposition_evaluation(forecast) {
        const ptr0 = passArrayF64ToWasm0(forecast, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.decomposition_decomposition_evaluation(this.__wbg_ptr, ptr0, len0);
        return ret;
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
}

const DickeyFullerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dickeyfuller_free(ptr >>> 0, 1));

export class DickeyFuller {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DickeyFullerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dickeyfuller_free(ptr, 0);
    }
    /**
     * @param {Float64Array} data
     * @param {string} equation
     * @param {string} level
     */
    constructor(data, equation, level) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(equation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(level, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.dickeyfuller_new(ptr0, len0, ptr1, len1, ptr2, len2);
        this.__wbg_ptr = ret >>> 0;
        DickeyFullerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get_data() {
        const ret = wasm.dickeyfuller_get_data(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {string}
     */
    get_equation() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dickeyfuller_get_equation(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get_level() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dickeyfuller_get_level(this.__wbg_ptr);
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
    get_b() {
        const ret = wasm.dickeyfuller_get_b(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_se() {
        const ret = wasm.dickeyfuller_get_se(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_test_stat() {
        const ret = wasm.dickeyfuller_get_test_stat(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {Float64Array} data
     */
    set_data(data) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.dickeyfuller_set_data(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} equation
     */
    set_equation(equation) {
        const ptr0 = passStringToWasm0(equation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.dickeyfuller_set_equation(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} level
     */
    set_level(level) {
        const ptr0 = passStringToWasm0(level, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.dickeyfuller_set_level(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} b
     */
    set_b(b) {
        wasm.dickeyfuller_set_b(this.__wbg_ptr, b);
    }
    /**
     * @param {number} se
     */
    set_se(se) {
        wasm.dickeyfuller_set_se(this.__wbg_ptr, se);
    }
    /**
     * @param {number} test_stat
     */
    set_test_stat(test_stat) {
        wasm.dickeyfuller_set_test_stat(this.__wbg_ptr, test_stat);
    }
    /**
     * @returns {number}
     */
    calculate_pvalue() {
        const ret = wasm.dickeyfuller_calculate_pvalue(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    calculate_critical_value() {
        const ret = wasm.dickeyfuller_calculate_critical_value(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    calculate_test_stat() {
        const ret = wasm.dickeyfuller_calculate_test_stat(this.__wbg_ptr);
        return ret;
    }
}

const MultipleLinearRegressionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_multiplelinearregression_free(ptr >>> 0, 1));

export class MultipleLinearRegression {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MultipleLinearRegressionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_multiplelinearregression_free(ptr, 0);
    }
    /**
     * @param {any} x
     * @param {Float64Array} y
     */
    constructor(x, y) {
        const ptr0 = passArrayF64ToWasm0(y, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.multiplelinearregression_new(x, ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        MultipleLinearRegressionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {any}
     */
    get get_x() {
        const ret = wasm.multiplelinearregression_get_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get_y() {
        const ret = wasm.multiplelinearregression_get_y(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y_prediction() {
        const ret = wasm.multiplelinearregression_get_y_prediction(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_beta() {
        const ret = wasm.multiplelinearregression_get_beta(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {Float64Array} y_prediction
     */
    set_y_prediction(y_prediction) {
        const ptr0 = passArrayF64ToWasm0(y_prediction, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.multiplelinearregression_set_y_prediction(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} beta
     */
    set_beta(beta) {
        const ptr0 = passArrayF64ToWasm0(beta, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.multiplelinearregression_set_beta(this.__wbg_ptr, ptr0, len0);
    }
    calculate_regression() {
        wasm.multiplelinearregression_calculate_regression(this.__wbg_ptr);
    }
    /**
     * @returns {Float64Array}
     */
    calculate_standard_error() {
        const ret = wasm.multiplelinearregression_calculate_standard_error(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}

const NoInterceptLinearRegressionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nointerceptlinearregression_free(ptr >>> 0, 1));

export class NoInterceptLinearRegression {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NoInterceptLinearRegressionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nointerceptlinearregression_free(ptr, 0);
    }
    /**
     * @param {Float64Array} x
     * @param {Float64Array} y
     */
    constructor(x, y) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.nointerceptlinearregression_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        NoInterceptLinearRegressionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get get_x() {
        const ret = wasm.nointerceptlinearregression_get_x(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y() {
        const ret = wasm.nointerceptlinearregression_get_y(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y_prediction() {
        const ret = wasm.nointerceptlinearregression_get_y_prediction(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    get_b() {
        const ret = wasm.nointerceptlinearregression_get_b(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {Float64Array} y_prediction
     */
    set_y_prediction(y_prediction) {
        const ptr0 = passArrayF64ToWasm0(y_prediction, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.nointerceptlinearregression_set_y_prediction(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} b
     */
    set_b(b) {
        wasm.nointerceptlinearregression_set_b(this.__wbg_ptr, b);
    }
    /**
     * @returns {number}
     */
    calculate_standard_error() {
        const ret = wasm.nointerceptlinearregression_calculate_standard_error(this.__wbg_ptr);
        return ret;
    }
    calculate_regression() {
        wasm.nointerceptlinearregression_calculate_regression(this.__wbg_ptr);
    }
}

const QuadraticRegressionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_quadraticregression_free(ptr >>> 0, 1));

export class QuadraticRegression {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        QuadraticRegressionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_quadraticregression_free(ptr, 0);
    }
    /**
     * @param {Float64Array} x
     * @param {Float64Array} y
     */
    constructor(x, y) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.quadraticregression_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        QuadraticRegressionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get get_x() {
        const ret = wasm.quadraticregression_get_x(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y() {
        const ret = wasm.quadraticregression_get_y(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y_prediction() {
        const ret = wasm.quadraticregression_get_y_prediction(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_beta() {
        const ret = wasm.quadraticregression_get_beta(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @param {Float64Array} y_prediction
     */
    set_y_prediction(y_prediction) {
        const ptr0 = passArrayF64ToWasm0(y_prediction, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.quadraticregression_set_y_prediction(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Float64Array} beta
     */
    set_beta(beta) {
        const ptr0 = passArrayF64ToWasm0(beta, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.quadraticregression_set_beta(this.__wbg_ptr, ptr0, len0);
    }
    calculate_regression() {
        wasm.quadraticregression_calculate_regression(this.__wbg_ptr);
    }
}

const SimpleExponentialRegressionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_simpleexponentialregression_free(ptr >>> 0, 1));

export class SimpleExponentialRegression {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SimpleExponentialRegressionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_simpleexponentialregression_free(ptr, 0);
    }
    /**
     * @param {Float64Array} x
     * @param {Float64Array} y
     */
    constructor(x, y) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.simpleexponentialregression_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        SimpleExponentialRegressionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get_x() {
        const ret = wasm.simpleexponentialregression_get_x(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y() {
        const ret = wasm.simpleexponentialregression_get_y(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y_prediction() {
        const ret = wasm.simpleexponentialregression_get_y_prediction(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    get_b0() {
        const ret = wasm.simpleexponentialregression_get_b0(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_b1() {
        const ret = wasm.simpleexponentialregression_get_b1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {Float64Array} y_prediction
     */
    set_y_prediction(y_prediction) {
        const ptr0 = passArrayF64ToWasm0(y_prediction, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.simpleexponentialregression_set_y_prediction(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} b0
     */
    set_b0(b0) {
        wasm.simpleexponentialregression_set_b0(this.__wbg_ptr, b0);
    }
    /**
     * @param {number} b1
     */
    set_b1(b1) {
        wasm.simpleexponentialregression_set_b1(this.__wbg_ptr, b1);
    }
    calculate_regression() {
        wasm.simpleexponentialregression_calculate_regression(this.__wbg_ptr);
    }
}

const SimpleLinearRegressionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_simplelinearregression_free(ptr >>> 0, 1));

export class SimpleLinearRegression {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SimpleLinearRegressionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_simplelinearregression_free(ptr, 0);
    }
    /**
     * @param {Float64Array} x
     * @param {Float64Array} y
     */
    constructor(x, y) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.simplelinearregression_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        SimpleLinearRegressionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Float64Array}
     */
    get_x() {
        const ret = wasm.simplelinearregression_get_x(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y() {
        const ret = wasm.simplelinearregression_get_y(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {Float64Array}
     */
    get_y_prediction() {
        const ret = wasm.simplelinearregression_get_y_prediction(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    get_b0() {
        const ret = wasm.nointerceptlinearregression_get_b(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_b1() {
        const ret = wasm.simplelinearregression_get_b1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {Float64Array} y_prediction
     */
    set_y_prediction(y_prediction) {
        const ptr0 = passArrayF64ToWasm0(y_prediction, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.simplelinearregression_set_y_prediction(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} b0
     */
    set_b0(b0) {
        wasm.nointerceptlinearregression_set_b(this.__wbg_ptr, b0);
    }
    /**
     * @param {number} b1
     */
    set_b1(b1) {
        wasm.simplelinearregression_set_b1(this.__wbg_ptr, b1);
    }
    calculate_regression() {
        wasm.simplelinearregression_calculate_regression(this.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    calculate_standard_error() {
        const ret = wasm.simplelinearregression_calculate_standard_error(this.__wbg_ptr);
        return ret;
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
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
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
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
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
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
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
