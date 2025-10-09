/**
 * @description Add colors to shell output
 */
export enum ColorKeys {
  BLUE = 'blue',
  DEFAULT = 'default',
  GREEN = 'green',
  RED = 'red',
  WHITE = 'white',
  YELLOW = 'yellow',
}

const shellColors: Record<ColorKeys, string> = {
  [ColorKeys.DEFAULT]: '\u001B[0m',
  [ColorKeys.BLUE]: '\u001B[0;34m',
  [ColorKeys.GREEN]: '\u001B[0;32m',
  [ColorKeys.RED]: '\u001B[0;31m',
  [ColorKeys.WHITE]: '\u001B[0;97m',
  [ColorKeys.YELLOW]: '\u001B[0;33m',
};

const isColorKey = (key: string): key is ColorKeys => Object.values(ColorKeys).includes(key as ColorKeys);

/**
 * @description Output shell data with given color
 */
export const colorize = (message: string, color: ColorKeys | string = ColorKeys.DEFAULT): string => {
  const colorToDisplay = isColorKey(color) ? shellColors[color] : color;

  return `${colorToDisplay}${message}${shellColors.default}`;
};
