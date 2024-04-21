import { createHash } from 'crypto';

export function Sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}
