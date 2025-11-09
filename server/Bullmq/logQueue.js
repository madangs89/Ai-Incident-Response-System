import { v4 as uuid } from "uuid";
export const addJob = async (logs, queue, name, key) => {
  try {
    const data = Array.isArray(logs) ? logs : [logs];
    if (data.length == 0) {
      return true;
    }
    await queue.add(
      name,
      { log: data, key },
      {
        jobId: uuid(),
      }
    );
    return true;
  } catch (error) {
    return false;
  }
};
