const API_URL = "http://localhost:3000";

// --- ESTADO GLOBAL ---
let usuariosLista = [];
let materiasLista = [];
let usuarioLogueado = null;

// --- ELEMENTOS ---
const vistaLogin = document.getElementById("vistaLogin");
const vistaDashboard = document.getElementById("vistaDashboard");
const vistaUsuarios = document.getElementById("vistaUsuarios");
const vistaMaterias = document.getElementById("vistaMaterias");

const tablaUsuarios = document.getElementById("tablaUsuarios");
const tablaMaterias = document.getElementById("tablaMaterias");

const inputBuscar = document.getElementById("inputBuscar");
const inputBuscarMateria = document.getElementById("inputBuscarMateria");

const modalUsuarioBS = new bootstrap.Modal(document.getElementById("modalUsuario"));
const modalPerfilBS = new bootstrap.Modal(document.getElementById("modalPerfil"));

// --- LOGIN ---
document.addEventListener("DOMContentLoaded", () => {
  const guardado = localStorage.getItem("usuario");
  if (guardado) iniciarSesion(JSON.parse(guardado));
});

document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const cedula = document.getElementById("loginCedula").value;
  const clave = document.getElementById("loginClave").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cedula, clave })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    iniciarSesion(data.usuario);
  } else {
    document.getElementById("loginError").textContent = data.msg;
  }
});

function iniciarSesion(usuario) {
  usuarioLogueado = usuario;
  document.getElementById("userNombreDisplay").textContent = usuario.nombre;
  vistaLogin.classList.add("d-none");
  vistaDashboard.classList.remove("d-none");
  mostrarUsuarios();
  mostrarMaterias();
}

// --- NAVEGACIÓN ---
document.getElementById("btnUsuarios").addEventListener("click", mostrarUsuarios);
document.getElementById("btnMaterias").addEventListener("click", mostrarMaterias);

function mostrarUsuarios() {
  vistaUsuarios.classList.remove("d-none");
  vistaMaterias.classList.add("d-none");
  cargarUsuarios();
}

function mostrarMaterias() {
  vistaUsuarios.classList.add("d-none");
  vistaMaterias.classList.remove("d-none");
  cargarMaterias();
}

// --- USUARIOS ---
async function cargarUsuarios() {
  const res = await fetch(`${API_URL}/usuarios`);
  usuariosLista = await res.json();
  renderUsuarios(usuariosLista);
}

function renderUsuarios(lista) {
  tablaUsuarios.innerHTML = "";
  lista.forEach(u => {
    tablaUsuarios.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td>${u.cedula}</td>
        <td>${u.nombre}</td>
        <td>
          <button class="btn btn-sm btn-warning text-white me-2" onclick="prepararEditar(${u.id})">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

window.prepararCrear = () => {
  document.getElementById("formUsuario").reset();
  document.getElementById("userId").value = "";
  document.getElementById("modalTitulo").textContent = "Nuevo Usuario";
};

window.prepararEditar = (id) => {
  const u = usuariosLista.find(x => x.id === id);
  document.getElementById("modalTitulo").textContent = "Editar Usuario";
  document.getElementById("userId").value = u.id;
  document.getElementById("userCedula").value = u.cedula;
  document.getElementById("userNombre").value = u.nombre;
  document.getElementById("userClave").value = u.clave;
  modalUsuarioBS.show();
};

window.eliminarUsuario = async (id) => {
  await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
  cargarUsuarios();
};

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("userId").value;
  const datos = {
    cedula: document.getElementById("userCedula").value,
    nombre: document.getElementById("userNombre").value,
    clave: document.getElementById("userClave").value
  };

  if (id) {
    await fetch(`${API_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
  } else {
    await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
  }

  modalUsuarioBS.hide();
  cargarUsuarios();
});

inputBuscar.addEventListener("input", e => {
  const t = e.target.value.toLowerCase();
  renderUsuarios(
    usuariosLista.filter(u =>
      u.nombre.toLowerCase().includes(t) || u.cedula.includes(t)
    )
  );
});

// --- MATERIA ---
async function cargarMaterias() {
  const res = await fetch(`${API_URL}/materia`);
  materiasLista = await res.json();
  renderMaterias(materiasLista);
}

function renderMaterias(lista) {
  tablaMaterias.innerHTML = "";
  lista.forEach(m => {
    tablaMaterias.innerHTML += `
      <tr>
        <td>${m.codigo}</td>
        <td>${m.nombre}</td>
      </tr>
    `;
  });
}

inputBuscarMateria.addEventListener("input", e => {
  const t = e.target.value.toLowerCase();
  renderMaterias(
    materiasLista.filter(m => m.codigo.toString().includes(t))
  );
});

// --- PERFIL ---
document.getElementById("btnPerfil").addEventListener("click", () => {
  document.getElementById("perfilNombre").textContent = usuarioLogueado.nombre;
  document.getElementById("perfilCedula").textContent = "Cédula: " + usuarioLogueado.cedula;
  modalPerfilBS.show();
});

// --- CONFIG / SALIR ---
document.getElementById("btnConfig").addEventListener("click", () => {
  document.body.classList.toggle("bg-dark");
  document.body.classList.toggle("text-white");
});

document.getElementById("btnSalir").addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});
