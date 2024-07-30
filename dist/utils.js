"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
exports.exists = exists;
const promises_1 = require("fs/promises");
class CustomError extends Error {
    constructor(message, cb) {
        super(message);
        this.callback = cb;
    }
}
exports.CustomError = CustomError;
function exists(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, promises_1.stat)(path);
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
