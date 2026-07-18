const MAX_LOGS = 100;
const logs = [];

const originalLog = console.log;
console.log = (...args) => {
  const entry = args.join(" ");
  logs.push(entry);

  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  originalLog(...args);
};

export function getLogs() {
  return [...logs];
}
