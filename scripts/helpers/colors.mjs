export const colorKeys = {
  default: 'default',
  green: 'green',
  red: 'red',
  white: 'white',
  yellow: 'yellow',
}

const colors = {
  [colorKeys.default]: '\u001B[0;39m',
  [colorKeys.green]: '\u001B[0;32m',
  [colorKeys.red]: '\u001B[0;31m',
  [colorKeys.white]: '\u001B[0;97m',
  [colorKeys.yellow]: '\u001B[0;93m',
}

export const colorize = (message, color = colorKeys.default) => {
  const colorToDisplay = colors[color] ?? colors.default;

  return `${colorToDisplay}${message}${colors.default}`;
}
