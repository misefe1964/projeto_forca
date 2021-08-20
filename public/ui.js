// Módulo de interface de usuário, onde é atualizado o DOM baseado em mensagens
function O(X){
    return document.getElementById(X)
}

function C(X){
    return document.getElementsByClassName(X)
}


PubSub.subscribe('todosUsuarios', function(msg, data) {
    console.log(data.valor)

    for(let a = 0; a < data.valor.length; a++) {
        O('lista-conectados').innerHTML = O('lista-conectados').innerHTML+'<br>'+data.valor[a]
    }
})

PubSub.subscribe('inicio', function(msg, data) {
    O('header-jogo').style.display = 'none'
    O('tabul').style.display = 'none'
    O('erro').style.display = 'none'
    O('vez').style.display = 'none'
    O('escolhe-jogador').style.display = 'inline'
})

function fazConexao(){
    O('identificacao').style.display='none'
    var nome = O('nome').value

    PubSub.publish('connection', {nome:nome})

    O('header-jogo').style.display='table'
    O('greet').innerText = "Bem vindo(a) "+nome+"!"
    O('greet').style.display = 'inline'
}

function criaJogo() {
    var ad = O('adversario').value
    var thtml = O('lista-conectados').innerHTML
    var existe = thtml.indexOf(ad)
    if (existe != -1) {
        O('erro').style.display = 'none'
        var j = {tipo:'jogo', adv1:ad, adv2: O('nome').value} 
        console.log(JSON.stringify(j))
        PubSub.publish('jogo', j)
    } else {
        O('erro').style.display = 'inline'
    }
}



PubSub.subscribe('usuarioNovo', function(msg, data) {
    console.log(data.valor)
    O('lista-conectados').innerHTML = O('lista-conectados').innerHTML+'<br>'+data.valor
})

PubSub.subscribe('iniciaJogo', function(msg, data) {
    console.log(JSON.stringify(data))
    O('header-jogo').innerText = 'Jogo com '+data.adv2
    O('header-jogo').style.display='table'
    O('tabul').style.display = 'flex'
    O('escolhe-jogador').style.display = 'none'
    O('erro').style.display = 'none'
    O('sol').style.display = 'none'

    if(data.adj == O('nome').value){
        O('vez').innerHTML = "Sua vez!"
        O('vez').style.color = "green";
    } else {
        O('vez').innerHTML = "Aguarde a sua vez..."
        O('vez').style.color = "red";
    }

    O('vez').style.justifyContent = 'center'
        
    if(data.tamPalavra != undefined){
        let pos;

        console.log("Iniciando: ")
        // Coloca Linhas para as letras da palavra:
        for (pos = 0; pos < data.tamPalavra; pos++) {
            let span = document.createElement('span')
            span.setAttribute('id', pos);
            span.setAttribute('class', "sp")

            let div = O('palavra')
            div.appendChild(span)
        }
        
        // jogada = {tipo: 'jogada', status: 'i' para indefinido ou 'a' para acerto ou 'e' para erro,
        // letra: [letra do botão clicado], chances: [chances restantes], acertos: [letras acertadas], 
        // adj: [jogador que jogou], adp: [jogador que vai jogar]}
        data.tipo = 'jogada'
        // Coloca botões para letras do alfabeto
        console.log("Alfabeto... ")
        let alfabeto = "abcdefghijklmnopqrstuvwxyz"
        let letras = alfabeto.split("")

        for(pos = 0; pos < letras.length; pos++){
            let b = document.createElement("button")
            let l = document.createTextNode(letras[pos])

            b.appendChild(l)
            b.setAttribute('id', letras[pos])
            b.setAttribute('class', "botaoLetra");

            let div = document.getElementById("letras")
            div.appendChild(b)
        }
        PubSub.publish('jogoAtual', data)
   }

})

PubSub.subscribe("init", function(msg, data){
    O('header-jogo').style.display = 'none'
    O('tabul').style.display = 'none'
    O('greet').style.display = 'none'
    O('erro').style.display = 'none'
    O('vez').style.display = 'none'

    O('conecta').addEventListener('click', fazConexao)
    O('nome').addEventListener('keydown', event=> {
        if(event.key == "Enter"){
            fazConexao()
        }
    })
    O('joga').addEventListener('click', criaJogo)
    O('adversario').addEventListener('keydown', event => {
        if (event.key == "Enter"){
            criaJogo() 
        } 
    }) 
})


