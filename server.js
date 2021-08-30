const WebSocket = require('ws')

var express = require('express')
var app = express()

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017'
var dbo

var palavras = []
var jogos = []

MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, db) {
    if (err) {
        console.log("Erro conectando com o servidor de BD")
    }
    
    else console.log("Conectado ao BD")
    dbo = db.db("forca")

    // O banco de dadoos se chama "forca", e a coleção se chama "palavras".
    // Cada documento da coleção tem um campo '_id' e um campo 'p' onde a palavra é armazenada. 

    dbo.collection('palavras').find({}).toArray(function (err, result) {
        if (err) throw err;
        if (result[0] == undefined) console.log("BD não encontrou palavras")
        else{
            for (let a = 0; a < result.length; a++) {
                console.log("Achou palavra", result[a].p, "no banco de dados.")
                // guarda palavras do BD na lista 'palavras'
                palavras.push(result[a].p)
            }
        }
    })
})

var bodyParser = require('body-parser')
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'))

// Para adicionar palavra: localhost:4000/add?p=<palavra>
app.get('/add', function(req, resp){
    console.log("Acionou BD")
    let novaPalavra = req.query.p

    if(novaPalavra){
        if(palavras.indexOf(novaPalavra) == -1){
            dbo.collection("palavras").insertOne({p: novaPalavra})
            resp.write("Palavra "+novaPalavra+" foi adicionada ao Banco de Dados")
            palavras.push(novaPalavra)
        } else {
            resp.write("Palavra ja existente no Banco de Dados...")
        }
    }
    else {
        resp.write("Insira uma palavra, na forma '/add?p=<palavra>'")
    }
    return resp.end()
})
app.get(/^(.+)$/, (req, res) => {
    try {
        res.write("A pagina que vc busca nao existe")
        res.end()
    } catch(e){
        res.end()
    }
})


app.listen(4000, () => {
    console.log("Servidor no ar!")
})

var vetorClientes = []

const wss = new WebSocket.Server({port : 10000}, () => {
    console.log('rodando')
})

function broadcast (msg) {
    for (let i=0; i<vetorClientes.length; i++) {
        try {
            vetorClientes[i].send(msg)
        } catch (e) {}
    }
}

function processaFim(x){
    for(let i = 0; i < jogos.length; i++) {
        if (jogos[i][1] == x.j || jogos[i][2] == x.j){
            jogos.splice(i, 1)
            break;
        }
    }
}

// envia solicitação de jogo
function notifyAd (msg) {
    msg.tipo = 'solJogo';
    console.log("Servidor enviando para rede em 2: " + msg.tipo);
    for (let i = 0; i < vetorClientes.length; i++) {
        console.log("ha" + vetorClientes[i].ID + msg.adv2 + " " + msg.adv1)
        if(vetorClientes[i].ID == msg.adv1) {
            try {
                vetorClientes[i].send(JSON.stringify(msg))

                console.log("Jogo enviado para início!!")
            } catch (e) {
                console.log(e)
            }
        }
    }
}

