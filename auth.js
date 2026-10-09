// auth.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'rs_servicos_seguranca_123';

// Base de dados de Utilizadores
const users = {
    'admin': { nome: 'Administrador TI', perfil: 'admin', senha: '123' },
    'caua': { nome: 'Cauã Silva', perfil: 'admin', senha: '123' },
    'rogerio': { nome: 'Rogério Júnior', perfil: 'admin', senha: '123' },
    'matheus': { nome: 'Matheus Sairo', perfil: 'admin', senha: '123' },
    'user': { nome: 'Colaborador Padrão', perfil: 'user', senha: '123' }
};

// Função que lida com o Login
const loginHandler = (req, res) => {
    const { identificador, senha } = req.body;
    const user = users[identificador?.toLowerCase()];
    
    if (user && user.senha === senha) {
        const token = jwt.sign({ id: identificador, perfil: user.perfil }, SECRET_KEY);
        const userObj = { nome: user.nome, perfil: user.perfil };
        res.json({ token, usuario: userObj });
    } else {
        res.status(401).json({ erro: 'Credenciais inválidas' });
    }
};

// Middleware para proteger as rotas (Verifica o Token)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) return res.status(403).json({ erro: 'Sessão expirada' });
            req.user = user;
            next(); // Autorizado a prosseguir
        });
    } else {
        res.status(401).json({ erro: 'Não autorizado' });
    }
};

module.exports = {
    loginHandler,
    verifyToken
};