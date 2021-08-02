const WebSocket = require('ws')

var express = require('express')
var app = express()

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

function notifyAd (msg) {
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