// envia para desafiante, após aceitação do desafio
function beginAd (msg) {
    msg.tentadas = []
    let chance = Math.floor(Math.random()*10)%2
    if (chance == 0)
        msg.adj = msg.adv2
    else
        msg.adj = msg.adv1
    msg.tipo = 'desafioAceito';
    let palavraSelecionada = palavras[Math.floor(Math.random() * palavras.length)].toLowerCase()
    jogos.push([palavraSelecionada, msg.adv1, msg.adv2])
    msg.tamPalavra = palavraSelecionada.length;
    // neste momento, msg é: 
    // adv1: adversário
    // adv2: desafiante
    // Envia nesse formato para o adversário:
    console.log("Servidor enviando para rede em 3: " + msg.tipo);
    for (let i = 0; i < vetorClientes.length; i++) {
        if(vetorClientes[i].ID == msg.adv1) {
            try {
                vetorClientes[i].send(JSON.stringify(msg))
                console.log("Jogo enviado para ", msg.adv1)
            } catch (e) {
                console.log(e)
            }
        }
    }

    let tmp1 = msg.adv1;
    msg.adv1 = msg.adv2;
    msg.adv2 = tmp1;
    // neste momento, msg é: 
    // adv1: desafiante
    // adv2: adversario
    // Envia nesse formato para o adversário:

    for (let i = 0; i < vetorClientes.length; i++) {
        if(vetorClientes[i].ID == msg.adv1) {
            try {
                vetorClientes[i].send(JSON.stringify(msg))
                console.log("Jogo enviado para", msg.adv1)
            } catch (e) {
                console.log(e)
            }
        }
    }
}
function analisaJogada(x){
    x.tipo = "jogadaF"
    console.log(jogos)
    // localiza palavra do jogo
    let i
    let advj = x.adj
    let palavra
    let pos = []
    for(i = 0; i < jogos.length; i++){
        if (jogos[i].indexOf(advj) != -1){
            palavra = jogos[i][0]
            break
        }
    }
    // troca a vez
    if(x.adj == x.adv1)
        x.adj = x.adv2
    else
        x.adj = x.adv1

    let acertou = false

    for(i = 0; i < palavra.length; i++){
        if(x.letra === palavra[i]) {
            pos.push(i)
            x.acertos += 1
            acertou = true
        }
    }
    x.preencher = pos
    x.tentadas.push(x.letra)

    if (acertou == false) {
        x.chances -= 1
    }
    for (let i = 0; i < vetorClientes.length; i++) {
        if(vetorClientes[i].ID == x.adv1) {
            try {
                vetorClientes[i].send(JSON.stringify(x))

                console.log("Enviando jogada processada para "+x.adv1)
            } catch (e) {
                console.log(e)
            }
        }
    }
    for (let i = 0; i < vetorClientes.length; i++) {
        if(vetorClientes[i].ID == x.adv2) {
            try {
                vetorClientes[i].send(JSON.stringify(x))

                console.log("Enviando jogada processada para "+x.adv2)
            } catch (e) {
                console.log(e)
            }
        }
    }
}


wss.on('connection', function connection(ws) {
    ws.validado = false
    vetorClientes.push(ws)
    console.log("QTD clientes: " + vetorClientes.length)

    ws.on('message', function (MSG) {
        try {
            var x = JSON.parse(MSG)
            console.log('Recebeu %s', x.tipo)
            
            switch (x.tipo) {
                case 'login':
                    ws.ID = x.valor
                    let nomes = []
                    for (let a = 0; a < vetorClientes.length; a++) 
                        if (vetorClientes[a].validado == true){
                            nomes.push(vetorClientes[a].ID)
                        }
                    var todos = {tipo:'todosUsuarios', valor:nomes}
                    ws.send(JSON.stringify(todos))

                    var xx = {tipo:'usuarioNovo', valor:x.valor}

                    broadcast(JSON.stringify(xx))
                    ws.validado = true
                break;
                case 'jogo':
                    if (ws.validado == true){
                        console.log(x)
                        notifyAd(x)
                    }
                    else {
                        ws.close()
                    }
                break;
                case 'jogoAceito':
                    if(ws.validado == true){
                        // Se jogo foi aceito:
                        // Manda palavra também
                        let palavra = palavras[Math.floor(Math.random()*palavras.length)]
                        let pal = {'tipo': 'palavra', 'p':palavra}
                        console.log(x)
                        beginAd(x, pal);
                    } else {
                        ws.close()
                    }
                break;
                case 'jogada':
                    analisaJogada(x)
                break;
                case 'fim':
                    processaFim(x)
                break;
                default:
                    ws.close();
            }
        }catch (e){
            ws.close()
        }
    })

    ws.on('close', function incoming(message) {
        for(let i = 0; i < vetorClientes.length; i++) {
            if (vetorClientes[i] == ws){
                vetorClientes.splice(i, 1)
                break;
            }
        }
        console.log('Cliente desconectou')
        console.log('QTD clientes: '+vetorClientes.length)
        jogoCleanUp()
    })
})

// apaga jogo de usuários deslogados...
function jogoCleanUp(){
    for(let i = 0; i < jogos.length; i++){
        if(vetorClientes.indexOf(jogos[i][1]) == -1 || vetorClientes.indexOf(jogos[i][2]) == -1)
            jogos.splice(i, 1)
    }
}
