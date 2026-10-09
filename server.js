// server.js
const express = require('express');
const cors = require('cors');

// Importar os módulos criados
const auth = require('./auth');
const db = require('./database');

const app = express();

app.use(cors());
// Limites altos para suportar anexos
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================
app.post('/api/login', auth.loginHandler);

// ==========================================
// ROTAS DE CHAMADOS
// ==========================================

// Obter todos os chamados
app.get('/api/chamados', auth.verifyToken, (req, res) => {
    res.json(db.chamados);
});

// Criar um chamado
app.post('/api/chamados', auth.verifyToken, (req, res) => {
    const { titulo, categoria, urgencia, descricaoInicial, nomeSolicitante, turno, telefone, email, criador, status, mensagens } = req.body;
    
    const novoChamado = {
        id: Date.now(),
        titulo, categoria, urgencia, descricaoInicial, nomeSolicitante, turno, telefone, email, criador,
        status: status || 'Aberto',
        dataCriacao: new Date().toISOString(),
        mensagens: mensagens || [] 
    };
    
    db.chamados.push(novoChamado);
    res.status(201).json(novoChamado);
});

// Enviar mensagem/anexo/ação no chat do chamado
app.post('/api/chamados/:id/mensagens', auth.verifyToken, (req, res) => {
    const chamado = db.chamados.find(c => c.id === parseInt(req.params.id));
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

    const { autor, texto, data, tipo, acao, novoStatus, tecnico, tecnicoDestino, interativa, isFinalizacao, dadosSolucao, arquivoDados, arquivoTipo, arquivoNome } = req.body;

    const novaMsg = {
        id: Date.now(),
        autor, texto, data: data || new Date().toISOString(),
        tipo, acao, novoStatus, tecnico, tecnicoDestino, interativa, isFinalizacao, dadosSolucao,
        arquivoDados, arquivoTipo, arquivoNome
    };

    if (!chamado.mensagens) chamado.mensagens = [];
    chamado.mensagens.push(novaMsg);

    res.status(201).json(novaMsg);
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});