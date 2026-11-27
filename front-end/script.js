const LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);false
const API = LOCAL
  ? {
      clientes: "http://localhost:3002/clientes",
      veiculos: "http://localhost:3003/veiculos",
      alugueis: "http://localhost:3004/alugueis"
    }
  : {
      clientes: "https://clientes-service-production-4bb01a11.up.railway.app/clientes",
      veiculos: "https://veiculos-service-production.up.railway.app/veiculos",
      alugueis: "https://ENDERECO-DO-KEVIN.up.railway.app/alugueis"
    };

const ALUGUEL = {
  criar: d => ({
    cpfCliente: d.cpf,
    placaVeiculo: d.placa,
    dias: Number(d.dias)
  }),
  devolver: id => ({
    url: `${API.alugueis}/${id}/devolucao`,
    method: "PATCH"
  })
};

const $ = s => document.querySelector(s);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const brl = v => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const cpfFmt = c => String(c).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

async function call(url, method = "GET", body) {
  let r;
  try {
    r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("Serviço fora do ar. Confira se ele está rodando.");
  }

  if (r.status === 204) return null;

  const d = await r.json().catch(() => null);
  if (!r.ok) {
    throw new Error((d && (d.erro || d.message)) || "Erro " + r.status);
  }
  return d;
}

let timer;
function toast(msg, err) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "show" + (err ? " err" : "");
  clearTimeout(timer);
  timer = setTimeout(() => t.className = "", 3500);
}

const run = fn => async (...a) => {
  try {
    await fn(...a);
  } catch (e) {
    toast(e.message, true);
  }
};

const formData = f => Object.fromEntries(new FormData(f));

document.querySelectorAll("nav button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll("nav button").forEach(x => {
      x.setAttribute("aria-selected", x === b);
    });
    ["clientes", "veiculos", "alugueis"].forEach(n => {
      $("#tab-" + n).hidden = n !== b.dataset.tab;
    });
  };
});

async function ping() {
  for (const n of Object.keys(API)) {
    let ok = false;
    try {
      ok = (await fetch(API[n])).ok;
    } catch { }
    $("#st-" + n).className = "dot " + (ok ? "on" : "off");
  }
}

let clientes = [];
let cliEdit = null;

