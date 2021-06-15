import { generateRequestId, generateServerId, parseRequestId, parseServerId } from '../src/utils/uniqueId';

import type { RequestId, ServerId } from '../src/utils/uniqueId';

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

    expect(parseRequestId('60c8dabfefb893' as RequestId)).toEqual({
      requestCounter: 15710355,
      requestReceivedAt: new Date('2021-06-15T16:52:15.000Z'),
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

    expect(parseServerId('60c8dad85f3d1184a9efb894' as ServerId)).toEqual({
      machineId: '5f3d11',
      processId: 33961,
      serverCounter: 15710356,
      serverStartedAt: new Date('2021-06-15T16:52:40.000Z'),
    });
  });
});
