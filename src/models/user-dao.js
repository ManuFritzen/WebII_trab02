import { db } from "../config/database.js";
import { User } from "./user-model.js";

class UserDao {
    async list(name, limit, offset) {
        const stmt = db.prepare(`
            SELECT * 
            FROM users
            WHERE name LIKE '%' || ? || '%'
            LIMIT ? OFFSET ?
        `);
        const usersRaw = await new Promise((resolve, reject) => {
            try {
                const result = stmt.all(name, limit, offset);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
        
        const users = await Promise.all(usersRaw.map(u => this.getUserWithtelefonesEmails(u.id)));
        

        console.log({ users });
        return users;
    }

    count(name) {
        const stmt = db.prepare(`
            SELECT COUNT(*) AS total FROM users
            WHERE name LIKE '%' || ? || '%'
        `);
        const result = stmt.get(name);
        return result ? result.total : 0; 
    }

    save(user) {
        const stmt = db.prepare(`
            INSERT INTO users (name, email, password, cpf, telefone_principal, profile, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(user.name, user.email, user.password, user.cpf, user.telefone_principal, user.profile, user.createdAt);
    
        return result.lastInsertRowid; 
    }


    getUserWithtelefonesEmails(userId) {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(userId);
    
        // Obtém os telefones do usuário
        const telefonesStmt = db.prepare('SELECT * FROM telefones WHERE user_id = ?');
        const telefones = telefonesStmt.all(userId);
        const emailsStmt = db.prepare('SELECT * FROM emails WHERE user_id = ?');
        const emails = emailsStmt.all(userId);
    
        return new User(user.id, user.name, user.email, user.password, user.cpf, user.telefone_principal, user.profile, user.createdAt, telefones, emails);
    }

    
    findById(id) {
        return this.getUserWithtelefonesEmails(id);  
    }

    async findByEmailOrCpf(email, cpf) {
        const query = `SELECT * FROM users WHERE email = ? OR cpf = ?`;
        const [rows] = await this.db.execute(query, [email, cpf]);

        return rows.length > 0 ? rows[0] : null; 
    }

    delete(id) {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);

        const deletetelefonesStmt = db.prepare('DELETE FROM telefones WHERE user_id = ?');
        deletetelefonesStmt.run(id);
    }

    update(user) {
        const stmt = db.prepare(`
            UPDATE users SET 
                email = ?, 
                password = ?, 
                cpf = ?, 
                telefone_principal = ?, 
                profile = ? 
            WHERE id = ?
        `);
        
        stmt.run(
            user.email,
            user.password,
            user.cpf,
            user.telefone_principal,
            user.profile,
            user.id 
        );

        this.deletetelefones(user.id);
        this.deleteemails(user.id);
       

    }

    deletetelefones(userId) {
        const deleteStmt = db.prepare('DELETE FROM telefones WHERE user_id = ?');
        deleteStmt.run(userId);
     
    }
    deleteemails(userId) {
        const deleteStmt = db.prepare('DELETE FROM emails WHERE user_id = ?');
        deleteStmt.run(userId);
        
    }

    addtelefone(userId, telefone) {
        const stmt = db.prepare('INSERT INTO telefones (user_id, telefone) VALUES (?, ?)');
        stmt.run(userId, telefone);
    }
    addemail(userId, email) {
        const stmt = db.prepare('INSERT INTO emails (user_id, email) VALUES (?, ?)');
        stmt.run(userId, email);
    }
    
}    

export { UserDao };
