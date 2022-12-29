const { response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid"); //versao 4 ira gerar numero aleatorio

const app = express();
app.use(express.json());

const clientes = []; 

/******************************************************************************************/

function existeConta(request,response,next){


    //const { cpf } = request.params;
    const { cpf } = request.headers;
    
    const cliente = clientes.find(cliente => cliente.cpf === cpf);
    
    if(!cliente){
        return response.status(404).json({error:"Cliente não encontrado!"});
    }
    request.cliente = cliente;

    return next();
} 

//ATUALIZAR SALDO PARA FUNÇÃO SACAR
function atualizarSaldo(statement){
    const balanco = statement.reduce((saldo,operacao) =>{

        if(operacao.tipo === 'debito'){
            return saldo - operacao.valor;
        }else{
            return saldo + operacao.valor;
        }
    }, (0) );

    return balanco;
}
/******************************************************************************************/

//CADASTRAR CONTA RF 1 - criar dados usa-se o post
//RN 1 - RF 1 
app.post("/conta", (request,response)=> { 
    const {cpf, nome} = request.body;
    //RN 1
    const existeCPF = clientes.some(
        (cliente)=> cliente.cpf === cpf);
    
        if(existeCPF){ 
        return response.status(400).json({error: "CPF já cadastrado!"});
    }
 
    clientes.push({
        cpf,
        nome,
        id: uuidv4(),
        statement: []
    });

    console.log(nome);
    console.log(clientes);
    return response.status(201).send();
});

    
//BUSCAR ExTRATO BANCARIO RF 2 - buscar dados usa-se get
//RN 2
app.get("/extrato", existeConta, (request,response)=>{

    const {cliente} = request; 

    return response.json(cliente.statement);
});

//REALIZAR DEPOSITO RF 3 //creditar
app.post("/deposito", existeConta, (request,response)=>{

    const {cliente} = request; 
 
    const {descricao,valor} = request.body;
    
    const operacaoStatement = {
        descricao,
        valor,
        realizado_em: new Date(),
        tipo:"credito"
    };

    cliente.statement.push(operacaoStatement);

    return response.status(201).send();

});


//REALIZAR SAQUE RF 4 // debitar
app.post("/saque", existeConta, (request,response) => {
    const {cliente} = request;
    const {valor} = request.body;

    const balanco = atualizarSaldo(cliente.statement);

    if(balanco < valor){
        return response.status(400).json({error: "Saldo insuficiente!"});
    }

    const operacaoStatement = {
        valor,
        realizado_em: new Date(),
        tipo:"debito"
    };

    cliente.statement.push(operacaoStatement);

    return response.status(201).send(); 
});

//LISTAR EXTRATO POR DATA RF 5
app.get("/extrato/data", existeConta, (request,response)=>{
    const {cliente} = request; 
    const {dato} = request.query;

    const dataFormatada = new Date(dato + " 00:00");

    const extrato = cliente.statement.filter(
        (statement) => statement.realizado_em.toDateString() ===
        new Date(dataFormatada).toDateString());
 
    return response.json(extrato);
});


//ATUALIZAR DADOS DO CLIENTE RF 6
app.put("/conta", existeConta, (request,response) => {
    const { nome } = request.body;
    const { cliente } = request;

    cliente.nome = nome;

   
    return response.status(201).send();
});

//OBTER CONTA RF 7
app.get("/conta", existeConta, (request,response)=>{
    const {cliente} = request;

    return response.json(cliente);

});


//DELETAR CONTA RF 8
app.delete("/conta", existeConta, (request,response)=>{
    const { cliente} = request;
    
    clientes.splice(cliente, 1);
    console.log(clientes);
    return response.status(200).json(clientes);

});

//OBTER saldo RF 9
app.get("/saldo", existeConta, (request,response)=>{
    const {cliente} = request;
    const saldo = atualizarSaldo(cliente.statement);

    return response.json(saldo);
});






app.listen(3333);  