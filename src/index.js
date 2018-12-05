import Generator from 'yeoman-generator';
import { join, extname, resolve, dirname, basename } from 'path';
import { readFileSync, existsSync, statSync } from 'fs';
import chalk from 'chalk';
import uniq from 'lodash/uniq';

export function getDependencies(content) {
  // 不用 ast 语法树是因为解析语法可能会出错
  const deps = [];
  const reg1 = /import(.+from)?\s+[\'\"]([@\.\/\w\-]+)[\'\"]/g;
  const reg2 = /import\([\'\"]([\.\/\w\-]+)[\'\"]\)/g;
  const reg3 = /@import\s+[\'\"]\~([@\.\/\w\-]+)[\'\"]/g; // for style import
  let match;
  while ((match = reg1.exec(content)) !== null) {
    deps.push(match[2]);
  }
  while ((match = reg2.exec(content)) !== null) {
    deps.push(match[1]);
  }
  while ((match = reg3.exec(content)) !== null) {
    deps.push(match[1]);
  }
  return deps;
}

class Convertor extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.opts = {
      ...opts,
      source: resolve(process.cwd(), opts.source),
      target: resolve(process.cwd(), opts.target),
    };
    this.cwd = process.cwd();
    this.packageDeps = [];
  }

  async writing() {
    const { source, target, extFiles = []} = this.opts;
    this._copyFile(source, join(target, 'src', `index${extname(source)}`));
    console.log(`extFiles: ${extFiles}`);
    extFiles.forEach(ext => {
      if (this.opts.dryRun) {
        console.log(chalk.green(`dry run: start copy ${join(this.cwd, ext[0])} to ${jkoin(this.cwd, ext[1])}`));
      } else {
        this._copyFile(resolve(this.cwd, ext[0]), resolve(target, ext[1]));
      }
    });
    if (this.opts.dryRun) {
      console.log('dry run, skip copy tempaltes');
    } else {
      const context = {
        props: {
          repo: 'umijs/umi-blocks',
          name: basename(target).toLocaleLowerCase(),
          description:  basename(target),
          ...this.opts,
        },
        packageDeps: uniq(this.packageDeps).filter(dep => {
          return dep !== 'umi'  && dep !== '@alipay/bigfish';
        }).map(dep => {
          let version = '*';
          let packageJson = {
            dependencies: {},
          }
          const packageFilePath = join(this.cwd, 'package.json');
          if (existsSync(packageFilePath)) {
            packageJson = require(packageFilePath);
          } else {
            console.log(chalk.yellow(`not find ${packageJson}`));
          }
          if (packageJson.dependencies[dep]) {
            version = packageJson.dependencies[dep];
          } else {
            console.log(chalk.yellow(`not find version of ${dep} in package.json, use ${version}.`));
          }
          return [dep, version];
        }),
      };
      this.fs.copy(this.templatePath('_gitignore'), join(target, '.gitignore'));
      this.fs.copy(this.templatePath('.umirc.js'), join(target, '.umirc.js'));
      this.fs.copyTpl(this.templatePath('package.json'), join(target, 'package.json'), context);
      this.fs.copyTpl(this.templatePath('README.md'), join(target, 'README.md'), context);
    }
  }

  _copyFile(filePath, target) {
    const blockFolder = this.opts.target;
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
    let realPath, realTarget;
    for(let i = 0; i < exts.length; i++) {
      let ext = exts[i];
      if (existsSync(`${filePath}${ext}`) && statSync(`${filePath}${ext}`).isFile()) {
        realPath = `${filePath}${ext}`;
        realTarget = `${target}${ext}`;
        break;
      }
    }
    if (!realPath) {
      console.log(chalk.yellow(`warn: not find ${filePath}`));
      return;
    }
    
    if (this.opts.dryRun) {
      console.log(chalk.green(`dry run: start copy ${realPath} to ${realTarget}`));
    } else {
      this.fs.copy(realPath, realTarget);
    }
    const content = readFileSync(realPath, 'utf-8');
    const deps = getDependencies(content);
    const folder = dirname(realPath);
    const targetFloder = dirname(realTarget);
    let srcFolder = join(process.cwd(), 'src');
    if (!existsSync(srcFolder)) {
      srcFolder = process.cwd();
    }
    if (deps.length) {
      console.log(`find deps ${deps.join(',')} in ${realPath}`);
    }
    deps.forEach((dep) => {
      console.log(`processing dep: ${dep}`);
      if (/^@\//.test(dep)) {
        this._copyFile(join(srcFolder, dep.replace(/^@\//, '')), join(blockFolder, '@', dep.replace(/^@\//, '')));
      } else if (/^[@\w\-]+/.test(dep)) {
        const parts = dep.split('/');
        // lodash-decorators/debounce -> lodash-decorators
        this.packageDeps.push(dep.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]);
      } else if (/^[\.\/]+/.test(dep)) {
        this._copyFile(join(folder, dep), join(targetFloder, dep));
      } else {
        console.log(chalk.yellow(`warn: not recognize ${dep}`));
      }
    });
  }
}

export default (opts) => {
  const convertor = new Convertor([], {
    env: {
      cwd: process.cwd(),
    },
    resolved: __dirname,
    ...opts
  });
  convertor.run();
};
