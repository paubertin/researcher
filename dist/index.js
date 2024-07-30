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
const config_1 = require("./config");
const logger_1 = require("./logger");
const agent_1 = require("./master/agent");
const duckduckgo_1 = require("./retrievers/duckduckgo");
console.log('coucou');
const ddg = new duckduckgo_1.Duckduckgo('olympics paris');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.Logger.init();
        config_1.Config.init();
        const researcher = new agent_1.GPTResearcher({
            query: 'médailles aux JO paris',
        });
        yield researcher.conductResearch();
    });
}
void main();
