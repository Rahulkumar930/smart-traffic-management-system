import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../..");

const pythonScript = path.join(
  projectRoot,
  "ml-model",
  "lane_detection.py"
);

export function runLaneDetection(videoPath, outputPath = null) {
  return new Promise((resolve, reject) => {
    const pythonCommand =
      process.platform === "win32"
        ? "python"
        : "python3";

    const args = [pythonScript, videoPath];

    if (outputPath) {
      args.push(outputPath);
    }

    const pythonProcess = spawn(
      pythonCommand,
      args,
      {
        cwd: projectRoot
      }
    );

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(
        new Error(
          `Failed to start Python: ${error.message}`
        )
      );
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            stderr ||
              `Lane detection exited with code ${code}`
          )
        );

        return;
      }

      try {
        const lines = stdout
          .trim()
          .split(/\r?\n/)
          .filter(Boolean);

        const lastLine = lines[lines.length - 1];

        const result = JSON.parse(lastLine);

        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Invalid response from lane detection: ${error.message}`
          )
        );
      }
    });
  });
}