// pcm-processor.js
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const samples = input[0]; // First channel (mono)
      const int16Buffer = new Int16Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        let s = samples[i];
        // Clamp sample value between -1 and 1
        s = Math.max(-1, Math.min(1, s));
        int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      // Post the PCM data to the main thread
      this.port.postMessage(int16Buffer.buffer, [int16Buffer.buffer]);
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
