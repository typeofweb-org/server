import { generateRequestId, generateServerId, parseRequestId, parseServerId } from '../src/utils/uniqueId';

describe('uniqueId', () => {
  it('should generate unique request ids', () => {
    const ids = Array.from({ length: 10000 }).map(() => generateRequestId());
    expect(new Set(ids).size).toEqual(10000);
  });

  it('should generate unique server ids', () => {
    const ids = Array.from({ length: 10000 }).map(() => generateServerId());
    expect(new Set(ids).size).toEqual(10000);
  });

  it('should parse request id', () => {
    const id = generateRequestId();
    expect(parseRequestId(id)).toMatchObject({
      requestReceivedAt: expect.any(Date),
      requestCounter: expect.any(Number),
    });
  });

  it('should parse server id', () => {
    const id = generateServerId();
    expect(parseServerId(id)).toMatchObject({
      serverStartedAt: expect.any(Date),
      machineId: expect.any(String),
      processId: expect.any(Number),
      serverCounter: expect.any(Number),
    });
  });
});
