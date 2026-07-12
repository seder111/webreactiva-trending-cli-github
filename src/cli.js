import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { fetchTrending } from './fetcher.js';
import { formatCards, formatTable, formatJson } from './formatter.js';

export async function run() {
  const program = new Command();

  program
    .name('trending')
    .description('Muestra los repositorios en tendencia de GitHub')
    .version('1.0.0')
    .option('-l, --lang <lenguaje>', 'Filtrar por lenguaje (ej: javascript, python)')
    .option('-s, --since <periodo>', 'Período: daily, weekly, monthly', 'daily')
    .option('-n, --limit <n>', 'Número de repositorios a mostrar', parseInteger, 10)
    .option('-t, --timeout <ms>', 'Timeout de la petición en milisegundos', parseInteger, 15_000)
    .option('-j, --json', 'Salida en formato JSON (sin colores ni spinner)')
    .option('--table', 'Salida en formato tabla con cli-table3');

  program.parse();

  const opts = program.opts();

  if (!['daily', 'weekly', 'monthly'].includes(opts.since)) {
    console.error('Error: --since debe ser daily, weekly o monthly');
    process.exit(1);
  }

  if (opts.limit < 1 || opts.limit > 50) {
    console.error('Error: --limit debe estar entre 1 y 50');
    process.exit(1);
  }

  const spinner = opts.json ? null : ora('Obteniendo repositorios en tendencia...').start();

  try {
    const repos = await fetchTrending({
      lang: opts.lang,
      since: opts.since,
      limit: opts.limit,
      timeout: opts.timeout,
    });

    if (spinner) spinner.stop();

    if (repos.length === 0) {
      console.log('No se encontraron repositorios para los filtros indicados.');
      return;
    }

    if (opts.json) {
      console.log(formatJson(repos));
    } else if (opts.table) {
      console.log(formatTable(repos));
    } else {
      console.log(formatCards(repos));
    }
  } catch (err) {
    if (spinner) spinner.fail(chalk.red('Error'));
    throw err;
  }
}

function parseInteger(value) {
  const n = parseInt(value, 10);
  if (isNaN(n)) throw new Error(`Valor inválido: ${value}`);
  return n;
}
