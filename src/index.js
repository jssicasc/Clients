const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const clients = []; //enquanto não tem BD vamos salvar nossas contas criadas no array

//middleware de verificação de existência de cpf cadastrado
function verifyIfExistsAccountCPF(request, response, next){
    const { cpf } = request.headers; //esse dado deve vir no HEADER da requisição

    const client = clients.find((client) => client.cpf === cpf); //o método find faz a busca e retorna os valores (diferente do some que só retorna o true/false)
    
    //Pela regra de negócio não deve ser possível acessar, atualizar ou deletar o cadastro de um cliente inexistente
   

    if (!client){
        return response.status(400).json({ error: "Client not found" })
    }

    request.client = client; //dessa forma está adicionando a propriedade client no objeto request, e ela possui os dados do cliente encontrado

    return next();
}


//o método post deve ser utilizado para a CRIAÇÃO de dados, neste caso o cadastro de outro cliente
app.post('/account', (request, response) => {
    const {name, cpf} = request.body; //informações que devem ser recebidas pelo body para cadastrar o usuário
    
    //* Pela regra de negócio não deve ser possível cadastrar novo cliente com um CPF já existente
    const clientAlreadyExists = clients.some((client) => client.cpf === cpf); //esse método faz uma busca e retorna true ou false a depender da condição

    if(clientAlreadyExists){
        return response.status(400).json({error: "Client already exists!"});        
    }
    
    clients.push({cpf, name, id: uuidv4()}); //inserindo dados dentro do nosso arrayBDFake, o id é gerado utilizando a ferramenta uuid

    return response.status(201).send("Criação realizada s2"); //o código 201 confirma que a inserção foi realizada
});

app.use(verifyIfExistsAccountCPF);

//o método get deve ser utilizado para ACESSAR os dados
app.get('/account', (request, response) => {
    const { client } = request; //recuperando os dados do cliente que foram obtidos no middleware verifyIfExistsAccountCPF

    return response.json(client);  //a requisição retorna um JSON contendo os dados
});

//o método put deve ser utilizado para ALTERAR os dados
app.put('/account', (request, response) => {
    const { name } = request.body;
    const { client } = request; 
    
    client.name = name; //realizando a alteração do name

    return response.status(201).send("Dados atualizados ;p");
});


//o método para deletar os dados do cliente
app.delete('/account', (request, response) => {
    const { client } = request;

    clients.splice(client, 1); //removendo o cliente do arrayBDFake 

    return response.status(200).json(clients); //o código 200 indica que a requisição foi bem sucedida; além disso é retornado um JSON contendo os usuários restantes
});

app.listen(3333);