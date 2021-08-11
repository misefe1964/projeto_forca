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

PubSub.subscribe('iniciaJogo', function(msg, data) {
    console.log(JSON.stringify(data))
    O('header-jogo').innerText = 'Jogo com '+data.adv2
    O('header-jogo').style.display='table'
    O('tabul').style.display = 'table'
    O('escolhe-jogador').style.display = 'none'
    O('erro').style.display = 'none'
})


