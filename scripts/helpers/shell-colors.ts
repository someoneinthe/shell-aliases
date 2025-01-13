/**
 * @description Add colors to shell output
 */
export enum colorKeys {
  blue = 'blue',
  default = 'default',
  green = 'green',
  red = 'red',
  white = 'white',
  yellow = 'yellow',
}

const shellColors: Partial<Record<colorKeys, string>> = {
  [colorKeys.default]: '\u001B[0;39m',
  [colorKeys.blue]: '\u001B[0;34m',
  [colorKeys.green]: '\u001B[0;32m',
  [colorKeys.red]: '\u001B[0;31m',
  [colorKeys.white]: '\u001B[0;97m',
  [colorKeys.yellow]: '\u001B[0;93m',
};

/**
 * @description Output shell data with given color
 */
export const colorize = (message: string, color: colorKeys = colorKeys.default): string => {
  const colorToDisplay = shellColors[color] ?? shellColors.default;

  return `${colorToDisplay}${message}${shellColors.default}`;
};
