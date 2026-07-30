/**
 * The API Execution Orchestrator
 * 
 * Replaces our old Docker-based sandbox with a cloud-based API request.
 * We use the JDoodle Compiler API (https://www.jdoodle.com/compiler-api)
 */

async function executeCpp(code) {
  try {
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, output: `Configuration Error: JDoodle API keys are missing from .env` };
    }

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        script: code,
        language: 'cpp17', // Modern C++ 17 support
        versionIndex: '1'  // Matches the g++ version required for cpp17
      })
    });

    const data = await response.json();

    if (data.error) {
      // The API returned an error message (e.g. rate limit, invalid request)
      return { success: false, output: `JDoodle Error: ${data.error}` };
    }

    if (data.output === undefined) {
      return { success: false, output: `API Error: Unexpected response format.` };
    }

    const isSuccess = data.statusCode === 200;
    let finalOutput = data.output.trim();

    // Sometimes JDoodle puts compilation errors right into 'output' with a 200 OK status
    // but actual execution failures might have different status codes.
    return {
      success: isSuccess,
      output: finalOutput || 'Execution completed with no output.'
    };

  } catch (err) {
    return { success: false, output: `Network Error: Could not connect to JDoodle API. (${err.message})` };
  }
}

module.exports = { executeCpp };
