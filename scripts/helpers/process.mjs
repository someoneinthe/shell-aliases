/**
 * @description Get formatted args from process
 *
 * @returns {{[key: string]: string}}
 */
export const getCleanArguments = () => {
  const [, , ...arguments_] = process.argv;
  const cleanArguments = {};

  arguments_?.forEach(argument => {
    const [argumentName, argumentValue] = argument.split('=');
    cleanArguments[argumentName] = argumentValue;
  });

  return cleanArguments;
};
