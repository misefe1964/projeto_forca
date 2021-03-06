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
PubSub.subscribe('jogadaI', function(msg, data){
    data.tipo = "jogada"    // garante que tipo de mensagem paa servidor é certa
    console.log("Jogada não processada recebida:")
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
            break;
            case 'desafioAceito':
                PubSub.publish('iniciaJogo', tmp)
                console.log("Iniciando jogo aceito");
            break;
            case 'jogadaF':
                // console.log('Rede recebe jogada processada: '+JSON.stringify(tmp))
                PubSub.publish('jogadaF', tmp)
            break;
        }
    }
}

PubSub.subscribe('fimJogo', function(msg, data){
    socket.send(JSON.stringify(data))
})

PubSub.subscribe('connection', function(msg, data){
    conectaServidorSockets('ws://localhost:10000', data.nome)
})


