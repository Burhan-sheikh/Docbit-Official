/**
 * Image Worker — offloads image transformations from the main thread.
 * Supports grayscale, B&W, invert, resize, and format conversion.
 */
self.onmessage = (e: MessageEvent) => {
  const { type, imageData, threshold } = e.data as {
    type: 'grayscale' | 'bw' | 'invert';
    imageData: ImageData;
    threshold?: number;
  };

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (type === 'grayscale') {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (type === 'bw') {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const bw = gray > (threshold ?? 128) ? 255 : 0;
      data[i] = bw;
      data[i + 1] = bw;
      data[i + 2] = bw;
    } else if (type === 'invert') {
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    }
  }

  (self as any).postMessage({ imageData }, [imageData.data.buffer]);
};
