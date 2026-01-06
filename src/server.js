import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());



app.post("/login", async (req, res) => {
  try {
    const { cedula, clave } = req.body;
    
    // Buscamos usuario por cédula y clave
    // NOTA: En producción, las claves deben estar encriptadas (hash).
    const query = "SELECT * FROM usuarios_profesores WHERE cedula = $1 AND clave = $2";
    const result = await pool.query(query, [cedula, clave]);

    if (result.rows.length === 0) {
      return res.status(401).json({ msg: "Cédula o contraseña incorrecta" });
    }

    // Devolvemos el usuario (sin la clave por seguridad)
    const usuario = result.rows[0];
    delete usuario.clave; 
    
    res.json({ msg: "Bienvenido", usuario });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// REGISTRAR USUARIO
// =====================
app.post("/usuarios_profesores", async (req, res) => {
  try {
    const { cedula, nombre, clave } = req.body;

    if (!cedula || !nombre || !clave) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const query = `
      INSERT INTO usuarios_profesores (cedula, nombre, clave)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const result = await pool.query(query, [cedula, nombre, clave]);
    res.json({ msg: "Usuario registrado", data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// CONSULTAR POR ID
// =====================
app.get("/usuarios_profesores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM usuarios_profesores WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// =====================
// 4. OBTENER TODOS LOS USUARIOS
// =====================
app.get("/usuarios_profesores", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios_profesores ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// 5. EDITAR USUARIO
// =====================
app.put("/usuarios_profesores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, nombre, clave } = req.body;
    
    const query = "UPDATE usuarios_profesores SET cedula=$1, nombre=$2, clave=$3 WHERE id=$4 RETURNING *";
    const result = await pool.query(query, [cedula, nombre, clave, id]);
    
    if (result.rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: "Usuario actualizado", usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// 6. ELIMINAR USUARIO
// =====================
app.delete("/usuarios_profesores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM usuarios_profesores WHERE id = $1", [id]);
    
    if (result.rowCount === 0) return res.status(404).json({ msg: "No encontrado" });
    res.json({ msg: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/materia", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materia ORDER BY codigo ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/materia/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;

    const result = await pool.query(
      "SELECT * FROM materia WHERE codigo = $1",
      [codigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Materia no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/estudiantes", async (req, res) => {
  const { nombre } = req.body;

  const result = await pool.query(
    "INSERT INTO estudiantes (nombre) VALUES ($1) RETURNING *",
    [nombre]
  );

  res.json(result.rows[0]);
});

app.post("/notas", async (req, res) => {
  try {
    const { estudiante_id, materia_id, usuario_id, nota } = req.body;

    // validar que el profesor exista
    const user = await pool.query(
      "SELECT id FROM usuarios_profesores WHERE id = $1",
      [usuario_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: "Profesor no existe" });
    }

    const result = await pool.query(
      "INSERT INTO notas (estudiante_id, materia_id, usuario_id, nota) VALUES ($1,$2,$3,$4) RETURNING *",
      [estudiante_id, materia_id, usuario_id, nota]
    );

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SERVIDOR
app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
