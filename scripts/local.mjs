#!/usr/bin/env node
/**
 * MiniCRM: sobe o projeto do zero com UM comando.
 *
 *   pnpm local            prepara tudo e inicia web + API (foreground)
 *   pnpm local:setup      prepara tudo e termina (sem iniciar os servidores)
 *   pnpm local:stop       para o PostgreSQL (mantém os dados)
 *   pnpm local:reset      APAGA o banco (docker compose down -v), pede confirmação
 *
 * Sem dependências: somente módulos nativos do Node. Idempotente: pode ser
 * executado quantas vezes quiser; nunca sobrescreve um .env existente.
 */
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = join(ROOT, ".env");
const ENV_EXAMPLE = join(ROOT, ".env.example");
const IS_WINDOWS = process.platform === "win32";

const WEB_PORT = 5173;
const JWT_PLACEHOLDER =
    "replace_with_a_random_secret_of_at_least_32_characters";
const MIN_NODE_MAJOR = 20;

// ---------------------------------------------------------------- saída ---

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) =>
    useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text);
const c = {
    bold: paint("1"),
    dim: paint("2"),
    red: paint("31"),
    green: paint("32"),
    yellow: paint("33"),
    cyan: paint("36"),
};

let stepNumber = 0;
let totalSteps = 0;
const step = (text) =>
    console.log(
        `\n${c.cyan(c.bold(`[${++stepNumber}/${totalSteps}]`))} ${c.bold(text)}`
    );
const ok = (text) => console.log(`    ${c.green("✔")} ${text}`);
const info = (text) => console.log(`    ${c.dim("•")} ${text}`);
const warn = (text) => console.log(`    ${c.yellow("!")} ${c.yellow(text)}`);

/** Erro com instruções de correção; encerra o script com código 1. */
class UserError extends Error {
    constructor(message, hints = []) {
        super(message);
        this.hints = hints;
    }
}

const fail = (message, ...hints) => {
    throw new UserError(message, hints);
};

// -------------------------------------------------------------- comandos ---

/** Executa e captura a saída (para checagens). */
const capture = (cmd, args, options = {}) =>
    spawnSync(cmd, args, {
        cwd: ROOT,
        encoding: "utf8",
        shell: IS_WINDOWS,
        ...options,
    });

/** Executa herdando stdio (o usuário vê a saída). Resolve com o código. */
const run = (cmd, args, options = {}) =>
    new Promise((resolve) => {
        const child = spawn(cmd, args, {
            cwd: ROOT,
            stdio: "inherit",
            shell: IS_WINDOWS,
            ...options,
        });
        child.on("error", () => resolve(127));
        child.on("close", (code) => resolve(code ?? 1));
    });

/** Executa herdando stdin/stdout, mas copiando stderr (para diagnosticar). */
const runTee = (cmd, args) =>
    new Promise((resolve) => {
        let stderr = "";
        const child = spawn(cmd, args, {
            cwd: ROOT,
            stdio: ["inherit", "inherit", "pipe"],
            shell: IS_WINDOWS,
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk;
            process.stderr.write(chunk);
        });
        child.on("error", () => resolve({ code: 127, stderr }));
        child.on("close", (code) => resolve({ code: code ?? 1, stderr }));
    });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------------ .env ---

const parseEnv = (text) => {
    const values = {};
    for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
        if (!match) continue;
        let value = match[2].trim();
        if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
        values[match[1]] = value;
    }
    return values;
};

const readEnv = () => parseEnv(readFileSync(ENV_FILE, "utf8"));

/**
 * Cria o .env a partir do .env.example (com JWT_SECRET aleatório) se faltar.
 * Se já existir, só ACRESCENTA variáveis ausentes; nunca altera as existentes.
 */
