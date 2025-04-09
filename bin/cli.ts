#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { buildJourneyDataFiles, buildDatabase, buildAllSoloQuestData } from './build-data';

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
      const outputDir = options.output || 'output';
      
      // 构建journey数据文件
      buildJourneyDataFiles(file, outputDir);

      spinner.succeed(chalk.green('Journey built successfully!'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Build failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('db')
  .description('Build all journey data files')
  .argument('<dir>', 'Root directory containing journey files')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (dir, options) => {
    const spinner = ora('Building database...').start();

    try {
      // 确定输出目录
      const outputDir = options.output || 'data';
      
      // 构建所有journey数据文件
      buildDatabase(dir, outputDir);

      spinner.succeed(chalk.green('Database built successfully!'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Build failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('soloquests')
  .description('Build solo quest markdown files')
  .argument('<dir>', 'Root directory containing solo quest markdown files')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (dir, options) => {
    const spinner = ora('Building solo quests...').start();

    try {
      // Determine output directory
      const outputDir = options.output || 'data';
      
      // Build solo quests data
      buildAllSoloQuestData(dir, outputDir);

      spinner.succeed(chalk.green('Solo quests built successfully!'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Build failed: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
