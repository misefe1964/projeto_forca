const WebSocket = require('ws')

var express = require('express')
var app = express()

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017'
var dbo

var palavras = []
var palavraSelecionada

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
        if (result[0] == undefined) console.log("Não deu certo")
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

app.get(/^(.+)$/, (req, res) => {
    try {
        res.white("A página que vc busca não existe")
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

// envia solicitação de jogo
function notifyAd (msg) {
    msg.tipo = 'solJogo';
    console.log("Servidor enviando para rede em 2: " + msg.tipo);
    for (let i = 0; i < vetorClientes.length; i++) {
        console.log("ha" + vetorClientes[i].ID + msg.adv2 + " " + msg.adv1)
        if(vetorClientes[i].ID == msg.adv1) {
            try {
                vetorClientes[i].send(JSON.stringify(msg))

                console.log("Jogo enviado!")
            } catch (e) {
                console.log(e)
            }
        }
    }
    console.log("Jogo enviado!")
}

// envia para desafiante, após aceitação do desafio
function beginAd (msg) {
    let chance = Math.floor(Math.random()*10)%2
    if (chance == 0)
        msg.adj = msg.adv2
    else
        msg.adj = msg.adv1
    msg.tipo = 'desafioAceito';
    palavraSelecionada = palavras[Math.floor(Math.random() * palavras.length)]
    msg.tamPalavra = palavraSelecionada.length;
    // neste momento, msg é: 
    // adv1: adversário
    // adv2: desafiante
    // Envia nesse formato para o adversário:
    console.log("Servidor enviando para rede em 3: " + msg.tipo);
    for (let i = 0; i < vetorClientes.length; i++) {
        console.log("ha" + vetorClientes[i].ID + msg.adv2 + " " + msg.adv1)
        if(vetorClientes[i].ID == msg.adv1) {
            try {
                vetorClientes[i].send(JSON.stringify(msg))

                console.log("Jogo enviado!")
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
        console.log("ha" + vetorClientes[i].ID + msg.adv2 + " " + msg.adv1)
        if(vetorClientes[i].ID == msg.adv1) {
            try {
                vetorClientes[i].send(JSON.stringify(msg))

                console.log("Jogo enviado!")
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
    })
})
