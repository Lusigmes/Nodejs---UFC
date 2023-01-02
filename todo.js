const { response } = require("express");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/****************************** MIDDLEWARE **********************************/

function verificarConta(request,response,next){

    const { username } = request.headers;

    const user = users.find(user => user.username === username);

    if(!user){
        return response.status(404).json(
            {error: "ERRO DE VERIFICAÇÃO DE CONTA!"});
    }

    request.user = user;

    return next();
}

/*****************************************************************************/

//CADASTRAR USUARIO [X]
app.post("/users", (request,response)=>{
    //const { user } = require;
    const { name, username } = request.body;
    
    const verificarUsername = 
        users.some((user)=> user.username === username);

    if(verificarUsername){
        return response.status(400).json(
            {error: "Usuário já cadastrado!"});
    }
    
    const user = {
        id: uuidv4(),
        name,
        username,
        todos:[]
    };


    users.push(user)

    //console.log(users);

    return response.status(201).json(user);
});

//CRIAR TODO [X]
app.post("/todos", verificarConta ,(request,response)=>{
    const {user} = request;

    const {titulo,deadline} = request.body;

    const todo = {
        id: uuidv4(),
        titulo,
        done:false,
        deadline: new Date(deadline),
        criado_em: new Date()
    }
    
    user.todos.push(todo);
    //  console.log(user.todo);

    return response.status(201).json(user.todos);
});
//app.use(verificarConta);

//LISTAR TODO [X]
app.get("/todos", verificarConta, (request,response)=>{
    const { user } = request;

    //console.log(user.todo);

    return response.json(user.todos);
});

//LISTAR USERS [X]
app.get("/users", verificarConta, (request,response)=>{
    const {user} = request;

    return response.json(users);
});

//ATUALIZAR TODO []
app.put("/todos/:id",verificarConta,  (request,response)=>{
    const {user} = request;
    const {titulo,deadline} = request.body;
    const {id: todoId} = request.params;
    
    const todoI = user.todos.findIndex(todo => todo.id === todoId);
    if(todoI === -1){
        return response.status(404).json({
            error: "Todo NÂO ENCONTADO!"
        });
    }

    const todoUpdate = user.todos[todoI];

    titulo ? todoUpdate.titulo = titulo : false;
    deadline ? todoUpdate.deadline = new Date(deadline) : false;

    return response.status(200).json(todoUpdate);
});

//ATUALIZAR TODO {DONE} []
app.patch("/todo/:id/done",verificarConta,  (request,response)=>{
    const {user}  = request;
    const {id} = request.params;

    const todo = user.todos.find(todo => todo.id === id);
    if(!todo){
        return response.status(404).json({
            error: "ToDo NÃO ENCONTRADO!"
        });
    }
    
    todo.done = true;
        
    return response.status(200).json(todo);
});

//EXCLUIR TODO [X]
app.delete("/todos/:id",verificarConta, (request,response)=>{
    const {user} = request;
    const {id} = request.params;

    const todoI = user.todos.findIndex(todo => todo.id === id);
    if(todoI === -1){
        return response.status(404).json({
            error: "Todo NÃO ENCONTRADO!"
        });
    }
    
    user.todos.splice(todoI,1);

    return response.status(204).json(user.todos);
});

app.listen(3333);
module.exports = app;