const ensureEnvFile = () => {
    if (!existsSync(ENV_EXAMPLE)) {
        fail(
            "Arquivo .env.example não encontrado.",
            "Rode o comando na raiz do repositório e confirme que o clone está completo (git status)."
        );
    }
    const example = readFileSync(ENV_EXAMPLE, "utf8");

    if (!existsSync(ENV_FILE)) {
        const secret = randomBytes(48).toString("base64");
        const content = example.replace(
            /^JWT_SECRET=.*$/m,
            () => `JWT_SECRET=${secret}`
        );
        writeFileSync(ENV_FILE, content, { mode: 0o600 });
        ok(".env criado a partir de .env.example com um JWT_SECRET aleatório.");
        return;
    }

    ok(".env já existe: mantido sem alterações nas variáveis atuais.");
    const current = readEnv();
    const defaults = parseEnv(example);
    const missing = Object.keys(defaults).filter(
        (key) => !(key in current) && key !== "JWT_SECRET"
    );
    if (missing.length > 0) {
        // VITE_DEMO_* acompanham o usuário do seed para o botão de demo funcionar.
        const fallback = {
            VITE_DEMO_EMAIL:
                current.SEED_USER_EMAIL ?? defaults.VITE_DEMO_EMAIL,
            VITE_DEMO_PASSWORD:
                current.SEED_USER_PASSWORD ?? defaults.VITE_DEMO_PASSWORD,
        };
        const lines = missing.map(
            (key) => `${key}=${fallback[key] ?? defaults[key]}`
        );
        const existing = readFileSync(ENV_FILE, "utf8");
        const separator = existing.endsWith("\n") ? "" : "\n";
        writeFileSync(
            ENV_FILE,
            `${existing}${separator}\n# Adicionadas por scripts/local.mjs\n${lines.join("\n")}\n`
        );
        warn(`Variáveis ausentes acrescentadas ao .env: ${missing.join(", ")}`);
    }
};

/** Valida o que a API exige na inicialização e a coerência do usuário demo. */
const validateEnvFile = () => {
    const env = readEnv();
    for (const key of [
        "DATABASE_URL",
        "JWT_SECRET",
        "FRONTEND_URL",
        "SERVER_PORT",
        "SEED_USER_NAME",
        "SEED_USER_EMAIL",
        "SEED_USER_PASSWORD",
    ]) {
        if (!env[key]) {
            fail(
                `Variável obrigatória ausente no .env: ${key}`,
                `Defina ${key} (veja .env.example) ou apague o .env para gerar um novo.`
            );
        }
    }
    if (env.JWT_SECRET.length < 32) {
        fail(
            "JWT_SECRET no .env tem menos de 32 caracteres (a API recusaria iniciar).",
            "Gere outro: openssl rand -base64 48"
        );
    }
    if (env.JWT_SECRET === JWT_PLACEHOLDER) {
        warn("JWT_SECRET ainda é o valor de exemplo. Troque por um aleatório.");
    }
    if (
        env.VITE_DEMO_EMAIL !== env.SEED_USER_EMAIL ||
        env.VITE_DEMO_PASSWORD !== env.SEED_USER_PASSWORD
    ) {
        warn(
            "VITE_DEMO_EMAIL/VITE_DEMO_PASSWORD diferem de SEED_USER_*: o botão de demonstração do login não vai autenticar. Deixe-os iguais."
        );
    }
    return env;
};

// --------------------------------------------------------- pré-requisitos ---

