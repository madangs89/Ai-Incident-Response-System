import { v4 as uuid } from "uuid";
import { errorQueue } from "./queue.js";
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
        jobId: `${key}-${Date.now()}`,
      }
    );
    console.log({ jobId: `${key}-${Date.now()}` });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const addErrorJob = async (logs, queue, name, key, errorType) => {
  try {
    if (!errorType) {
      return;
    }
    queue = errorQueue;
    if (errorType == "fullLogs") {
      const data = Array.isArray(logs?.FullLogs)
        ? logs?.FullLogs
        : [logs?.FullLogs];
      const incidents = Array.isArray(logs?.fullIncidents)
        ? logs?.fullIncidents
        : [logs?.fullIncidents];

      await queue.add(
        name,
        {
          log: {
            FullLogs: data,
            fullIncidents: incidents,
          },
          key,
          errorType,
        },
        {
          jobId: `${key}-${Date.now()}`,
        }
      );
      return true;
    } else if (errorType == "incidents") {
      const incidents = Array.isArray(logs?.fullIncidents)
        ? logs?.fullIncidents
        : [logs?.fullIncidents];
      await queue.add(
        name,
        {
          log: {
            fullIncidents: incidents,
          },
          key,
          errorType,
        },
        {
          jobId: `${key}-${Date.now()}`,
        }
      );
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};