function renderClientes(lista) {
  clientes = lista;
  $("#cli-body").innerHTML = lista.length
    ? lista.map(c => `
        <tr>
          <td>${esc(c.nome)}</td>
          <td>${esc(cpfFmt(c.cpf))}</td>
          <td>${esc(c.email)}</td>
          <td>${esc(c.telefone)}</td>
          <td class="act">
            <button class="btn sec" data-a="edit" data-id="${c.id}">Editar</button>
            <button class="btn sec danger" data-a="del" data-id="${c.id}">Excluir</button>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="5" class="empty">Nenhum cliente encontrado. Preencha o formulário acima para cadastrar o primeiro.</td></tr>`;
}

const listarClientes = run(async () => {
  renderClientes(await call(API.clientes));
});

function cliReset() {
  cliEdit = null;
  $("#f-cli").reset();
  $("#cli-titulo").textContent = "Novo cliente";
  $("#cli-cancel").hidden = true;
}

$("#f-cli").onsubmit = run(async e => {
  e.preventDefault();
  const d = formData(e.target);
  d.cpf = d.cpf.replace(/\D/g, "");

  if (cliEdit) {
    await call(`${API.clientes}/${cliEdit}`, "PUT", d);
    toast("Cliente atualizado");
  } else {
    await call(API.clientes, "POST", d);
    toast("Cliente cadastrado");
  }

  cliReset();
  listarClientes();
});

$("#cli-cancel").onclick = cliReset;
$("#cli-todos").onclick = listarClientes;

$("#cli-buscar").onclick = run(async () => {
  const cpf = $("#cli-busca").value.replace(/\D/g, "");
  if (!cpf) return listarClientes();
  renderClientes([await call(`${API.clientes}/cpf/${cpf}`)]);
});

$("#cli-body").onclick = run(async e => {
  const b = e.target.closest("button");
  if (!b) return;

  const c = clientes.find(x => x.id == b.dataset.id);

  if (b.dataset.a === "edit") {
    cliEdit = c.id;
    const f = $("#f-cli");
    f.nome.value = c.nome;
    f.cpf.value = c.cpf;
    f.email.value = c.email || "";
    f.telefone.value = c.telefone || "";
    $("#cli-titulo").textContent = "Editar cliente";
    $("#cli-cancel").hidden = false;
    f.nome.focus();
  } else if (confirm(`Excluir o cliente ${c.nome}?`)) {
    await call(`${API.clientes}/${c.id}`, "DELETE");
    toast("Cliente excluído");
    listarClientes();
  }
});


let veiculos = [];
let veiEdit = null;

function renderVeiculos(lista) {
  veiculos = lista;
  $("#vei-body").innerHTML = lista.length
    ? lista.map(v => `
        <tr>
          <td>${esc(v.placa)}</td>
          <td>${esc(v.marca)} ${esc(v.modelo)}</td>
          <td>${esc(v.ano)}</td>
          <td>${brl(v.valor_diaria)}</td>
          <td>
            <span class="badge ${esc(v.status)}">
              ${v.status === "ALUGADO" ? "Alugado" : "Disponível"}
            </span>
          </td>
          <td class="act">
            <button class="btn sec" data-a="edit" data-id="${v.id}">Editar</button>
            <button class="btn sec" data-a="status" data-id="${v.id}">
              ${v.status === "ALUGADO" ? "Marcar disponível" : "Marcar alugado"}
            </button>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="6" class="empty">Nenhum veículo encontrado. Cadastre um veículo no formulário acima.</td></tr>`;
}

const listarVeiculos = run(async () => {
  renderVeiculos(await call(API.veiculos));
});

function veiReset() {
  veiEdit = null;
  $("#f-vei").reset();
  $("#vei-titulo").textContent = "Novo veículo";
  $("#vei-cancel").hidden = true;
}

$("#f-vei").onsubmit = run(async e => {
  e.preventDefault();
  const d = formData(e.target);
  d.ano = Number(d.ano);
  d.valor_diaria = Number(d.valor_diaria);

  if (veiEdit) {
    await call(`${API.veiculos}/${veiEdit}`, "PUT", d);
    toast("Veículo atualizado");
  } else {
    await call(API.veiculos, "POST", d);
    toast("Veículo cadastrado");
  }

  veiReset();
  listarVeiculos();
});

$("#vei-cancel").onclick = veiReset;
$("#vei-todos").onclick = listarVeiculos;

$("#vei-disp").onclick = run(async () => {
  renderVeiculos(await call(API.veiculos + "/disponiveis"));
});

$("#vei-buscar").onclick = run(async () => {
  const p = $("#vei-busca").value.trim();
  if (!p) return listarVeiculos();
  renderVeiculos([await call(`${API.veiculos}/placa/${encodeURIComponent(p)}`)]);
});

$("#vei-body").onclick = run(async e => {
  const b = e.target.closest("button");
  if (!b) return;

  const v = veiculos.find(x => x.id == b.dataset.id);

  if (b.dataset.a === "edit") {
    veiEdit = v.id;
    const f = $("#f-vei");
    f.placa.value = v.placa;
    f.marca.value = v.marca;
    f.modelo.value = v.modelo;
    f.ano.value = v.ano;
    f.valor_diaria.value = v.valor_diaria;
    $("#vei-titulo").textContent = "Editar veículo";
    $("#vei-cancel").hidden = false;
    f.placa.focus();
  } else {
    const novo = v.status === "ALUGADO" ? "DISPONIVEL" : "ALUGADO";
    await call(`${API.veiculos}/${v.id}/status`, "PATCH", { status: novo });
    toast(novo === "ALUGADO" ? "Veículo marcado como alugado" : "Veículo marcado como disponível");
    listarVeiculos();
  }
});

let alugueis = [];

const listarAlugueis = run(async () => {
  alugueis = await call(API.alugueis);

  const cols = alugueis.length ? Object.keys(alugueis[0]) : [];

  $("#alu-head").innerHTML = cols.length
    ? `<tr>${cols.map(c => `<th>${esc(c)}</th>`).join("")}<th></th></tr>`
    : "";

  $("#alu-body").innerHTML = alugueis.length
    ? alugueis.map(a => `
        <tr>
          ${cols.map(c => `<td>${esc(a[c])}</td>`).join("")}
          <td class="act">
            <button class="btn sec" data-id="${esc(a.id)}">Registrar devolução</button>
          </td>
        </tr>`).join("")
    : `<tr><td class="empty">Nenhum aluguel registrado. Use o formulário acima para realizar o primeiro.</td></tr>`;
});

$("#f-alu").onsubmit = run(async e => {
  e.preventDefault();
  const d = formData(e.target);
  d.cpf = d.cpf.replace(/\D/g, "");

  await call(API.alugueis, "POST", ALUGUEL.criar(d));
  toast("Aluguel realizado");

  e.target.reset();
  listarAlugueis();
  listarVeiculos();
});

$("#alu-todos").onclick = listarAlugueis;

$("#alu-body").onclick = run(async e => {
  const b = e.target.closest("button");
  if (!b) return;

  const r = ALUGUEL.devolver(b.dataset.id);
  await call(r.url, r.method);
  toast("Devolução registrada");

  listarAlugueis();
  listarVeiculos();
});

listarClientes();
listarVeiculos();
listarAlugueis();
ping();
setInterval(ping, 10000);