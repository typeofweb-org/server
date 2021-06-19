/**
 * Tests based on https://github.com/hapijs/iron/blob/93fd15c76e656b1973ba134de64f3aeac66a0405/test/index.js
 * Copyright (c) 2012-2020, Sideway Inc, and project contributors
 * All rights reserved.
 * https://github.com/hapijs/iron/blob/93fd15c76e656b1973ba134de64f3aeac66a0405/LICENSE.md
 *
 * Rewritten and repurposed by Michał Miszczyszyn 2021
 */
import * as EncryptCookies from '../src/utils/encryptCookies';

describe('encrypt', () => {
  const secret = 'some_not_random_password_that_is';
  const value = 'test data';

  it('turns object into a sealed then parses the sealed successfully', async () => {
    const sealed = await EncryptCookies.seal({ value, secret });
    const unsealed = await EncryptCookies.unseal({ sealed, secret });
    expect(unsealed).toEqual(value);
  });

  it('unseal and sealed object with expiration', async () => {
    const sealed = await EncryptCookies.seal({ value, secret, ttl: 200 });
    const unsealed = await EncryptCookies.unseal({ sealed, secret });
    expect(unsealed).toEqual(value);
  });

  it('fails for too short secret', async () => {
    await expect(EncryptCookies.seal({ value, secret: 'too short' })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Secret must be exactly 32 characters long!"`,
    );
  });

  it('unseals a sealed', async () => {
    const sealed =
      'Fe26.2**SqhOkY8av81FPay7I60ktrpeOq7SgRNCcNN0rHWAMSg*3xsUfKKg2KiUWhsOmm1Nnw*_MeWO7OhJooR1Jc0cXQ5pp-wrtooQBeZsvNCSF9Yl5mm5xpCr8_SwxPJJkzwxN43**r3lxz-MMOws6YE-lDcXy6rmZc0mHHMVbXsndXmePgnA*JRDpLG7MxvgdoJqTeaTnUEQ-c0E6eyA66hVSr3f4BLmdfzZYU7fWIYGImEpEZgwzp_0jlF44R0Vr8BDQBlJiNw';
    const unsealed = await EncryptCookies.unseal({ sealed, secret });
    expect(JSON.parse(unsealed)).toEqual({
      a: 1,
      array: [5, 6, {}],
      nested: {
        k: true,
      },
    });
  });

  it('returns an error when number of sealed components is wrong', async () => {
    const sealed =
      'x*Fe26.2**SqhOkY8av81FPay7I60ktrpeOq7SgRNCcNN0rHWAMSg*3xsUfKKg2KiUWhsOmm1Nnw*_MeWO7OhJooR1Jc0cXQ5pp-wrtooQBeZsvNCSF9Yl5mm5xpCr8_SwxPJJkzwxN43**r3lxz-MMOws6YE-lDcXy6rmZc0mHHMVbXsndXmePgnA*JRDpLG7MxvgdoJqTeaTnUEQ-c0E6eyA66hVSr3f4BLmdfzZYU7fWIYGImEpEZgwzp_0jlF44R0Vr8BDQBlJiNw';
    await expect(EncryptCookies.unseal({ sealed, secret })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot unseal: Incorrect data format."`,
    );
  });

  it('returns an error when mac prefix is wrong', async () => {
    const sealed =
      'Fe27.2**SqhOkY8av81FPay7I60ktrpeOq7SgRNCcNN0rHWAMSg*3xsUfKKg2KiUWhsOmm1Nnw*_MeWO7OhJooR1Jc0cXQ5pp-wrtooQBeZsvNCSF9Yl5mm5xpCr8_SwxPJJkzwxN43**r3lxz-MMOws6YE-lDcXy6rmZc0mHHMVbXsndXmePgnA*JRDpLG7MxvgdoJqTeaTnUEQ-c0E6eyA66hVSr3f4BLmdfzZYU7fWIYGImEpEZgwzp_0jlF44R0Vr8BDQBlJiNw';
    await expect(EncryptCookies.unseal({ sealed, secret })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot unseal: Unsupported version."`,
    );
  });

  it('returns an error when integrity check fails', async () => {
    const sealed =
      'Fe26.2**SqhOkY8av81FPay7I60ktrpeOq7SgRNCcNN0rHWAMSg*3xsUfKKg2KiUWhsOmm1Nnw*_MeWO7OhJooR1Jc0cXQ5pp-wrtooQBeZsvNCSF9Yl5mm5xpCr8_SwxPJJkzwxN43**r3lxz-MMOws6YE-lDcXy6rmZc0mHHMVbXsndXmePgnA*JRDpLG7MxvgdoJqTeaTnUEQ-c0E6eyA66hVSr3f4BLmdfzZYU7fWIYGImEpEZgwzp_0jlF44R0Vr8BDQBlJiNwLOL';
    await expect(EncryptCookies.unseal({ sealed, secret })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot unseal: Incorrect hmac seal value"`,
    );
  });

  it('returns an error when iv base64 decoding fails', async () => {
    const sealed =
      'Fe26.2**0a27f421711152214f2cdd7fd8c515738204828f2d5c1ac50685231d38614de1*hUkUfX6sYUoKXh1QNx8oywLOL*AxjnFXiFUlQqdpNYK9lzAJzfm0S07vKo599fOi1Og7vuPaiQ6z8o487hDrs7xDu0**4eb9bef394dbaffa866f1e4246cf9d8c72a19d403da89760a3fc65c95d82301a*l65Cto8YluxfUbex2aD27hrA9Hccvhcryac0pkHfPvs';
    await expect(EncryptCookies.unseal({ sealed, secret })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot unseal: Incorrect hmac seal value"`,
    );
  });

  it('returns an error when expired', async () => {
    const sealed =
      'Fe26.2**552bc79cfa73de9855b539a624c6b404496995f443baf057b95c097f5503f330*sk9We2FqPEyHc5bSzfA1yA*tlyeEmz0jWnaRd4CDmrqeQ*1623946580929*807a2f0ac5aebd5e413e06c52ffbf52158566e73a551d805d3b68164c7869ed8*Y5XBmJC-4QZ4Q1iRUiN2f8SStLL23-57wXNayX-tiF0';
    await expect(EncryptCookies.unseal({ sealed, secret })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot unseal: Expired seal"`,
    );
  });

  it('returns an error when expiration NaN', async () => {
    const sealed =
      'Fe26.2**71ccf7404636c565d498200c002837f55ff5a0bf5e9ddecbd93953336709e9a4*JnIlC3F0_AhVSJQ2ALF3ow*A3s_DWrqGwWRjgC6mD5-SQ*1623946786465dupa*0e8513880d1c8410fb0e8a8e0c7ad43285ee67568b80ab2e76721e7381e14a14*iEz4o4dDQirX6Y1x2Om6Lpglg3XtDVjzkZvq3iRtFuM';
    await expect(EncryptCookies.unseal({ sealed, secret })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot unseal: Invalid expiration"`,
    );
  });
});
