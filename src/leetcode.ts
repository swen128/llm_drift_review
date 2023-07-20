import { exec } from "child_process";
import { writeFileSync } from "fs";
import { promisify } from "util";

const execAsync = promisify(exec)

export async function evalCode(title: string, code: string): Promise<string> {
    writeFileSync(`tmp/${title}.py`, code)

    const output = await execAsync(`leetcode submit tmp/${title}.py`)

    if (output.stdout.includes('http error [code=429]')) {
        throw new Error('Rate limit exceeded')
    }

    return output.stdout.trim()
}
