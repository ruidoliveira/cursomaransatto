const express = require('express');
const router = express.Router();
const mysql = require('../mysql');

// RETORNA TODOS pedidos
router.get('/', (req,res,next) =>{
mysql.getConnection((error, conn) =>{
    if(error) {return res.status(500).send({error: error})}
    conn.query(
        'SELECT * FROM pedidos;',
        (error, resultado, fields) =>{
            if(error) {return res.status(500).send({error: error})}
            const response = {
                quantidade: resultado.length,
                pedidos: resultado.map(pedido => {
                    return{
                        id_pedidos: pedido.id_pedidos,
                        id_produtos: pedido.id_produtos,
                        quantidade: pedido.quantidade,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos!',
                            url: 'http://localhost:3000/pedidos/' + pedido.id_pedidos
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
router.post('/', (req,res,next) =>{
    mysql.getConnection((error, conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            `INSERT INTO pedidos (id_produtos, quantidade) 
             VALUES (?,?)`,
            [req.body.id_produtos,req.body.quantidade],
            (error, resultado, field) => {
                conn.release();
                if(error) {return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto inserido com sucesso! ✅',
                    pedidoCriado:{
                        id_pedidos: resultado.id_pedidos,
                        id_produtos: req.body.id_produtos,
                        Quantidade: req.body.quantidade,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna um pedido!',
                            url: 'http://localhost:3000/pedidos'
                         }
                    }
                }
                console.log(response);
                res.status(201).send(response);
            }
        )
    });
});


router.get('/:id_pedidos', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            `SELECT * FROM pedidos WHERE id_pedidos = ${req.params.id_pedidos}`,
            (error, resultado, fields) =>{
                if(error) {return res.status(500).send({error: error})}
                if(resultado.length == 0){
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado o produto com este ID',
                        url: 'http://localhost:3000/produtos'
                    })
                }
                const response = {
                    pedidos:{
                        id_pedidos: resultado[0].id_pedidos,
                        id_produtos: resultado[0].id_produtos,
                        quantidade: resultado[0].quantidade,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna um pedido!',
                            url: 'http://localhost:3000/pedidos'
                         }
                    }
                }
                
                res.status(201).send(response);            
            }
        )
    });
});

// Atualiza o Produto
router.patch('/', (req,res,next) => {
res.status(201).send({
    mensagem: 'Usando o patch dentro da rota de pedidos'
})

});

// Deleta o produto
router.delete('/', (req,res,next) => {
    mysql.getConnection((error, conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            `delete from pedidos where id_pedidos = ${req.body.id_pedidos}`,
            (error, resultado, field) => {
                conn.release();
                if(error) {return res.status(500).send({error: error})}
                
                const response = {
                    mensagem: 'Pedido deletado com sucesso! ✅',
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna todos pedidos!',
                            url: 'http://localhost:3000/pedidos',
                            body:{
                                id_produtos: 'Number',
                                quantidade: 'Number'
                            }
                        }
                }
        
                return res.status(202).send(response);

                
            }
        )
    }); 
});
module.exports = router;