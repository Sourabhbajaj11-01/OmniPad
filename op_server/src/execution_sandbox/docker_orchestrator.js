const Docker = require('dockerode');
const stream = require('stream');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const docker = new Docker();

async function executeCpp(code) {
  return new Promise(async (resolve) => {
    // 1. Create a unique temporary directory for this execution
    const executionId = crypto.randomUUID();
    const tempDirPath = path.join(__dirname, 'temp', executionId);
    
    try {
      fs.mkdirSync(tempDirPath, { recursive: true });
      fs.writeFileSync(path.join(tempDirPath, 'main.cpp'), code);
    } catch (err) {
      return resolve({ success: false, output: `File System Error: ${err.message}` });
    }

    // 2. We compile and run the code from the mounted directory
    // We bind the tempDirPath on the host to /app inside the container
    const command = ['sh', '-c', 'cd /app && g++ main.cpp -o a.out && ./a.out'];

    let output = '';
    let isKilledByLimit = false;
    let runningContainer = null;
    const MAX_OUTPUT_LENGTH = 10000; // Limit output to 10k characters
    
    const outStream = new stream.PassThrough();
    outStream.on('data', chunk => {
      if (isKilledByLimit) return;
      
      output += chunk.toString('utf8');
      
      // If the user's program is spamming output (e.g. while(true) cout << "spam";)
      // we need to kill it early so it doesn't crash our backend or their browser!
      if (output.length > MAX_OUTPUT_LENGTH) {
        isKilledByLimit = true;
        output = output.substring(0, MAX_OUTPUT_LENGTH) + '\n\n[Error] Output exceeded maximum length (10,000 characters). Container forcefully killed.';
        if (runningContainer) {
          runningContainer.kill().catch(() => {});
        }
      }
    });

    docker.run(
      'gcc:latest',
      command,
      outStream,
      {
        Tty: false,
        HostConfig: {
          Memory: 256 * 1024 * 1024,
          MemorySwap: 256 * 1024 * 1024,
          // Bind the Windows temp directory to /app in the container
          Binds: [`${tempDirPath}:/app`]
        }
      },
      async function (err, data, container) {
        // Cleanup the container and the temp folder
        if (container) {
          try { await container.remove({ force: true }); } catch (e) {}
        }
        try { fs.rmSync(tempDirPath, { recursive: true, force: true }); } catch (e) {}

        if (err) {
          return resolve({ success: false, output: `Docker Error: ${err.message}` });
        }
        
        const cleanOutput = output.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '').trim();

        resolve({
          success: data.StatusCode === 0 && !isKilledByLimit,
          output: cleanOutput || (data.StatusCode === 0 ? 'Execution completed with no output.' : 'Execution failed.'),
        });
      }
    ).on('container', function (container) {
      runningContainer = container;
      // 3. Strict 2-second timeout to prevent infinite loops
      setTimeout(async () => {
        try {
          const containerInfo = await container.inspect();
          if (containerInfo.State.Running) {
            await container.kill();
            output += '\n\n[Error] Execution timed out after 2 seconds. Infinite loop prevented!';
          }
        } catch (e) {
          // Container already finished
        }
      }, 2000);
    });
  });
}

module.exports = { executeCpp };
