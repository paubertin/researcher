import { stat } from "fs/promises";

export class CustomError extends Error {
  public callback?: () => void;

  public constructor (message: string, cb?: () => void) {
    super(message);
    this.callback = cb;
  }
}

export async function exists (path: string) {
  try {
    await stat(path);
    return true;
  }
  catch (err: any) {
    return false;
  }
}