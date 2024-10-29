// user-model.js
class User {
    constructor(id, name, email, password, cpf, telefone_principal, profile, createdAt, telefones, emails) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.cpf = cpf;
        this.telefone_principal = telefone_principal;
        this.profile = profile;
        this.createdAt = createdAt;
        this.telefones = telefones || [];
        this.emails = emails || []; 
    }
}

export { User };
