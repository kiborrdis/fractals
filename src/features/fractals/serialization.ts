import { FractalParamsBuildRules } from "./types";

export const serializeBuildRules = async (
  rules: FractalParamsBuildRules,
): Promise<string> => {
  const json = JSON.stringify(rules);
  const compressed = new Blob([json])
    .stream()
    .pipeThrough(new CompressionStream("deflate"));
  const buffer = await new Response(compressed).arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64;
};

export const deserializeBuildRules = async (
  str: string,
): Promise<FractalParamsBuildRules> => {
  const binary = Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  const decompressed = new Blob([binary])
    .stream()
    .pipeThrough(new DecompressionStream("deflate"));
  const json = await new Response(decompressed).text();

  return JSON.parse(json) as FractalParamsBuildRules;
};
