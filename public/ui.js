// Módulo de interface de usuário, onde é atualizado o DOM baseado em mensagens
function O(X){
    return document.getElementById(X)
}

O('header-jogo').style.display = 'none'
O('tabul').style.display = 'none'
O('greet').style.display = 'none'
O('erro').style.display = 'none'

PubSub.subscribe('todosUsuarios', function(msg, data) {
    console.log(data.valor)

    for(let a = 0; a < data.valor.length; a++) {
        O('lista-conectados').innerHTML = O('lista-conectados').innerHTML+'<br>'+data.valor[a]
    }
})

PubSub.subscribe('usuarioNovo', function(msg, data) {
    console.log(data.valor)
    O('lista-conectados').innerHTML = O('lista-conectados').innerHTML+'<br>'+data.valor
})

PubSub.subscribe('enviaJogo', function(msg, data) {
    console.log("ENVIANDO JOGOOOO")
    console.log(JSON.stringify(data))
    O('header-jogo').innerText = 'Jogo com '+data.vc
    O('header-jogo').style.display='table'
    O('mostra-simbolo').innerText = 'Você é '+data.simb
    O('mostra-simbolo').style.display='table'
    O('tabul').style.display = 'table'
    O('escolhe-jogador').style.display = 'none'
})

PubSub.subscribe('recebeJogo', function(msg, data) {
    console.log("RECEBENDO JOGOOOO")
    console.log(JSON.stringify(data))
    O('header-jogo').innerText = 'Jogo com '+data.adv2
    O('header-jogo').style.display='table'
    O('mostra-simbolo').innerText = 'Você é '+data.simbolo
    O('mostra-simbolo').style.display='table'
    O('tabul').style.display = 'table'
    O('escolhe-jogador').style.display = 'none'
    O('erro').style.display = 'none'
})
function enviaJogo() {
    console.log("Enviando jogo!")
    PubSub.publish('jogo', {})
}

document.addEventListener("DOMContentLoaded", function(event) {
    O('joga').addEventListener('click', enviaJogo)
    O('adversario').addEventListener('keydown', event => {
        if (event.key == "Enter"){
            enviaJogo()
        } 
    }) 
    // O('select-cell').addEventListener('click', jogada(O('select-cell').x, O('select-cell').y))
})
