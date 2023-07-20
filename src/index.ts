import { backOff } from "exponential-backoff";
import { writeFileSync } from 'fs';
import { EvalResult, loadDataset } from './evalResult';
import { evalCode } from './leetcode';

async function reEvaluate(result: EvalResult) {
    const questionTitle = result.id.split('-').slice(1).join('-')
    const code = result.answer.match(/```.*\n((.|\n)*)\n```/)?.[1] ?? result.answer

    const response = await backOff(
        () => evalCode(questionTitle, code),
        { startingDelay: 1000 },
    )

    console.log(response)

    const isAccepted = response.includes('Accepted')

    return {
        code,
        response,
        isAccepted,
    }
}

async function main() {
    const dataset = loadDataset('./data/LEETCODE_EASY_EVAL.csv')
    const gpt_4_0613_results = dataset.filter(x => x.model === 'openaichat/gpt-4-0613')

    const results = []
    for (const result of gpt_4_0613_results) {
        const reEvaluated = await reEvaluate(result)

        results.push({
            ...result,
            formattedAnswer: reEvaluated.code,
            response: reEvaluated.response,
            isAccepted: reEvaluated.isAccepted,
        })
    }

    writeFileSync('./output.json', JSON.stringify(results, null, 4))

    const accepted = results.filter(x => x.isAccepted)

    console.log(`Accepted: ${accepted.length}/${results.length}`)
    console.log(`Accuracy: ${accepted.length / results.length}`)
}

main().then()
