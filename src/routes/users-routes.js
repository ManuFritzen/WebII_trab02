import { Router } from 'express';
import {
    listaUsers,
    paginaAddUser,
    addUser,
    userDetails,
    paginaEditUser, 
    updateUser 
} from '../controllers/users-controller.js';
import { UserDao } from '../models/user-dao.js';

const router = Router();

router.get('/', listaUsers);

router.get('/add', paginaAddUser);

router.post('/add', addUser);

router.get('/:id', userDetails);

router.get('/:id/edit', paginaEditUser); 

router.post('/:id', updateUser); 

router.get('/:id/delete', (req, res) => {
    const id = req.params.id;
    const userDao = new UserDao(); 
    console.log(userDao); 
    console.log(typeof userDao.delete); 
    userDao.delete(id); 
    res.redirect('/users');
});

export default router;
