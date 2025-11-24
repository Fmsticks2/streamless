declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /**
   * Streamless/constructor
   * @param _ `~lib/staticarray/StaticArray<u8>`
   */
  export function constructor(_: ArrayLike<number>): void;
  /**
   * Streamless/createPlan
   * @param bytes `~lib/staticarray/StaticArray<u8>`
   * @returns `~lib/staticarray/StaticArray<u8>`
   */
  export function createPlan(bytes: ArrayLike<number>): ArrayLike<number>;
  /**
   * Streamless/subscribe
   * @param bytes `~lib/staticarray/StaticArray<u8>`
   * @returns `~lib/staticarray/StaticArray<u8>`
   */
  export function subscribe(bytes: ArrayLike<number>): ArrayLike<number>;
  /**
   * Streamless/cancel
   * @param bytes `~lib/staticarray/StaticArray<u8>`
   */
  export function cancel(bytes: ArrayLike<number>): void;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
  env: unknown,
  massa: unknown,
}): Promise<typeof __AdaptedExports>;
