import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

export const metaRoutes = Router();

const routes = [
  { method: 'POST', path: '/auth/login', auth: false, description: 'Login de usuário TI' },
  { method: 'POST', path: '/auth/registrar-primeiro', auth: false, description: 'Registrar o primeiro usuário TI (apenas se DB vazio)' },

  { method: 'GET', path: '/health', auth: false, description: 'Health check' },

  { method: 'POST', path: '/setores', auth: true, description: 'Criar setor' },
  { method: 'GET', path: '/setores', auth: true, description: 'Listar setores' },
  { method: 'PUT', path: '/setores/:id', auth: true, description: 'Atualizar setor' },
  { method: 'DELETE', path: '/setores/:id', auth: true, description: 'Deletar setor' },

  { method: 'POST', path: '/funcionarios', auth: true, description: 'Criar funcionário' },
  { method: 'GET', path: '/funcionarios', auth: true, description: 'Listar funcionários' },
  { method: 'PUT', path: '/funcionarios/:id', auth: true, description: 'Atualizar funcionário' },
  { method: 'DELETE', path: '/funcionarios/:id', auth: true, description: 'Deletar funcionário' },

  { method: 'POST', path: '/ativos', auth: true, description: 'Criar ativo' },
  { method: 'GET', path: '/ativos', auth: true, description: 'Listar ativos' },
  { method: 'PUT', path: '/ativos/:id', auth: true, description: 'Atualizar ativo' },
  { method: 'DELETE', path: '/ativos/:id', auth: true, description: 'Deletar ativo' },

  { method: 'POST', path: '/usuarios-ti', auth: true, description: 'Criar usuário TI' },
  { method: 'GET', path: '/usuarios-ti', auth: true, description: 'Listar usuários TI' },
  { method: 'PUT', path: '/usuarios-ti/:id', auth: true, description: 'Atualizar usuário TI' },
  { method: 'DELETE', path: '/usuarios-ti/:id', auth: true, description: 'Deletar usuário TI' },
];

metaRoutes.get('/api/routes', asyncHandler((_req: Request, res: Response) => {
  return res.json({ data: routes });
}));

