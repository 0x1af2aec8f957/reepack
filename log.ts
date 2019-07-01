import {
  white,
  bold,
  yellow,
  blue,
  red,
  underline,
} from "https://deno.land/std/fmt/colors.ts";

export default class Log {
  static success(message: string): void {
    console.log(`${bold(yellow('Success'))} ${blue(message)}`);
  }

  static error(message: string): void {
    console.log(`${bold(yellow('Error'))} ${red(message)}\n`);
    console.log(red("......Exiting......"));
    Deno.exit();
  }

  static warning(message: string): void {
    console.log(`${red(bold('Warning'))} ${yellow(message)}`);
  }

  static log(message: string): void {
    console.log(`${new Date().getTime()} ${message}`);
  }

  static reply(message: {lf: string, rh: string}, hasUnderline: boolean = false): void {
    const valueMessage: string = hasUnderline ? blue(underline(message.rh)) : blue(message.rh);
    const keyMessage: string = yellow(message.lf);
    console.log(`${keyMessage}: ${valueMessage}`);
  }

  static underline(message: string): void {
    console.log(`${underline(message)}`);
  }

  static bold(message: string): void {
    console.log(`${bold(message)}`);
  }
}

export class RepackLog{
  static read(path: string): void{ // 读取提示
    console.log(`🍹 ${bold(yellow('Reading'))} ${underline(blue(path))}`);
  }

  static write(fromPath: string, toPath: string): void{ // 写入提示
    console.log(`🍺 ${bold(yellow('Writing'))} ${bold('from')} ${underline(blue(fromPath))} ${bold('to')} ${underline(blue(toPath))}`);
  }

  static compiled(size: number, index: number, direction: string): void{
    console.log(`🍾 ${bold(yellow('Compiled'))} ${bold(red('Count:' + index))}${blue('—')}${bold(red('Byte:' + size))}${blue('—')}${bold(red('Direction:' + direction))}`);
    console.log(`⏳ ${bold(yellow('Date'))} ${bold(blue(new Date().toUTCString()))}\n`);
  }
}
