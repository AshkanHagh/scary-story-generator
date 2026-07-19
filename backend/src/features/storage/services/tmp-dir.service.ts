import { rm } from "fs/promises";
import { basename } from "node:path";

export class TmpDirService {
  constructor(private dirs: string[] = []) {}

  setForCleanup(dirs: string[]) {
    this.dirs = dirs;
  }

  async cleanup() {
    await Promise.all(
      this.dirs.map(async (dir) => {
        await rm(dir, { recursive: true, force: true }).catch(
          (error: Error) => {
            console.log(
              `file: ${basename(dir)} clean up failed: ${error.message}`,
            );
          },
        );
      }),
    );
    this.dirs = [];
  }
}
