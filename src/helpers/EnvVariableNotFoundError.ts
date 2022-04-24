/**
 * An error object which identifies a missing environment variable.
 */
export class EnvVariableNotFoundError extends Error {
	constructor(name: string) {
		super(`${name} not found in environment variables.`);
		this.name = "EnvVariableNotFoundError";
	}
}
