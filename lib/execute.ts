export interface CodeOutput {
    id: string
    code: string
    output: string
    timestamp: number
    success: boolean
  }
  
  export async function executeCode(code: string): Promise<CodeOutput> {
    const id = Math.random().toString(36).substring(2, 15)
    const timestamp = Date.now()
    let output = ""
    let success = true
  
    try {
      // Create a safe execution environment
      const logs: string[] = []
      const errors: string[] = []
  
      // Create a custom console object to capture output
      const customConsole = {
        log: (...args: any[]): void => {
          logs.push(
            args
              .map((arg) => {
                if (typeof arg === "object" && arg !== null) {
                  try {
                    return JSON.stringify(arg, null, 2)
                  } catch {
                    return String(arg)
                  }
                }
                return String(arg)
              })
              .join(" "),
          )
        },
        error: (...args: any[]): void => {
          errors.push(args.map((arg) => String(arg)).join(" "))
        },
        warn: (...args: any[]): void => {
          logs.push("Warning: " + args.map((arg) => String(arg)).join(" "))
        },
        info: (...args: any[]): void => {
          logs.push("Info: " + args.map((arg) => String(arg)).join(" "))
        },
      }
  
      // Execute the code in a controlled environment
      const executeFunction = new Function(
        "console",
        `
        try {
          ${code}
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      `,
      )
  
      const result = executeFunction(customConsole)
  
      if (!result.success) {
        output = `Runtime Error: ${result.error}`
        success = false
      } else {
        // Combine logs and errors
        const allOutput = [...logs]
        if (errors.length > 0) {
          allOutput.push("Errors:", ...errors)
          success = false
        }
  
        output = allOutput.length > 0 ? allOutput.join("\n") : "Code executed successfully (no output)"
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
  