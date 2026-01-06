export const typedArrayUtils = {
  toArrayBuffer: (view: ArrayBufferView): ArrayBuffer => {
    if (view.buffer instanceof ArrayBuffer) {
      return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    }

    const ab = new ArrayBuffer(view.byteLength);
    new Uint8Array(ab).set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return ab;
  },
};
