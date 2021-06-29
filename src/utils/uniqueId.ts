import Os from 'os';

import type { Nominal } from './types';

const MAX_NUM = 2 ** 24;

export type ServerId = Nominal<string, 'ServerId'>;
export type RequestId = Nominal<string, 'RequestId'>;

export const uniqueCounter = (() => {
  let mutableNum = Math.floor(Math.random() * MAX_NUM);

  return () => {
    /* istanbul ignore if */
    if (mutableNum >= MAX_NUM) {
      mutableNum = 0;
    }
    return mutableNum++;
  };
})();

export function getMachineId() {
  const address =
    Object.values(Os.networkInterfaces())
      .flat()
      .find((i) => !i.internal)?.mac ??
    // fallback to random
    Array.from({ length: 16 })
      .map(() => Math.floor(Math.random() * 256).toString(16))
      .join(':');

  return Number.parseInt(address.split(':').join('').substr(6), 16);
}

function toBytes(value: number, bytes: 4 | 3 | 2): string {
  return value
    .toString(16)
    .substr(-bytes * 2)
    .padStart(bytes * 2, '0');
}

export function generateServerId() {
  // a 4-byte timestamp value in seconds
  // a 3-byte machine id (mac-based)
  // a 2-byte process.pid
  // a 3-byte incrementing counter, initialized to a random value

  const timestamp = toBytes(Math.floor(Date.now() / 1000), 4);
  const machineId = toBytes(getMachineId(), 3);
  const processId = toBytes(process.pid, 2);
  const c = toBytes(uniqueCounter(), 3);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ServerId
  return (timestamp + machineId + processId + c) as ServerId;
}

export function parseServerId(id: ServerId) {
  const serverStartedAt = new Date(Number.parseInt(id.substr(0, 4 * 2), 16) * 1000);
  const machineId = Number.parseInt(id.substr(0 + 4 * 2, 3 * 2), 16).toString(16);
  const processId = Number.parseInt(id.substr(0 + 4 * 2 + 3 * 2, 2 * 2), 16);
  const serverCounter = Number.parseInt(id.substr(0 + 4 * 2 + 2 * 2 + 3 * 2, 3 * 2), 16);

  return { serverStartedAt, machineId, processId, serverCounter };
}

export function generateRequestId() {
  // a 4-byte timestamp value in seconds
  // a 3-byte incrementing counter, initialized to a random value
  const received = toBytes(Math.floor(Date.now() / 1000), 4);
  const requestCounter = toBytes(uniqueCounter(), 3);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RequestId
  return (received + requestCounter) as RequestId;
}

export function parseRequestId(id: RequestId) {
  const requestReceivedAt = new Date(Number.parseInt(id.substr(0, 4 * 2), 16) * 1000);
  const requestCounter = Number.parseInt(id.substr(0 + 4 * 2, 3 * 2), 16);

  return { requestReceivedAt, requestCounter };
}
