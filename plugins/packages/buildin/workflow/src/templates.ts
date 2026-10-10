import {
  id,
  newNode,
  newWorkflow,
  type Condition,
  type Connection,
  type Execute,
  type Extract as ExtractNode,
  type Logic,
  type Trigger,
  type Value,
  type Workflow,
  type WorkflowNode,
} from "./model";

/** Connects two template nodes with an optional branch condition. */
function connect(
  source: WorkflowNode,
  target: WorkflowNode,
  condition: string | null = null,
): Connection {
  return {
    id: id("edge"),
    sourceNodeId: source.id,
    targetNodeId: target.id,
    condition,
  };
}

/** Creates a configured trigger node at the requested canvas position. */
function triggerNode(
  name: string,
  x: number,
  y: number,
  triggerType: Trigger["triggerType"] = "manual",
): Trigger {
  const node = newNode("trigger", x, y);
  if (node.type !== "trigger") throw new Error("Node type mismatch");
  node.name = name;
  node.triggerType = triggerType;
  return node;
}

/** Creates a configured execute node for a host tool. */
function executeNode(
  name: string,
  actionType: string,
  actionConfig: Record<string, Value>,
  x: number,
  y: number,
): Execute {
  const node = newNode("execute", x, y);
  if (node.type !== "execute") throw new Error("Node type mismatch");
  node.name = name;
  node.actionType = actionType;
  node.actionConfig = actionConfig;
  return node;
}

/** Creates a configured extraction node for deterministic template data. */
function extractNode(name: string, x: number, y: number): ExtractNode {
  const node = newNode("extract", x, y);
  if (node.type !== "extract") throw new Error("Node type mismatch");
  node.name = name;
  return node;
}

/** Creates a configured condition node for a template branch. */
function conditionNode(name: string, x: number, y: number): Condition {
  const node = newNode("condition", x, y);
  if (node.type !== "condition") throw new Error("Node type mismatch");
  node.name = name;
  return node;
}

/** Creates a configured logic node for combining condition outputs. */
function logicNode(name: string, x: number, y: number): Logic {
  const node = newNode("logic", x, y);
  if (node.type !== "logic") throw new Error("Node type mismatch");
  node.name = name;
  return node;
}

/** Builds a manual notification workflow. */
function manualNotification(): Workflow {
  const workflow = newWorkflow("Manual notification", "Sends a system notification after manual triggering.");
  const trigger = triggerNode("Manual trigger", 60, 80);
  const notification = executeNode(
    "Send notification",
    "send_notification",
    { title: { value: "Workflow" }, message: { value: "Workflow executed" } },
    300,
    80,
  );
  workflow.nodes = [trigger, notification];
  workflow.connections = [connect(trigger, notification)];
  return workflow;
}

/** Builds a graph that demonstrates true and false branches. */
function randomConditionBranch(): Workflow {
  const workflow = newWorkflow(
    "Random number conditional branch",
    "Generates a random number, compares it, and shows different results along the true / false links; it does not call external tools.",
  );
  const trigger = triggerNode("Manual trigger", 60, 100);
  const random = extractNode("Random number 0–100", 280, 100);
  random.mode = "RANDOM_INT";
  const condition = conditionNode("Greater than or equal to 50", 500, 100);
  condition.left = { nodeId: random.id };
  condition.operator = "GTE";
  condition.right = { value: "50" };
  const yes = extractNode("Larger number", 740, 40);
  yes.mode = "CONCAT";
  yes.source = { value: "Value ≥ 50" };
  const no = extractNode("Smaller number", 740, 180);
  no.mode = "CONCAT";
  no.source = { value: "Value < 50" };
  workflow.nodes = [trigger, random, condition, yes, no];
  workflow.connections = [
    connect(trigger, random),
    connect(random, condition),
    connect(condition, yes, "true"),
    connect(condition, no, "false"),
  ];
  return workflow;
}

/** Builds the old web-key extraction and conditional-link workflow. */
function webKeywordBranch(): Workflow {
  const workflow = newWorkflow(
    "Web page keyword branch",
    "Visits a web page and extracts the Visit key; if the page contains Example Domain it opens the first link, otherwise it visits the fallback page.",
  );
  const trigger = triggerNode("Manual trigger", 40, 120);
  const visit = executeNode(
    "Visit web page",
    "visit_web",
    { url: { value: "https://example.com" } },
    260,
    120,
  );
  const visitKey = extractNode("Extract Visit key", 480, 120);
  visitKey.mode = "REGEX";
  visitKey.source = { nodeId: visit.id };
  visitKey.expression = "Visit key:\\s*([^\\s]+)";
  visitKey.group = 1;
  const condition = conditionNode("Contains Example Domain", 700, 120);
  condition.left = { nodeId: visit.id };
  condition.operator = "CONTAINS";
  condition.right = { value: "Example Domain" };
  const follow = executeNode(
    "Open the first link",
    "visit_web",
    {
      visit_key: { nodeId: visitKey.id },
      link_number: { value: "1" },
    },
    940,
    40,
  );
  const fallback = executeNode(
    "Visit fallback page",
    "visit_web",
    { url: { value: "https://example.org" } },
    940,
    220,
  );
  workflow.nodes = [trigger, visit, visitKey, condition, follow, fallback];
  workflow.connections = [
    connect(trigger, visit),
    connect(visit, visitKey),
    connect(visitKey, condition),
    connect(condition, follow, "true"),
    connect(condition, fallback, "false"),
  ];
  return workflow;
}

