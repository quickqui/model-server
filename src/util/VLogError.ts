import { ValidateError } from "@quick-qui/model-core";

export class VLogError extends Error {
  logs: ValidateError[] = [];
  constructor(message: string, logs: ValidateError[]) {
    super(message);
    this.logs = logs;
    //NOTE typescript 'bug', 啥时候可以改掉这个？
    Object.setPrototypeOf(this, VLogError.prototype);
  }
}