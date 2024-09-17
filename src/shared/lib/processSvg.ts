import { PassThrough } from "stream";
import { optimize } from "svgo";

export const processSvg = (passThroughStream: PassThrough): Promise<PassThrough> => {
  return new Promise((res) => {
    const chunks: Buffer[] = [];
    passThroughStream.on("data", (chunk) => chunks.push(chunk));
    passThroughStream.on("end", async () => {
      const svgContent = Buffer.concat(chunks).toString();
      const optimizedSvg = optimize(svgContent, { plugins: ['removeComments', 'removeScriptElement'] });
      const optimizedStream = new PassThrough();
      optimizedStream.end(optimizedSvg.data);
      res(optimizedStream);
    });
  })
}