/** Builds a pure extraction chain that demonstrates output references. */
function extractionPipeline(): Workflow {
  const workflow = newWorkflow(
    "Data extraction pipeline",
    "Uses fixed values to demonstrate string concatenation, slicing, and node output references, then shows the processed result.",
  );
  const trigger = triggerNode("Manual trigger", 40, 120);
  const text = extractNode("Fixed text", 260, 40);
  text.mode = "RANDOM_STRING";
  text.useFixed = true;
  text.fixedValue = "Operit";
  text.randomStringLength = 6;
  text.randomStringCharset = "Operit";
  const number = extractNode("Fixed number", 260, 200);
  number.mode = "RANDOM_INT";
  number.useFixed = true;
  number.fixedValue = "42";
  const joined = extractNode("Concatenated result", 500, 120);
  joined.mode = "CONCAT";
  joined.source = { nodeId: text.id };
  joined.others = [{ value: "-" }, { nodeId: number.id }];
  const preview = extractNode("Slice preview", 720, 120);
  preview.mode = "SUB";
  preview.source = { nodeId: joined.id };
  preview.startIndex = 0;
  preview.length = 8;
  const show = executeNode(
    "Show result",
    "toast",
    { message: { nodeId: preview.id } },
    940,
    120,
  );
  workflow.nodes = [trigger, text, number, joined, preview, show];
  workflow.connections = [
    connect(trigger, text),
    connect(trigger, number),
    connect(text, joined),
    connect(number, joined),
    connect(joined, preview),
    connect(preview, show),
  ];
  return workflow;
}

/** Builds the old multi-condition AND branch with deterministic inputs. */
function logicAndBranch(): Workflow {
  const workflow = newWorkflow(
    "Logical AND branch",
    "Sends a success notification when both conditions are met, otherwise a not-satisfied notification.",
  );
  const trigger = triggerNode("Manual trigger", 40, 120);
  const firstValue = extractNode("Condition value A", 260, 40);
  firstValue.mode = "RANDOM_INT";
  firstValue.useFixed = true;
  firstValue.fixedValue = "80";
  const secondValue = extractNode("Condition value B", 260, 200);
  secondValue.mode = "RANDOM_INT";
  secondValue.useFixed = true;
  secondValue.fixedValue = "60";
  const first = conditionNode("A ≥ 50", 480, 40);
  first.left = { nodeId: firstValue.id };
  first.operator = "GTE";
  first.right = { value: "50" };
  const second = conditionNode("B ≥ 50", 480, 200);
  second.left = { nodeId: secondValue.id };
  second.operator = "GTE";
  second.right = { value: "50" };
  const all = logicNode("All satisfied", 700, 120);
  all.operator = "AND";
  const success = executeNode(
    "Send success notification",
    "toast",
    { message: { value: "Both conditions satisfied" } },
    940,
    40,
  );
  const failure = executeNode(
    "Send failure notification",
    "toast",
    { message: { value: "Not all conditions satisfied" } },
    940,
    200,
  );
  workflow.nodes = [trigger, firstValue, secondValue, first, second, all, success, failure];
  workflow.connections = [
    connect(trigger, firstValue),
    connect(trigger, secondValue),
    connect(firstValue, first),
    connect(secondValue, second),
    connect(first, all),
    connect(second, all),
    connect(all, success, "true"),
    connect(all, failure, "false"),
  ];
  return workflow;
}

/** Builds a scheduled chat workflow that proactively sends a message through the host. */
function proactiveAiMessage(): Workflow {
  const workflow = newWorkflow(
    "AI proactive message (scheduled)",
    "Every day at 09:00 it opens the floating chat and sends a proactive message to the AI; it is disabled by default after import, so confirm the content and time before enabling it.",
  );
  const trigger = triggerNode("Every day at 09:00", 40, 120, "schedule");
  trigger.triggerConfig = {
    schedule_type: "cron",
    cron_expression: "0 9 * * *",
    enabled: "true",
    repeat: "true",
  };
  const start = executeNode(
    "Start chat service",
    "start_chat_service",
    { initial_mode: { value: "WINDOW" }, keep_if_exists: { value: "true" } },
    280,
    120,
  );
  const create = executeNode(
    "Create workflow session",
    "create_new_chat",
    { group: { value: "workflow" }, set_as_current_chat: { value: "true" } },
    520,
    120,
  );
  const send = executeNode(
    "Send proactive message",
    "send_message_to_ai",
    {
      message: { value: "Good morning, please proactively tell me the one thing most worth my attention today." },
      runtime: { value: "floating" },
      persist_turn: { value: "true" },
    },
    780,
    120,
  );
  workflow.nodes = [trigger, start, create, send];
  workflow.connections = [
    connect(trigger, start),
    connect(start, create),
    connect(create, send),
  ];
  return workflow;
}

/** Builds the built-in catalog used by both workflow UI implementations. */
export function templates(): Workflow[] {
  return [
    manualNotification(),
    randomConditionBranch(),
    webKeywordBranch(),
    extractionPipeline(),
    logicAndBranch(),
    proactiveAiMessage(),
  ];
}
