// Server-only: reads a photo of a land document with a vision model.
import { GatewayError, generateResponse } from "@lovable.dev/ai-gateway";
import { z } from "zod";

const DOC_KINDS = ["rtc", "mutation", "death_certificate", "family_tree", "survey_sketch", "sale_deed", "other"] as const;

export const ocrResultSchema = z.object({
  kind: z.enum(DOC_KINDS),
  title: z.string(),
  issuedBy: z.string(),
  ownerName: z.string().nullable(),
  surveyNo: z.string().nullable(),
  extentText: z.string().nullable(),
  khataNo: z.string().nullable(),
  village: z.string().nullable(),
  date: z.string().nullable(),
  deceasedName: z.string().nullable(),
  heirsListed: z.array(z.string()).nullable(),
  mutationType: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  rawText: z.string(),
});

export type OcrResult = z.infer<typeof ocrResultSchema>;

const nullableString = { type: ["string", "null"] };

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: Object.keys(ocrResultSchema.shape),
  properties: {
    kind: { type: "string", enum: [...DOC_KINDS] },
    title: { type: "string" },
    issuedBy: { type: "string" },
    ownerName: nullableString,
    surveyNo: nullableString,
    extentText: nullableString,
    khataNo: nullableString,
    village: nullableString,
    date: nullableString,
    deceasedName: nullableString,
    heirsListed: { type: ["array", "null"], items: { type: "string" } },
    mutationType: nullableString,
    confidence: { type: "number" },
    rawText: { type: "string" },
  },
};

const PROMPT = `You read Indian (Karnataka) land documents: RTC/Pahani, Mutation Register, death certificates,
family tree (Vamshavruksha) certificates, survey sketches (Tippan/Akarband/Hissa) and sale deeds.
The text may be in Kannada, English or both. Transliterate names to English (Latin script).
Return JSON only, matching the schema:
- kind: which document this is
- extentText: land extent exactly as acres-guntas, e.g. "4-20" (4 acres 20 guntas). null if not shown.
- surveyNo: like "112/3" or "45/1A"
- date: yyyy-mm-dd (date of death for a death certificate, issue/entry date otherwise)
- heirsListed: names of heirs (family tree only)
- mutationType: e.g. "Pauti", "Sale", "Partition" (mutation register only)
- confidence: 0..1, how sure you are the fields are correct
- rawText: up to 600 characters of the main text you read, in English
Use null for anything not visible. Never guess names.`;

export async function readDocumentImage(imageDataUrl: string): Promise<OcrResult> {
  try {
    const response = await generateResponse({
      model: "openai/gpt-6-astra",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: PROMPT },
            { type: "input_image", image_url: imageDataUrl, detail: "high" },
          ],
        },
      ],
      text: { format: { type: "json_schema", name: "land_document", schema: jsonSchema, strict: true } },
    });

    let text = "";
    for (const item of response.output ?? []) {
      if (item.type !== "message") continue;
      for (const part of item.content) {
        if (part.type === "output_text") text += part.text;
      }
    }
    if (!text) throw new Error("The reader returned no text.");
    return ocrResultSchema.parse(JSON.parse(text));
  } catch (err) {
    if (err instanceof GatewayError) {
      console.error("OCR gateway error", err.code, err.httpStatus, err.ids);
      if (err.httpStatus === 429) throw new Error("Too many requests right now. Please wait a minute and try again.");
      if (err.httpStatus === 402) throw new Error("AI credits are used up for this workspace.");
      throw new Error("Could not read the photo right now. Please try again or type the details by hand.");
    }
    throw err;
  }
}
