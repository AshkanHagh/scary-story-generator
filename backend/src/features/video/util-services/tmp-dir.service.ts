import * as tmp from "tmp-promise";
import { rm } from "node:fs/promises";

export class TmpDirService {
  private dirs: string[];

  constructor(dirs: string[] = []) {
    this.dirs = dirs;
  }

  async addDir() {
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    this.dirs.push(tmpDir.path);
    return tmpDir.path;
  }

  getAll() {
    return this.dirs;
  }

  async cleanup() {
    await Promise.all(
      this.dirs.map(async (dir) => {
        try {
          await rm(dir, { recursive: true, force: true });
        } catch (error) {}
      }),
    );
    this.dirs = [];
  }
}
