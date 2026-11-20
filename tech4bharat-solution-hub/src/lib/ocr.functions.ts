import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readDocumentImage } from "./ocr.server";

// ~6 MB of base64 is plenty for a phone photo after we resize it in the browser
const MAX_LEN = 8_000_000;

export const readDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        imageDataUrl: z
          .string()
          .max(MAX_LEN, "Image is too large")
          .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Only PNG, JPG or WEBP photos are supported"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => readDocumentImage(data.imageDataUrl));