const checkPrerequisites = () => {
    const major = Number(process.versions.node.split(".")[0]);
    if (major < MIN_NODE_MAJOR) {
        fail(
            `Node ${process.versions.node} é muito antigo (necessário >= ${MIN_NODE_MAJOR}).`,
            "Instale a versão LTS em https://nodejs.org ou use nvm: nvm install --lts"
        );
    }
    ok(`Node ${process.versions.node}`);

    const pnpm = capture("pnpm", ["--version"]);
    if (pnpm.status !== 0) {
        fail(
            "pnpm não encontrado.",
            "Ative via Corepack: corepack enable   (ou: npm install -g pnpm)",
            "Mais opções: https://pnpm.io/installation"
        );
    }
    ok(`pnpm ${pnpm.stdout.trim()}`);

    const docker = capture("docker", ["--version"]);
    if (docker.status !== 0) {
        fail(
            "Docker não encontrado.",
            "Instale o Docker Engine/Docker Desktop: https://docs.docker.com/get-docker/"
        );
    }
    const compose = capture("docker", ["compose", "version"]);
    if (compose.status !== 0) {
        fail(
            "O plugin `docker compose` (v2) não está disponível.",
            "Atualize o Docker Desktop ou instale o plugin: https://docs.docker.com/compose/install/"
        );
    }
    const daemon = capture("docker", ["info"]);
    if (daemon.status !== 0) {
        const denied = /permission denied/i.test(daemon.stderr ?? "");
        fail(
            denied
                ? "Sem permissão para acessar o Docker."
                : "O Docker está instalado, mas o daemon não está rodando.",
            ...(denied
                ? [
                      "Linux: sudo usermod -aG docker $USER  (depois faça logout/login)",
                  ]
                : [
                      "Abra o Docker Desktop, ou no Linux: sudo systemctl start docker",
                  ])
        );
    }
    ok(`${docker.stdout.trim()} (daemon ativo, ${compose.stdout.trim()})`);
};

// ---------------------------------------------------------------- docker ---

const tcpOpen = (port, host = "127.0.0.1", timeout = 1000) =>
    new Promise((resolve) => {
        const socket = net.connect({ host, port });
        const done = (result) => {
            socket.destroy();
            resolve(result);
        };
        socket.setTimeout(timeout, () => done(false));
        socket.once("connect", () => done(true));
        socket.once("error", () => done(false));
    });

const startDatabase = async (env) => {
    const port = env.POSTGRES_PORT ?? "5485";
    const { code, stderr } = await runTee("docker", [
        "compose",
        "up",
        "-d",
        "--wait",
    ]);
    if (code !== 0) {
        if (
            /already allocated|address already in use|port is already/i.test(
                stderr
            )
        ) {
            fail(
                `A porta ${port} do PostgreSQL já está em uso por outro processo/container.`,
                "Opção 1: libere a porta (docker ps  para ver quem a usa).",
                `Opção 2: troque POSTGRES_PORT no .env e ajuste a porta em DATABASE_URL para o mesmo valor (ex.: 5486).`
            );
        }
        fail(
            "Falha ao subir o PostgreSQL com docker compose.",
            "Veja a mensagem acima. Para diagnosticar: docker compose logs postgres",
            "Se o banco ficou inconsistente e você aceita perder os dados: pnpm local:reset"
        );
    }
    ok("PostgreSQL saudável (healthcheck ok).");

    // O healthcheck pode passar enquanto o Postgres ainda inicializa: confirma a porta TCP.
    for (let i = 0; i < 30; i++) {
        if (await tcpOpen(Number(port))) return;
        await sleep(1000);
    }
    fail(
        `PostgreSQL não aceitou conexões em 127.0.0.1:${port}.`,
        "Confirme que POSTGRES_PORT e a porta em DATABASE_URL (.env) são iguais."
    );
};

// ------------------------------------------------------------ dependências ---

const pnpmRun = async (args, what) => {
    const code = await run("pnpm", args);
    if (code !== 0) {
        fail(`Falha ao executar: ${what}`, `Comando: pnpm ${args.join(" ")}`);
    }
};

const installDependencies = async () => {
    if (existsSync(join(ROOT, "pnpm-lock.yaml"))) {
        const code = await run("pnpm", ["install", "--frozen-lockfile"]);
        if (code === 0)
            return ok("Dependências instaladas (lockfile respeitado).");
        warn("`--frozen-lockfile` falhou; tentando `pnpm install` normal.");
    }
    await pnpmRun(["install"], "pnpm install");
    ok("Dependências instaladas.");
};

const databaseScript = async (script, label) => {
    // A 1ª conexão logo após o container subir pode falhar: tenta algumas vezes.
    const attempts = 5;
    for (let i = 1; i <= attempts; i++) {
        const code = await run("pnpm", [
            "--filter",
            "@mini-crm/database",
            script,
        ]);
        if (code === 0) return ok(`${label}: ok.`);
        if (i < attempts) {
            warn(
                `${label} falhou (tentativa ${i}/${attempts}); aguardando o banco...`
            );
            await sleep(3000);
        }
    }
    fail(
        `${label} falhou após ${attempts} tentativas.`,
        "Confira DATABASE_URL no .env (usuário, senha, porta e banco devem bater com POSTGRES_*).",
        "Logs do banco: docker compose logs postgres"
    );
};

