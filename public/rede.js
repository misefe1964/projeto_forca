var socket

function O(X){
    return document.getElementById(X)
}

// function jogada(x, y){
//     console.log(x)
//     console.log(y)
// }

PubSub.subscribe('jogo', function(msg, data) {
    console.log(data)
    socket.send(JSON.stringify(data));
})

PubSub.subscribe('aceitaJogo', function(msg, data) {
    data.tipo = 'jogoAceito';
    socket.send(JSON.stringify(data))
})

// jogada recebida
PubSub.subscribe('jogada', function(msg, data){
    console.log("Jogada recebida:")
    console.log(data)
    socket.send(JSON.stringify(data))
})

function conectaServidorSockets(url, nome){
    socket = new ReconnectingWebSocket(url)

    socket.onopen = function(evt) {
        console.log('Conectou com o servidor')
        var m = {tipo:'login', valor:nome}
        socket.send(JSON.stringify(m))
    }
    socket.onclose = function(evt) {
        console.log('foi desconectado do servidor')
    }
    socket.onmessage = function(evt) {
        var tmp = evt.data

        tmp = JSON.parse(tmp)
        switch (tmp.tipo){
            case 'todosUsuarios':
                PubSub.publish('todosUsuarios', tmp)
                console.log('todosUsuarios')
                console.log(tmp.valor)
            break;
            case 'usuarioNovo':
                PubSub.publish('usuarioNovo', tmp)
                console.log('usuarioNovo')
            break;
            case 'solJogo':
                PubSub.publish('solicita', tmp)
                console.log("solicitando... jogo!")
            case 'desafioAceito':
                PubSub.publish('iniciaJogo', tmp)
                console.log("Iniciando jogo aceito");
        }
    }
}

function fazConexao(){
    O('identificacao').style.display='none'
    var nome = O('nome').value
    conectaServidorSockets('ws://localhost:10000', nome)

    var salva = {ID:nome, PASS:''}
    localStorage.setItem('meusSettings', JSON.stringify(salva))

    O('header-jogo').style.display='table'
    O('greet').innerText = "Bem vindo(a) "+nome+"!"
    O('greet').style.display = 'inline'
}

document.addEventListener("DOMContentLoaded", function(event) {
    O('conecta').addEventListener('click', fazConexao)
    O('nome').addEventListener('keydown', event=> {
        if(event.key == "Enter"){
            fazConexao()
        }
    })
})


