/**
 * @description Get formatted args from process
 */
export const getCleanArguments = (): Record<string, string> => {
  const [, , ...arguments_] = process.argv;
  const cleanArguments: Record<string, string> = {};

  arguments_.forEach(argument => {
    const [argumentName, argumentValue] = argument.split('=');
    cleanArguments[argumentName] = argumentValue;
  });

  return cleanArguments;
};
