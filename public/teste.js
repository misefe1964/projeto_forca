var socket

O('header-jogo').style.display = 'none'
O('tabul').style.display = 'none'
O('greet').style.display = 'none'
O('erro').style.display = 'none'

function O(X){
    return document.getElementById(X)
}

function jogada(x, y){
    console.log(x)
    console.log(y)
}

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
                console.log('todosUsuarios')
                console.log(tmp.valor)

                for(let a = 0; a < tmp.valor.length; a++) {
                    O('lista-conectados').innerHTML = O('lista-conectados').innerHTML+'<br>'+tmp.valor[a]
                }
                break;
            case 'usuarioNovo':
                console.log('usuarioNovo')
                console.log(tmp.valor)
                O('lista-conectados').innerHTML = O('lista-conectados').innerHTML+'<br>'+tmp.valor
                break;
            case 'jogo':
                O('header-jogo').innerText = 'Jogo com '+tmp.adv2
                O('header-jogo').style.display='table'
                O('mostra-simbolo').innerText = 'Você é '+tmp.simbolo
                O('mostra-simbolo').style.display='table'
                O('tabul').style.display = 'table'
                O('escolhe-jogador').style.display = 'none'
               console.log("recebeu jogo!")
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

function criaJogo() {
    var ad = O('adversario').value
    var thtml = O('lista-conectados').innerHTML
    var existe = thtml.indexOf(ad)
    if (existe != -1) {
        var jogo

        if(Math.floor(Math.random()*100) % 2 == 0){
            jogo = {x:ad, o: O('nome').value}
            var simb = 'x'
            var simb2 = 'o'
        } else {
            jogo = {x:O('nome').value, o: ad}
            var simb = 'o'
            var simb2 = 'x'
        }
        console.log(jogo)

        O('header-jogo').innerText = 'Jogo com '+ad
        O('escolhe-jogador').style.display = 'none'
        O('header-jogo').style.display='table'
        O('mostra-simbolo').innerText = 'Você é '+simb2
        O('mostra-simbolo').style.display='table'
        O('tabul').style.display = 'table'
        O('erro').style.display = 'none'

        console.log('Iniciando jogo ' + JSON.stringify(jogo))

        var j = {tipo:'jogo', adv1:ad, adv2: O('nome').value, simbolo:simb} 

        console.log(JSON.stringify(j))
        socket.send(JSON.stringify(j))
    } else {
        O('erro').style.display = 'inline'
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    O('joga').addEventListener('click', criaJogo)
    O('adversario').addEventListener('keydown', event => {
        if (event.key == "Enter"){
            criaJogo() 
        } 
    }) 
    O('select-cell').addEventListener('click', jogada(O('select-cell').x, O('select-cell').y))
})
