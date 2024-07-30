import { Config } from "./config";
import { Logger } from "./logger";
import { GPTResearcher } from "./master/agent";
import { Duckduckgo } from "./retrievers/duckduckgo";

console.log('coucou');

const ddg = new Duckduckgo('olympics paris');

async function main () {
  Logger.init();
  Config.init();

  const researcher = new GPTResearcher({
    query: 'Je voudrais planifier un voyage en Grèce en septembre 2024',
  });

  await researcher.conductResearch();
}

void main();