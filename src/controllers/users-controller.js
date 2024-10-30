import { UserDao } from "../models/user-dao.js";
import { User } from "../models/user-model.js";

async function listaUsers(req, res) {
    const userDao = new UserDao();
    const { page = 1, name = '' } = req.query; 

    const limit = 5; 
    const offset = (page - 1) * limit; 

    try {
        const usersRaw = await userDao.list(name, limit, offset); 

        const users = usersRaw.map(u => new User(u.id, u.name, u.email, u.password, u.cpf, u.telefone_principal, u.profile, u.createdAt));

        const totalUsers = await userDao.count(name); 
        const totalPages = Math.ceil(totalUsers / limit); 
        const data = {
            title: "WEB II",
            users,
            currentPage: parseInt(page),
            totalPages,
            name 
        };

        res.render('users-listagem', { data });
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).send("Falha ao listar usuários.");
    }
}

function paginaAddUser(req, res) {
    const data = {
        title: "WEB II - Adicionar Usuário",
    };
    res.render('users-formulario',  { data });
}

async function addUser(req, res) {
    const userDao = new UserDao();
    const dados = req.body;

    if (!dados.name || !dados.email || !dados.password || !dados.cpf || !dados.telefone_principal) {
        return res.status(400).send("Nome, email, senha, CPF e telefone principal são obrigatórios.");
    }

    let telefonesArray = Array.isArray(dados.telefones) ? dados.telefones : [dados.telefones].filter(Boolean);

    let emailsArray = Array.isArray(dados.emails) ? dados.emails : [dados.emails].filter(Boolean);

    const newUser = {
        name: dados.name,
        email: dados.email,
        password: dados.password,
        cpf: dados.cpf,
        telefone_principal: dados.telefone_principal,
        profile: dados.profile,
        createdAt: new Date().toISOString(),
        telefones: telefonesArray,
        emails: emailsArray
    };

    try {
        const userId = userDao.save(newUser);
        for (const telefone of telefonesArray) {
            userDao.addtelefone(userId, telefone);
        }
        for (const email of emailsArray) {
            userDao.addemail(userId, email);
        }

        res.redirect("/users");
    } catch (error) {
        const errorMessage = error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? "O CPF já está cadastrado." : "Falha ao criar usuário. Tente novamente.";

        res.render("users-formulario", {
            data: {
                title: "WEB II - Adicionar Usuário",
                errorMessage: errorMessage,
                formData: req.body  
            }
        });
    }
}




function paginaEditUser(req, res) {
    const userDao = new UserDao();
    const userId = req.params.id; 
    try {
        const user = userDao.findById(userId);

        if (!user) {
            return res.status(404).send("Usuário não encontrado.");
        }

        const data = {
            title: "WEB II - Editar Usuário",
            user,
        };

        res.render("user-edit", { data });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).send("Falha ao buscar usuário.");
    }
}


function updateUser(req, res) {
    const userDao = new UserDao();
    const userId = req.params.id;
    const dados = req.body;


    if (!dados.password || !dados.telefone_principal) {
        return res.status(400).send("Senha e telefone principal são obrigatórios.");
    }

    let telefonesArray = Array.isArray(dados.telefones) ? dados.telefones : [dados.telefones].filter(Boolean);

    let emailsArray = Array.isArray(dados.emails) ? dados.emails : [dados.emails].filter(Boolean);
    
    const user = {
        email: dados.email,
        password: dados.password,
        cpf: dados.cpf,
        telefone_principal: dados.telefone_principal,
        profile: dados.profile,
        id: userId
    };

    try {
        userDao.update(user);

        for (const telefone of telefonesArray) {
            userDao.addtelefone(userId, telefone);
        }
        for (const email of emailsArray) {
            userDao.addemail(userId, email);
        }

        res.redirect("/users");
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).send({ message: 'Erro ao atualizar usuário.' });
    }
}





function userDetails(req, res) {
    const userId = req.params.id; 
    const userDao = new UserDao();
    const userRaw = userDao.findById(userId); 

    const user = new User(
        userRaw.id,
        userRaw.name,
        userRaw.email,
        userRaw.password,
        userRaw.cpf,
        userRaw.telefone_principal,
        userRaw.profile,
        userRaw.createdAt,
        userRaw.telefones, 
        userRaw.emails
    );

    const data = {
        title: "Detalhes do Usuário",
        user 
    };

    res.render('user-detail', { data }); 
}

export {
    addUser,        
    listaUsers,     
    paginaAddUser,
    paginaEditUser,
    updateUser,
    userDetails     
};
