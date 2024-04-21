import { ValidationError as VE } from 'class-validator';

export class ValidationError extends Error {
  constructor(errors: Array<VE>) {
    const messages = errors.map((error) => {
      const { constraints, property, target } = error;

      if (constraints) {
        const formattedConstraints = Object.entries(constraints)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join('\n');

        let message = `${property} validation failed:\n${formattedConstraints}\n`;

        if (target) {
          message = `${target.constructor.name} ${message}`;
        }

        return message;
      }

      return error;
    });

    super(`\n${messages.join('\n')}`);
  }
}