// ------------------------------------------------------------ iniciar dev ---

const checkPortsFree = async (env) => {
    const apiPort = Number(env.SERVER_PORT);
    if (await tcpOpen(apiPort)) {
        fail(
            `A porta da API (${apiPort}) já está em uso.`,
            "Encerre o processo que a usa (ex.: um `pnpm dev` anterior) ou mude SERVER_PORT/API_URL/VITE_BASE_API_URL no .env."
        );
    }
    if (await tcpOpen(WEB_PORT)) {
        fail(
            `A porta do front-end (${WEB_PORT}) já está em uso.`,
            "Encerre o processo que a usa; FRONTEND_URL (CORS da API) assume a porta 5173."
        );
    }
};

const httpOk = async (url) => {
    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(2000),
        });
        return response.status < 500;
    } catch {
        return false;
    }
};

const printAccess = (env) => {
    const api = env.API_URL ?? `http://localhost:${env.SERVER_PORT}`;
    console.log(`\n${c.bold("  Acesse")}`);
    console.log(
        `    Aplicação (web):   ${c.cyan(`http://localhost:${WEB_PORT}`)}`
    );
    console.log(`    Documentação API:  ${c.cyan(`${api}/api-docs`)}`);
    console.log(`\n${c.bold("  Login de demonstração")}`);
    console.log(`    E-mail: ${c.bold(env.SEED_USER_EMAIL)}`);
    console.log(`    Senha:  ${c.bold(env.SEED_USER_PASSWORD)}`);
    console.log(
        c.dim(
            '    (a tela de login também tem o botão "Preencher credenciais de demonstração")'
        )
    );
    console.log(
        c.dim(
            "\n  Ctrl+C encerra web e API. O banco segue rodando (pnpm local:stop)."
        )
    );
};

const startDev = async (env) => {
    const api = env.API_URL ?? `http://localhost:${env.SERVER_PORT}`;
    printAccess(env);
    console.log(`\n${c.bold("Iniciando `pnpm dev`...")}\n`);

    const child = spawn("pnpm", ["dev"], {
        cwd: ROOT,
        stdio: "inherit",
        shell: IS_WINDOWS,
    });

    let stopping = false;
    const forward = (signal) => {
        stopping = true;
        if (!child.killed) child.kill(signal);
    };
    process.on("SIGINT", () => forward("SIGINT"));
    process.on("SIGTERM", () => forward("SIGTERM"));

    // Melhor esforço: avisa quando web e API respondem, sem bloquear o dev.
    void (async () => {
        const deadline = Date.now() + 120_000;
        while (!stopping && child.exitCode === null && Date.now() < deadline) {
            const [web, apiUp] = await Promise.all([
                httpOk(`http://localhost:${WEB_PORT}`),
                httpOk(`${api}/health/ping`),
            ]);
            if (web && apiUp) {
                console.log(
                    `\n${c.green(c.bold("✔ Pronto!"))} Abra ${c.cyan(`http://localhost:${WEB_PORT}`)}\n`
                );
                return;
            }
            await sleep(1500);
        }
    })();

    return new Promise((resolve) => {
        child.on("error", () => resolve(1));
        child.on("close", (code, signal) => {
            stopping = true;
            resolve(signal || code === null ? 0 : code);
        });
    });
};

// ------------------------------------------------------- stop / reset ---

const stopCommand = async () => {
    console.log(c.bold("Parando o PostgreSQL (os dados são mantidos)..."));
    const code = await run("docker", ["compose", "stop"]);
    if (code !== 0) fail("Falha ao parar o docker compose.");
    ok("Parado. Para voltar: pnpm local");
};

