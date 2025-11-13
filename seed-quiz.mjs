import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não definida");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

console.log("🌱 Populando banco de dados com perguntas de exemplo...");

// Limpar dados existentes
await connection.execute("DELETE FROM user_responses");
await connection.execute("DELETE FROM answers");
await connection.execute("DELETE FROM questions");

console.log("✓ Dados antigos removidos");

// Perguntas de exemplo
const questionsData = [
  {
    text: "Segundo a legislação brasileira (MAPA), qual é o teor mínimo de gordura exigido para um produto ser classificado como 'creme de leite'?",
    category: "legislacao",
    answers: [
      { text: "10% de gordura", isCorrect: false },
      { text: "15% de gordura", isCorrect: false },
      { text: "25% de gordura", isCorrect: true },
      { text: "35% de gordura", isCorrect: false },
    ],
  },
  {
    text: "Na fabricação do requeijão, qual é a principal função dos sais fundentes (citratos e fosfatos) adicionados durante o processo?",
    category: "processo_requeijao",
    answers: [
      { text: "Aumentar o teor de gordura do produto final", isCorrect: false },
      { text: "Promover a emulsificação e fusão da massa, garantindo textura cremosa", isCorrect: true },
      { text: "Reduzir o pH para conservação do produto", isCorrect: false },
      { text: "Acelerar o processo de fermentação láctica", isCorrect: false },
    ],
  },
];

// Inserir perguntas e respostas
for (let i = 0; i < questionsData.length; i++) {
  const q = questionsData[i];
  
  const [result] = await connection.execute(
    "INSERT INTO questions (text, category, orderIndex) VALUES (?, ?, ?)",
    [q.text, q.category, i]
  );
  
  const questionId = result.insertId;
  
  for (let j = 0; j < q.answers.length; j++) {
    await connection.execute(
      "INSERT INTO answers (questionId, text, isCorrect, orderIndex) VALUES (?, ?, ?, ?)",
      [questionId, q.answers[j].text, q.answers[j].isCorrect, j]
    );
  }
  
  console.log(`✓ Pergunta ${i + 1} adicionada: ${q.category}`);
}

console.log("✅ Banco de dados populado com sucesso!");
console.log(`📊 Total: ${questionsData.length} perguntas`);

await connection.end();
