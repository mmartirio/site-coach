<#
.SYNOPSIS
  Inicializa o projeto Site Coach.

.DESCRIPTION
  Sem parametros: confere o Node, instala dependencias (ativando o husky),
  roda typecheck + testes e sobe o servidor de desenvolvimento.

.EXAMPLE
  .\iniciar.ps1              # instala, testa e roda "npm run dev"
  .\iniciar.ps1 -SemTestes   # pula typecheck e testes
  .\iniciar.ps1 -Producao    # build de producao + "npm start"
  .\iniciar.ps1 -Docker      # sobe via docker compose
#>
param(
  [switch]$SemTestes,
  [switch]$Producao,
  [switch]$Docker
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Etapa($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

# Porta fixa do site (a 3000 costuma estar com outros projetos). Mesma de package.json e docker-compose.yml.
$Porta = 3010

function Test-PortaLivre {
  $ocupada = Get-NetTCPConnection -LocalPort $Porta -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($ocupada) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($ocupada.OwningProcess)" -ErrorAction SilentlyContinue
    Write-Host "A porta $Porta ja esta em uso pelo processo $($ocupada.OwningProcess):" -ForegroundColor Red
    if ($proc) { Write-Host "    $($proc.CommandLine)" -ForegroundColor Red }
    Write-Host "Feche esse processo (ou rode: Stop-Process -Id $($ocupada.OwningProcess)) e tente de novo." -ForegroundColor Red
    exit 1
  }
}

# Garante que existe uma senha para o painel (/admin). Cria o arquivo com senha aleatoria se faltar.
function Initialize-SenhaPainel($arquivo) {
  if ((Test-Path $arquivo) -and (Select-String -Path $arquivo -Pattern "^ADMIN_PASSWORD=.+" -Quiet)) {
    Write-Host "    Senha do painel definida em $arquivo"
    return
  }
  $bytes = New-Object byte[] 9
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $senha = [Convert]::ToBase64String($bytes).Replace("+", "-").Replace("/", "_")
  Add-Content -Path $arquivo -Value "ADMIN_PASSWORD=$senha" -Encoding ascii
  Write-Host "    Senha do painel criada em ${arquivo}: $senha" -ForegroundColor Yellow
}

function Executar($comando) {
  Write-Host "    $comando" -ForegroundColor DarkGray
  cmd /c $comando
  if ($LASTEXITCODE -ne 0) {
    Write-Host "`nFalhou: $comando (codigo $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
  }
}

if ($Docker) {
  Etapa "Verificando o Docker"
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker nao encontrado. Instale o Docker Desktop." -ForegroundColor Red
    exit 1
  }
  cmd /c "docker info >nul 2>&1"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "O Docker nao esta rodando. Abra o Docker Desktop e tente de novo." -ForegroundColor Red
    exit 1
  }
  Test-PortaLivre
  Initialize-SenhaPainel ".env"
  Etapa "Subindo em http://localhost:3010 (painel: /admin) (Ctrl+C para parar)"
  Executar "docker compose up --build"
  exit 0
}

Etapa "Verificando o Node.js"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js nao encontrado. Instale a versao 20 ou superior: https://nodejs.org" -ForegroundColor Red
  exit 1
}
$versao = (node -v).TrimStart("v")
if ([int]($versao.Split(".")[0]) -lt 20) {
  Write-Host "Node $versao encontrado; e necessario 20 ou superior." -ForegroundColor Red
  exit 1
}
Write-Host "    Node $versao"
Test-PortaLivre
Initialize-SenhaPainel ".env.local"

Etapa "Instalando dependencias (ativa tambem o hook do husky)"
# Primeira vez: "npm ci" (instalacao limpa e fiel ao lock). Depois: "npm install", que e incremental.
if ((Test-Path "package-lock.json") -and -not (Test-Path "node_modules")) { Executar "npm ci" } else { Executar "npm install" }

if (-not $SemTestes) {
  Etapa "Checando tipos"
  Executar "npm run typecheck"
  Etapa "Rodando testes"
  Executar "npm test -- --ci"
}

if ($Producao) {
  Etapa "Gerando build de producao"
  Executar "npm run build"
  Etapa "Servidor de producao em http://localhost:3010 (painel: /admin) (Ctrl+C para parar)"
  Executar "npm start"
} else {
  Etapa "Servidor de desenvolvimento em http://localhost:3010 (painel: /admin) (Ctrl+C para parar)"
  Executar "npm run dev"
}
