export interface CodeOutput {
  id: string
  code: string
  output: string
  timestamp: number
  success: boolean
}

export async function executeCode(code: string): Promise<CodeOutput> {
  const id = generateId()
  const timestamp = Date.now()

  let output = ""
  let success = true

  const logs: string[] = []
  const errors: string[] = []

  const customConsole = createCustomConsole(logs, errors)

  try {
    const executeFunction = new Function(
      "console",
      `
        try {
          ${code}
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      `
    )

    const result = executeFunction(customConsole)

    if (!result.success) {
      output = `Runtime Error: ${result.error}`
      success = false
    } else {
      output = formatOutput(logs, errors)
      success = errors.length === 0
    }
  } catch (error: any) {
    output = `Execution Error: ${error.message}`
    success = false
  }

  return {
    id,
    code,
    output,
    timestamp,
    success,
  }
}

/* ================= Helper Functions ================= */

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function createCustomConsole(logs: string[], errors: string[]) {
  const stringify = (value: any): string => {
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return String(value)
      }
    }
    return String(value)
  }

  return {
    log: (...args: any[]) => {
      logs.push(args.map(stringify).join(" "))
    },
    error: (...args: any[]) => {
      errors.push(args.map(stringify).join(" "))
    },
    warn: (...args: any[]) => {
      logs.push("Warning: " + args.map(stringify).join(" "))
    },
    info: (...args: any[]) => {
      logs.push("Info: " + args.map(stringify).join(" "))
    },
  }
}

function formatOutput(logs: string[], errors: string[]): string {
  if (logs.length === 0 && errors.length === 0) {
    return "Code executed successfully (no output)"
  }

  const result: string[] = [...logs]

  if (errors.length > 0) {
    result.push("Errors:")
    result.push(...errors)
  }

  return result.join("\n")
}
