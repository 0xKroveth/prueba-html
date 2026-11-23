// valores fijos que uso en varias partes

const RAREZAS = ["Común", "Poco común", "Raro", "Épico", "Legendario"];
const DIFICULTADES = ["Principiante", "Intermedio", "Avanzado"];

// como ordenar los items en las consultas sql
const ORDENES_ITEMS = {
  nombre: "i.nombre ASC",
  recientes: "i.creado_en DESC",
  stack_desc: "i.stack_max DESC, i.nombre ASC",
  rareza: `CASE i.rareza
             WHEN 'Legendario' THEN 1
             WHEN 'Épico' THEN 2
             WHEN 'Raro' THEN 3
             WHEN 'Poco común' THEN 4
             ELSE 5
           END ASC, i.nombre ASC`
};

// como ordenar las guias
const ORDENES_GUIAS = {
  titulo: "g.titulo ASC",
  recientes: "g.creado_en DESC",
  dificultad: `CASE g.dificultad
                 WHEN 'Principiante' THEN 1
                 WHEN 'Intermedio' THEN 2
                 ELSE 3
               END ASC, g.titulo ASC`
};

module.exports = { RAREZAS, DIFICULTADES, ORDENES_ITEMS, ORDENES_GUIAS };
