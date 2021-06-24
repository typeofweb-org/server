/**
 * Implementation based on https://github.com/hapijs/iron/blob/93fd15c76e656b1973ba134de64f3aeac66a0405/lib/index.js
 * Copyright (c) 2012-2020, Sideway Inc, and project contributors
 * All rights reserved.
 * https://github.com/hapijs/iron/blob/93fd15c76e656b1973ba134de64f3aeac66a0405/LICENSE.md
 *
 * Rewritten and repurposed by Michał Miszczyszyn 2021
 */
import Crypto from 'crypto';
import Util from 'util';

import { invariant } from './errors';

const asyncPbkdf2 = Util.promisify(Crypto.pbkdf2);

const PREFIX = 'Fe26.2' as const;
const SEPARATOR = '*' as const;
const KEY_LEN = 32 as const;
const PBKDF2_ITERATIONS = 10 as const;
const SEALED_CONTENT_LENGTH: SealedContent['length'] = 8;

type BaseContent = readonly [
  prefix: string,
  passwordId: string,
  salt: string,
  iv: string,
  encrypted: string,
  expiration: string,
];
type SignatureContent = readonly [hmacSalt: string, hmacDigest: string];
type SealedContent = readonly [...BaseContent, ...SignatureContent];

export const isSealed = (value: string) => {
  return value.startsWith(PREFIX) && value.split('*').length === SEALED_CONTENT_LENGTH;
};

// export const encryptCookie = ({ value, secret }: { readonly value: string; readonly secret: string }) => {
//   if (secret.length !== 32) {
//     throw new Error('Secret must be exactly 32 characters long!');
//   }

//   const iv = Crypto.randomBytes(16);
//   const cipher = Crypto.createCipheriv('aes256', secret, iv);

//   const encrypted = [iv.toString('base64'), ':', cipher.update(value, 'utf8', 'base64'), cipher.final('base64')].join(
//     '',
//   );
//   return encrypted;
// };

export const seal = async ({
  value,
  secret,
  ttl,
}: {
  readonly value: string;
  readonly secret: string;
  readonly ttl?: number;
}) => {
  invariant(secret.length === KEY_LEN, `Secret must be exactly ${KEY_LEN} characters long!`);

  const key = await generateKey(secret);

  const cipher = Crypto.createCipheriv('aes-256-cbc', key.key, key.iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

  const encryptedB64 = base64urlEncode(encrypted);
  const ivB64 = base64urlEncode(key.iv);
  const keySaltB64 = base64urlEncode(key.salt);
  const expiration = ttl ? Date.now() + ttl : '';
  const baseContent: BaseContent = [PREFIX, '', keySaltB64, ivB64, encryptedB64, String(expiration)];

  const baseString = baseContent.join(SEPARATOR);
  const hmac = await hmacWithPassword(secret, baseString);

  const signature: SignatureContent = [base64urlEncode(hmac.salt), hmac.digest];
  const sealedContent: SealedContent = [...baseContent, ...signature];

  return sealedContent.join(SEPARATOR);
};

export const unseal = async ({ sealed, secret }: { readonly sealed: string; readonly secret: string }) => {
  const sealedContent = sealed.split(SEPARATOR);
  invariant(sealedContent.length === SEALED_CONTENT_LENGTH, 'Cannot unseal: Incorrect data format.');

  const [prefix, _passwordId, keySalt64, ivB64, encryptedB64, expiration, hmacSaltB64, hmacDigest] =
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- must assert
    sealedContent as unknown as SealedContent;

  invariant(prefix === PREFIX, 'Cannot unseal: Unsupported version.');

  if (expiration) {
    invariant(Number.isInteger(Number(expiration)), 'Cannot unseal: Invalid expiration');

    const exp = Number.parseInt(expiration, 10);
    invariant(exp > Date.now(), 'Cannot unseal: Expired seal');
  }

  const baseContent: BaseContent = [PREFIX, '', keySalt64, ivB64, encryptedB64, expiration];
  const baseString = baseContent.join(SEPARATOR);

  const hmacSalt = base64urlDecode(hmacSaltB64);
  const mac = await hmacWithPassword(secret, baseString, hmacSalt);

  invariant(timingSafeEqual(mac.digest, hmacDigest), 'Cannot unseal: Incorrect hmac seal value');

  const encrypted = base64urlDecode(encryptedB64);
  const iv = base64urlDecode(ivB64);
  const keySalt = base64urlDecode(keySalt64);

  const key = await generateKey(secret, keySalt, iv);
  const decipher = Crypto.createDecipheriv('aes-256-cbc', key.key, key.iv);
  return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
};

const generateKey = async (secret: string, maybeSalt?: Buffer, maybeIv?: Buffer) => {
  const salt = maybeSalt ?? Crypto.randomBytes(KEY_LEN);
  const iv = maybeIv ?? Crypto.randomBytes(KEY_LEN / 2);
  const key = await asyncPbkdf2(secret, salt, PBKDF2_ITERATIONS, KEY_LEN, 'sha512');

  return { key, salt, iv };
};

const base64urlEncode = (value: Buffer) => {
  return base64ToUrlEncode(value.toString('base64'));
};

const base64urlDecode = (base64: string) => {
  return Buffer.from(base64, 'base64');
};

const base64ToUrlEncode = (base64: string) => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
};

const hmacWithPassword = async (secret: string, baseString: string, maybeSalt?: Buffer) => {
  const key = await generateKey(secret, maybeSalt);
  const hmac = Crypto.createHmac('sha512', key.key).update(baseString);
  const digest = base64ToUrlEncode(hmac.digest('base64'));

  return {
    digest,
    salt: key.salt,
  };
};

const timingSafeEqual = (a: Parameters<typeof Buffer.from>[0], b: Parameters<typeof Buffer.from>[0]) => {
  try {
    return Crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch (err) {
    return false;
  }
};
