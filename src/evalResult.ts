import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { z } from 'zod';

const modelSchema = z.union([
    z.literal('openaichat/gpt-3.5-turbo-0301'),
    z.literal('openaichat/gpt-3.5-turbo-0613'),
    z.literal('openaichat/gpt-4-0314'),
    z.literal('openaichat/gpt-4-0613'),
])

const evalResultSchema = z.object({
    model: modelSchema,
    id: z.string(),
    query: z.string(),
    answer: z.string(),
    Code_Submit: z.string(),
});
export type EvalResult = z.infer<typeof evalResultSchema>

export function loadDataset(path: string): EvalResult[] {
    const input = readFileSync(path, 'utf8')
    const rawDataset: unknown[] = parse(input, {
        columns: true,
    });
    return rawDataset.map(data => evalResultSchema.parse(data))
}
