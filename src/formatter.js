import chalk from 'chalk';
import Table from 'cli-table3';
import { getLanguageColor } from './language-colors.js';

function formatStars(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatCards(repos) {
  const lines = [];

  for (const repo of repos) {
    const line = [];

    line.push(`  ${chalk.dim(`${repo.rank}.`)} ${chalk.bold.cyan(repo.name)}`);

    const starsParts = [];
    starsParts.push(chalk.yellow(`★ ${repo.totalStars.toLocaleString()}`));
    if (repo.periodStars > 0) {
      const       label = repo.periodLabel === 'today' ? ' today' : ` this ${repo.periodLabel}`;
      starsParts.push(chalk.green(`+${repo.periodStars.toLocaleString()}${label}`));
    }
    line.push(`     ${starsParts.join('  ')}`);

    if (repo.language) {
      const color = chalk.hex(getLanguageColor(repo.language));
      line.push(`     ${color('●')} ${color(repo.language)}`);
    }

    if (repo.description) {
      line.push(`     ${repo.description}`);
    }

    line.push(`     ${chalk.dim(repo.url)}`);

    lines.push(line.join('\n'));
  }

  return lines.join('\n' + chalk.dim('  ─────────────────────────────────────────────────────') + '\n');
}

export function formatTable(repos) {
  const table = new Table({
    chars: {
      top: '', 'top-mid': '', 'top-left': '', 'top-right': '',
      bottom: '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      left: '', 'left-mid': '', mid: '', 'mid-mid': '',
      right: '', 'right-mid': '', middle: '  ',
    },
    style: { 'padding-left': 0, 'padding-right': 2 },
  });

  for (const repo of repos) {
    const langColor = repo.language ? chalk.hex(getLanguageColor(repo.language)) : chalk.gray;
    const langDisplay = repo.language
      ? `${langColor('●')} ${langColor(repo.language)}`
      : chalk.dim('—');

    const periodStr = repo.periodStars > 0
      ? chalk.green(`+${repo.periodStars.toLocaleString()}`)
      : '';

    const starsStr = chalk.yellow(formatStars(repo.totalStars));

    table.push([
      chalk.dim(repo.rank),
      chalk.bold.cyan(repo.name),
      langDisplay,
      starsStr,
      periodStr,
    ]);
  }

  const header = chalk.dim('#  Repository                                          Language         Stars      +Period');
  return header + '\n' + table.toString();
}

export function formatJson(repos) {
  return JSON.stringify(repos, null, 2);
}
