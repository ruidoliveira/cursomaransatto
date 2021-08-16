const express = require('express');
const router = express.Router();
const mysql = require('../mysql');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        let data = new Date().toISOString().replace(/:/g, '-')+'-';
        cb(null, data + file.originalname);
    }
});
const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
        cb(null, true);
    }else{
        cb(null, null);
    }
    

}

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
    });

// RETORNA TODOS PRODUTOS
router.get('/', (req,res,next) =>{
mysql.getConnection((error, conn) =>{
    if(error) {return res.status(500).send({error: error})}
    conn.query(
        'SELECT * FROM produtos;',
        (error, resultado, fields) =>{
            if(error) {return res.status(500).send({error: error})}
            const response = {
                quantidade: resultado.length,
                produtos: resultado.map(prod => {
                    return{
                        id_produtos: prod.id_produtos,
                        nome: prod.nome,
                        preco: prod.preco,
                        imagem_produto: prod.imagem_produto,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos!',
                            url: 'http://localhost:3000/produtos/' + prod.id_produtos
                        }
                    }
                })
            }
            return res.status(200).send(response)
        }
    )
});

});

// Insere 1 produto
router.post('/',upload.single('produto_imagem'), (req,res,next) =>{
    console.log(req.file);
    mysql.getConnection((error, conn) =>{
        console.error(error);
        conn.query(
            'insert into produtos (nome, preco, imagem_produto) VALUES (?,?,?)',
            [  
                req.body.nome, 
                req.body.preco, 
                req.file.path
            ],
            (error, resultado, field) => {
                conn.release();
                if(error) {return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto inserido com sucesso! ✅',
                    produtoCriado:{
                        id_produtos: resultado.id_produtos,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        url: req.file.path,
                        request:{
                            tipo: 'POST',
                            descricao: 'insere um produto!',
                            url: 'http://localhost:3000/produtos'
                        }
                    }
                }
                res.status(201).send(response);
            }
        )
    }); 
});


router.get('/:id_produto', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            `SELECT * FROM produtos WHERE id_produtos = ${req.params.id_produto}`,
            (error, resultado, fields) =>{
                if(error) {return res.status(500).send({error: error})}
                if(resultado.length == 0){
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado o produto com este ID',
                        url: 'http://localhost:3000/produtos'
                    })
                }
                const response = {
                    produto:{
                        id_produtos: resultado[0].id_produtos,
                        nome: resultado[0].nome,
                        preco: resultado[0].preco,
                        imagem_produto: resultado[0].imagem_produto,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna um produto!',
                            url: 'http://localhost:3000/produtos'
                        }
                    }
                }
                res.status(201).send(response);            }
        )
    });
});

// Atualiza o Produto
router.patch('/', (req,res,next) => {
    mysql.getConnection((error, conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            `UPDATE produtos
                SET nome = '${req.body.nome}',
                preco = '${req.body.preco}'
              where id_produtos = ${req.body.id_produtos}`,
            (error, resultado, field) => {
                conn.release();
                if(error) {return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto Atualizado com sucesso! ✅',
                    produtoAtualizado:{
                        id_produtos: req.body.id_produtos,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request:{
                            tipo: 'PACTCH',
                            descricao: 'Atualiza um produto!',
                            url: 'http://localhost:3000/produtos/' + req.body.id_produtos
                        }
                    }
                }
                console.log(response)
                return res.status(202).send(response);
            }
        )
    }); 
});



// Deleta o produto
router.delete('/', (req,res,next) => {
    mysql.getConnection((error, conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            `delete from produtos where id_produtos = ${req.body.id_produtos}`,
            (error, resultado, field) => {
                conn.release();
                if(error) {return res.status(500).send({error: error})}
                console.log('antes')
                const response = {
                    mensagem: 'Produto deletado com sucesso! ✅',
                        request:{
                            tipo: 'POST',
                            descricao: 'Insere um produto!',
                            url: 'http://localhost:3000/produtos',
                            body:{
                                nome: 'String',
                                preco: 'Number'
                            }
                        }
                }
        
                return res.status(202).send(response);

                
            }
        )
    }); 
});


module.exports = router;