export async function instantiate(module, imports = {}) {
  const __module0 = imports.massa;
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
    }),
    massa: Object.assign(Object.create(__module0), {
      assembly_script_generate_event(event) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.generateEvent(~lib/string/String) => void
        event = __liftString(event >>> 0);
        __module0.assembly_script_generate_event(event);
      },
      assembly_script_get_call_stack() {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.callStack() => ~lib/string/String
        return __lowerString(__module0.assembly_script_get_call_stack()) || __notnull();
      },
      assembly_script_get_time() {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.time() => u64
        return __module0.assembly_script_get_time() || 0n;
      },
      assembly_script_set_data(key, value) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.set(~lib/staticarray/StaticArray<u8>, ~lib/staticarray/StaticArray<u8>) => void
        key = __liftStaticArray(__getU8, 0, key >>> 0);
        value = __liftStaticArray(__getU8, 0, value >>> 0);
        __module0.assembly_script_set_data(key, value);
      },
      assembly_script_has_data(key) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.has(~lib/staticarray/StaticArray<u8>) => bool
        key = __liftStaticArray(__getU8, 0, key >>> 0);
        return __module0.assembly_script_has_data(key) ? 1 : 0;
      },
      assembly_script_get_data(key) {
        // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.get(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
        key = __liftStaticArray(__getU8, 0, key >>> 0);
        return __lowerStaticArray(__setU8, 5, 0, __module0.assembly_script_get_data(key), Uint8Array) || __notnull();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    constructor(_) {
      // Streamless/constructor(~lib/staticarray/StaticArray<u8>) => void
      _ = __lowerStaticArray(__setU8, 5, 0, _, Uint8Array) || __notnull();
      exports.constructor(_);
    },
    createPlan(bytes) {
      // Streamless/createPlan(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      bytes = __lowerStaticArray(__setU8, 5, 0, bytes, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.createPlan(bytes) >>> 0);
    },
    subscribe(bytes) {
      // Streamless/subscribe(~lib/staticarray/StaticArray<u8>) => ~lib/staticarray/StaticArray<u8>
      bytes = __lowerStaticArray(__setU8, 5, 0, bytes, Uint8Array) || __notnull();
      return __liftStaticArray(__getU8, 0, exports.subscribe(bytes) >>> 0);
    },
    cancel(bytes) {
      // Streamless/cancel(~lib/staticarray/StaticArray<u8>) => void
      bytes = __lowerStaticArray(__setU8, 5, 0, bytes, Uint8Array) || __notnull();
      exports.cancel(bytes);
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerString(value) {
    if (value == null) return 0;
    const
      length = value.length,
      pointer = exports.__new(length << 1, 2) >>> 0,
      memoryU16 = new Uint16Array(memory.buffer);
    for (let i = 0; i < length; ++i) memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
    return pointer;
  }
  function __liftStaticArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      length = __getU32(pointer - 4) >>> align,
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(pointer + (i << align >>> 0));
    return values;
  }
  function __lowerStaticArray(lowerElement, id, align, values, typedConstructor) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, id)) >>> 0;
    if (typedConstructor) {
      new typedConstructor(memory.buffer, buffer, length).set(values);
    } else {
      for (let i = 0; i < length; i++) lowerElement(buffer + (i << align >>> 0), values[i]);
    }
    exports.__unpin(buffer);
    return buffer;
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU8(pointer, value) {
    try {
      __dataview.setUint8(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint8(pointer, value, true);
    }
  }
  function __getU8(pointer) {
    try {
      return __dataview.getUint8(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint8(pointer, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
