#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs';

const program = new Command();

program
  .name('mathertale-build')
  .description('CLI tool for building Mathertale projects')
  .version('1.0.0');

program
  .command('journey')
  .description('Build journey canvas file')
  .argument('<file>', 'Journey canvas file path')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (file, options) => {
    const spinner = ora('Building journey...').start();

    try {
      // 验证输入文件
      if (!file.endsWith('.journey.canvas')) {
        throw new Error('Input file must end with .journey.canvas');
      }

      // 确定输出目录
      const outputDir = options.output || process.cwd();
      
      // 确保输出目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // TODO: 在这里处理 journey canvas 文件
      console.log('Processing journey canvas file:', file);
      console.log('Output directory:', outputDir);

      spinner.succeed(chalk.green('Journey built successfully!'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Build failed: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