const resetCommand = async (flags) => {
    console.log(
        c.red(
            c.bold(
                "ATENÇÃO: isto apaga o container e o volume do PostgreSQL (todos os contatos, negócios e notas)."
            )
        )
    );
    if (!flags.has("--yes") && !flags.has("-y")) {
        if (!process.stdin.isTTY) {
            fail(
                "Confirmação necessária e não há terminal interativo.",
                "Rode com --yes:  pnpm local:reset -- --yes"
            );
        }
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const answer = (await rl.question("Digite y para confirmar [y/N]: "))
            .trim()
            .toLowerCase();
        rl.close();
        if (answer !== "y" && answer !== "yes" && answer !== "s") {
            console.log("Cancelado. Nada foi alterado.");
            return;
        }
    }
    const code = await run("docker", ["compose", "down", "-v"]);
    if (code !== 0) fail("Falha ao executar docker compose down -v.");
    ok("Banco removido. O .env e as dependências foram mantidos.");
    info("Para recriar tudo do zero: pnpm local");
};

// ------------------------------------------------------------------ main ---

const HELP = `
${c.bold("MiniCRM: setup local em um comando")}

  pnpm local               prepara tudo e inicia web + API
  pnpm local:setup         prepara tudo e termina (--no-start)
  pnpm local:stop          para o PostgreSQL (mantém os dados)
  pnpm local:reset         apaga o banco (pede confirmação; use -- --yes para pular)

Opções de node scripts/local.mjs [stop|reset]:
  --no-start   não inicia os servidores de desenvolvimento
  --env-only   apenas cria/valida o .env e termina (não usa Docker)
  --yes, -y    confirma o reset sem perguntar
  --help, -h   mostra esta ajuda
`;

const main = async () => {
    const args = process.argv.slice(2);
    const flags = new Set(args.filter((arg) => arg.startsWith("-")));
    const command = args.find((arg) => !arg.startsWith("-"));

    if (flags.has("--help") || flags.has("-h")) return console.log(HELP);
    if (command && command !== "stop" && command !== "reset") {
        fail(
            `Comando desconhecido: ${command}`,
            "Use --help para ver as opções."
        );
    }
    if (command === "stop") return stopCommand();
    if (command === "reset") {
        const preflight = capture("docker", ["info"]);
        if (preflight.status !== 0) {
            fail(
                "O Docker não está acessível.",
                "Inicie o Docker e tente de novo."
            );
        }
        return resetCommand(flags);
    }

    const envOnly = flags.has("--env-only");
    const start = !flags.has("--no-start") && !envOnly;
    totalSteps = envOnly ? 1 : start ? 7 : 6;
    console.log(c.bold("\nMiniCRM: preparando o ambiente local"));

    if (!envOnly) {
        step("Verificando pré-requisitos");
        checkPrerequisites();
    }

    step("Configurando o arquivo .env");
    ensureEnvFile();
    const env = validateEnvFile();
    if (envOnly) return ok("Configuração do .env válida.");

    step("Subindo o PostgreSQL (docker compose)");
    await startDatabase(env);

    step("Instalando dependências (pnpm)");
    await installDependencies();

    step("Aplicando migrações do banco");
    await databaseScript("db:migrate", "Migrações");

    step("Criando usuário e estágios (seed) e dados de demonstração");
    await databaseScript("db:seed", "Seed (usuário e estágios)");
    await databaseScript("db:seed:demo", "Dados de demonstração");

    if (!start) {
        console.log(
            `\n${c.green(c.bold("✔ Ambiente preparado."))} Para iniciar: ${c.bold("pnpm dev")}`
        );
        printAccess(env);
        return;
    }

    step("Iniciando web e API");
    await checkPortsFree(env);
    process.exitCode = await startDev(env);
};

main().catch((error) => {
    if (error instanceof UserError) {
        console.error(`\n${c.red(c.bold("✘ Erro:"))} ${c.red(error.message)}`);
        for (const hint of error.hints)
            console.error(`  ${c.yellow("→")} ${hint}`);
        console.error("");
    } else {
        console.error(error);
    }
    process.exitCode = 1;
});
