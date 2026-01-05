const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const SAMPLE_RATE = 24000;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

function base64ToArrayBuffer(base64) {
  const buffer = Buffer.from(base64, "base64");
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function pcmToWav(pcm16, sampleRate) {
  const numChannels = 1, bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * 2, blockAlign = numChannels * 2;
  const dataSize = pcm16.length * 2;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  }

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcm16.length; i++, offset += 2) view.setInt16(offset, pcm16[i], true);

  return buffer;
}

async function textToSpeech(text, outputFile, voice) {
  if (!genAI) throw new Error("GEMINI_API_KEY missing");
  if (!text || !text.trim()) throw new Error("Text is empty");

  const voiceName = voice === "Male" ? "Kore" : "Leda";

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    payload: {
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } }
    }
  });

  const part = result?.candidates?.[0]?.content?.parts?.[0];
  const audioBase64 = part?.inlineData?.data;
  if (!audioBase64) throw new Error("No audio returned");

  const pcmBuffer = base64ToArrayBuffer(audioBase64);
  const pcm16 = new Int16Array(pcmBuffer);
  const wavBuffer = pcmToWav(pcm16, SAMPLE_RATE);

  await fs.promises.writeFile(outputFile, Buffer.from(wavBuffer));
}

module.exports = { textToSpeech };