metaRoutes.get('/api/docs', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>API - Rotas | Gestão Ativos TI</title>
  <style>
    :root{--bg:#0f1724;--card:#0b1220;--muted:#9aa4b2;--accent:#7c3aed;--success:#10b981;--danger:#ef4444}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial; background:linear-gradient(180deg,#071026 0%,#071428 100%);color:#e6eef6;-webkit-font-smoothing:antialiased}
    .wrap{max-width:1100px;margin:40px auto;padding:24px}
    header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
    h1{font-size:20px;margin:0}
    p.lead{margin:4px 0 0;color:var(--muted)}
    .search{display:flex;gap:12px;margin:20px 0}
    .search input{flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.02);color:inherit}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
    .card{background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.03)}
    .row{display:flex;align-items:center;gap:10px}
    .badge{font-weight:700;padding:6px 10px;border-radius:999px;font-size:12px}
    .GET{background:rgba(16,185,129,0.12);color:var(--success);border:1px solid rgba(16,185,129,0.08)}
    .POST{background:rgba(124,58,237,0.12);color:var(--accent);border:1px solid rgba(124,58,237,0.08)}
    .PUT{background:rgba(59,130,246,0.08);color:#60a5fa;border:1px solid rgba(96,165,250,0.04)}
    .DELETE{background:rgba(239,68,68,0.08);color:var(--danger);border:1px solid rgba(239,68,68,0.04)}
    .muted{color:var(--muted);font-size:13px;margin-top:6px}
    .actions{margin-left:auto;display:flex;gap:8px}
    button.copy{background:transparent;border:1px solid rgba(255,255,255,0.03);color:inherit;padding:6px 10px;border-radius:8px;cursor:pointer}
    footer{margin-top:26px;color:var(--muted);font-size:13px}
    @media (max-width:520px){.row{flex-direction:column;align-items:flex-start}.actions{width:100%;justify-content:space-between}}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>API — Rotas disponíveis</h1>
        <p class="lead">Lista das rotas, métodos e se exigem autenticação (Bearer token).</p>
      </div>
      <div>
        <a href="/api/routes" style="color:inherit;opacity:.9;text-decoration:none;font-size:13px">JSON</a>
      </div>
    </header>

    <div class="search">
      <input id="q" placeholder="Filtrar por rota, método ou descrição..." />
      <button id="reload" class="copy">Recarregar</button>
    </div>

    <div id="list" class="grid"></div>

    <footer>Use o endpoint <code>/api/routes</code> para consumo programático. Para testar rotas protegidas use <code>Authorization: Bearer &lt;token&gt;</code>.</footer>
  </div>

  <script>
    async function load() {
      try {
        const res = await fetch('/api/routes');
        const json = await res.json();
        window.ROUTES = json.data || [];
        render(window.ROUTES);
      } catch (err) {
        document.getElementById('list').innerHTML = '<div style="color:#faa">Erro ao carregar rotas</div>';
        console.error(err);
      }
    }

    function curlFor(r) {
      const url = location.origin + r.path.replace(/:([^/]+)/g, function(_m, p) { return '{' + p + '}'; });
      return 'curl -X ' + r.method + ' "' + url + '" -H "Authorization: Bearer <token>"';
    }

    function render(items) {
      const q = (document.getElementById('q').value || '').toLowerCase().trim();
      const list = document.getElementById('list');
      const filtered = items.filter(function(r) {
        return [r.method, r.path, r.description, (r.auth ? 'auth' : 'public')].join(' ').toLowerCase().includes(q);
      });
      if (!filtered.length) {
        list.innerHTML = '<div style="color:var(--muted)">Nenhuma rota encontrada.</div>';
        return;
      }

      // Build DOM nodes (avoid template literals inside server template)
      list.innerHTML = '';
      filtered.forEach(function(r) {
        var card = document.createElement('div');
        card.className = 'card';

        var row = document.createElement('div');
        row.className = 'row';

        var badge = document.createElement('div');
        badge.className = 'badge ' + r.method;
        badge.textContent = r.method;

        var pathDiv = document.createElement('div');
        pathDiv.style.fontWeight = '600';
        pathDiv.textContent = r.path;

        var actions = document.createElement('div');
        actions.className = 'actions';

        var btn = document.createElement('button');
        btn.className = 'copy';
        var curl = curlFor(r).replace(/'/g, "\\'");
        btn.setAttribute('data-curl', curl);
        btn.textContent = 'Copiar CURL';

        actions.appendChild(btn);

        row.appendChild(badge);
        row.appendChild(pathDiv);
        row.appendChild(actions);

        var muted = document.createElement('div');
        muted.className = 'muted';
        muted.innerHTML = (r.description || '') + ' • ' + (r.auth ? '<span style="font-size:12px;color:var(--muted)">Requer token</span>' : '<span style="font-size:12px;color:var(--muted)">Pública</span>');

        card.appendChild(row);
        card.appendChild(muted);

        list.appendChild(card);
      });

      // Attach copy handlers
      document.querySelectorAll('button.copy').forEach(function(b) {
        b.onclick = function() {
          var text = b.getAttribute('data-curl');
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
              b.textContent = 'Copiado!';
              setTimeout(function() { b.textContent = 'Copiar CURL'; }, 900);
            }).catch(function() { alert('Não foi possível copiar para a área de transferência.'); });
          } else {
            // Fallback
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); b.textContent = 'Copiado!'; setTimeout(function() { b.textContent = 'Copiar CURL'; }, 900); } catch (e) { alert('Não foi possível copiar para a área de transferência.'); }
            document.body.removeChild(ta);
          }
        };
      });
    }

    document.getElementById('q').addEventListener('input', function() { render(window.ROUTES || []); });
    document.getElementById('reload').addEventListener('click', load);

    load();
  </script>
</body>
</html>`);
});