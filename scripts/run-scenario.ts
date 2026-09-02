import { getScenario, SCENARIOS } from "../services/events/event-simulator";
import { decide } from "../services/decision/decision-engine";

async function main() {
  const id = process.argv[2];

  if (!id) {
    console.log("Available scenarios:");
    for (const s of SCENARIOS) {
      console.log(`  ${s.id} - ${s.title}`);
    }
    return;
  }

  const scenario = getScenario(id);
  if (!scenario) {
    console.error(`Unknown scenario: ${id}`);
    process.exit(1);
  }

  console.log(`\n${scenario.title}`);
  console.log(scenario.narrative);
  console.log(`\nRequest: ${scenario.request.category} - $${scenario.request.amount}`);
  console.log(`Reason: ${scenario.request.reason}\n`);

  const result = await decide(scenario.request);

  console.log(`Decision: ${result.status}\n`);
  for (const check of result.checks) {
    console.log(`  [${check.passed ? "PASS" : "FAIL"}] ${check.name}: ${check.detail}`);
  }
  console.log(`\nProjected total balance: $${result.projectedTotalBalance}`);
  if (result.projectedBucketBalance !== null) {
    console.log(`Projected bucket balance: $${result.projectedBucketBalance}`);
  }
}

main();
