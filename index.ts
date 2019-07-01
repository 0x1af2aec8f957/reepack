import * as path from "https://deno.land/std/path/mod.ts";
import Log, { RepackLog } from './log.ts';

const serviceDir: string = Deno.cwd();
const configPath: string = path.format({
    root: '/',
    dir: new URL(serviceDir,/* import.meta.url */ 'file://').href, // 脚本加载执行在线资源时，引用默认以WEB形式的路径解析并呈现，需要改为本地文件协议便于动态引入本地文件
    name: 'repack.config',
    ext: '.js',
});

type Config = { // 配置文件
    readonly output: { // 输出
        readonly ext: string, // 文件后缀
        readonly dir: string, // 输出文件夹
    },
    readonly input: { // 输入
        readonly ext: string, // 文件后缀
        readonly dir: string, //输入文件夹
    },
    readonly isFlat?: boolean, // 是否递归
    readonly sep?: string, // 片段分隔符
    readonly extract: RegExp, // 需要提取的正则表达式
    readonly hasManifest?: boolean, // 是否生成清单
    readonly rewrite: ((content: string) => string) | undefined, // 重写[exec Regex] 需要返回你处理的结果，这将覆盖程序处理结果
};

const {
    default: config,
}: {
    default: Config,
} = await import(configPath).catch((error: Error) => { // 读取配置文件
    Log.error(error.message);
    // Log.error(`Make sure that the current working directory contains the configuration file :=> [${configPath}]`);
});

export interface RepackWork{
    readonly pwd: string; // 当前工作目录
    readonly outputDir: string; // 输出目录
    readonly inputDir: string; // 输入目录
    readonly outputExt: string; // 输出文件格式
    readonly inputExt: string; // 输入文件格式
    rewrite?(content: string): string; // 重写函数

    readonly isFlat?: boolean; // 是否递归
    readonly sep?: string; // 片段切割符
    readonly extract: RegExp; // 待提取内容的正则表达式
    readonly hasManifest: boolean; // 待提取内容的正则表达式
}

class FileSystem implements RepackWork {
    pwd: string = serviceDir;
    outputDir: string = config.output.dir;
    inputDir: string = config.input.dir;
    outputExt: string = config.output.ext;
    inputExt: string = config.input.ext;
    rewrite: ((content: string) => string) | undefined = config.rewrite;

    isFlat: boolean = config.isFlat || true;
    sep: string = config.sep || '.';
    extract: RegExp = config.extract;
    hasManifest: boolean = config.hasManifest || false;

    private index: number = 0; // 统计程序处理的次数

    constructor(){
        Log.reply({lf: 'GitHub', rh: 'https://github.com/noteScript/reepack'});
        Log.reply({lf: 'Author', rh: 'noteScript'});
        Log.reply({lf: 'Environment', rh: 'Node、Deno'});
    }

    handleOutput(url?: string): void { // 输出
        const inputDir: string = path.resolve(this.pwd, this.inputDir);
        const outDir: string = path.resolve(this.pwd, this.outputDir);
        const workDir: string = url || inputDir;
	    Deno.mkdirSync(outDir, { recursive: true }); // 创建文件夹
        for (const dirEntry of Deno.readDirSync(workDir)) {
            const {
                isDirectory,
                isFile,
                name,
            }: {
                isDirectory: boolean,
                isFile: boolean,
                name: string
            } = dirEntry;

            switch (true) {
                case isDirectory:
                    if (this.isFlat) this.handleOutput(path.resolve(workDir, name));
                    break;
                case isFile:
                    const readLink: string = path.resolve(workDir, name);
                    const fileInfo: path.ParsedPath = path.parse(readLink);
                    if (fileInfo.ext !== this.inputExt) break;
                    const decoder: TextDecoder = new TextDecoder("utf-8");
                    const encoder: TextEncoder = new TextEncoder();
                    RepackLog.read(readLink);
                    const data: Uint8Array = Deno.readFileSync(readLink);
                    const content: RegExpExecArray | null = this.extract.exec(decoder.decode(data));
                    const fileName: string = path.join(fileInfo.dir, path.sep).replace(path.join(inputDir, path.sep), '').split(path.sep).join(this.sep) + fileInfo.name + this.outputExt;
                    const writeLink: string = path.resolve(outDir, fileName);
                    RepackLog.write(readLink, writeLink);
                    const writeContent: string = content === null ? '' : content[1];
                    Deno.writeFileSync(writeLink, encoder.encode(writeContent));
                    const buffer: Blob = new Blob([writeContent]);
                    RepackLog.compiled(buffer.size, ++this.index, 'write-out');
                    break;
                default:
                    break;
            }

        }
    }

    handleInput(): void { // 输入
        const workDir: string = path.resolve(this.pwd, this.outputDir);
        for (const dirEntry of Deno.readDirSync(workDir)) {
            const fileInfo: path.ParsedPath = path.parse(dirEntry.name);
            if (dirEntry.isFile && fileInfo.ext === this.outputExt){
                const decoder: TextDecoder = new TextDecoder("utf-8");
                const writeLink: string = path.resolve(this.pwd, this.inputDir, ...fileInfo.name.replace(fileInfo.ext, '').split(this.sep)) + this.inputExt;
                RepackLog.read(writeLink);
                const data: Uint8Array = Deno.readFileSync(writeLink);
                const sourceData: string = decoder.decode(data);
                const content: RegExpExecArray | null = this.extract.exec(sourceData);
                const replacerStr: string = content !== null ? content[1] : '';
                if (replacerStr.length > 0){
                    const readLink: string = path.resolve(workDir, dirEntry.name);
                    RepackLog.read(readLink);
                    const writeData: Uint8Array = Deno.readFileSync(readLink);
                    const writeContent: string | null = decoder.decode(writeData);
                    if (writeContent !== null){
                        const encoder: TextEncoder = new TextEncoder();
                        const _writeContent: string = this.handleRewrite(sourceData.replace(replacerStr, writeContent));
                        RepackLog.write(readLink, writeLink);
                        Deno.writeFileSync(writeLink,encoder.encode(_writeContent));
                        RepackLog.compiled(writeData.byteLength, ++this.index, 'write-in');
                    }
                    return;
                }

                Log.warning('Content text was not captured, processing aborted.\n')
            }
        }
    }

    handleRewrite(content: string): string { // 重写
        if (this.rewrite !== undefined) return this.rewrite(content);
        return content;
    }
}

export default new FileSystem();
