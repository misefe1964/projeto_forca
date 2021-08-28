// Módulo de interface de usuário, onde é atualizado o DOM baseado em mensagens
function O(X){
    return document.getElementById(X)
}

function C(X){
    return document.getElementsByClassName(X)
}

function preparaJogada(data){
    // botão só tem funcionalidade se é a sua vez
    let alfabeto = "abcdefghijklmnopqrstuvwxyz"
    let letras = alfabeto.split("")
    let pos

    if(data.adj == O('nome').value){
        for(pos = 0; pos < letras.length; pos++){
            b = O(letras[pos])
            if(b.getAttribute("class") == "botaoLetra")
                b.setAttribute('onclick', 'selLetra(\''+letras[pos]+'\')')
        }
    }
    else {
        for(pos = 0; pos < letras.length; pos++){
            b = O(letras[pos])
            b.removeAttribute('onclick')
        }
    }
    O('vez').style.display = 'flex'
    if(data.adj == O('nome').value){
        O('vez').innerHTML = "Sua vez!"
        O('vez').style.color = "green";
    } else {
        O('vez').innerHTML = "Aguarde a sua vez..."
        O('vez').style.color = "red";
    }
    if(data.acertos == undefined || data.chances == undefined){
        console.log("primeira jogada!")
        data.acertos = 0
        data.chances = 6
        jogo = data
        console.log("Jogo agora: ")
        console.log(JSON.stringify(jogo))
    }
}

PubSub.subscribe('todosUsuarios', function(msg, data) {
    console.log(data.valor)

    for(let a = 0; a < data.valor.length; a++) {
        O('lista-conectados').innerHTML = O('lista-conectados').innerHTML+'<br>'+data.valor[a]
    }
})

function beggining(){
    O('header-jogo').style.display = 'none'
    O('tabul').style.display = 'none'
    O('erro').style.display = 'none'
    O('vez').style.display = 'none'
    O('escolhe-jogador').style.display = 'inline'
}

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

PubSub.subscribe('jogoAtual', function(msg, data) {
    console.log("Recebeu jogo atual!")
    preparaJogada(data);
})

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

PubSub.subscribe('solicita', function(msg, data) {

    console.log("Recebeu soliticação de jogo de " + data.adv2)
    // implementar lógica de aceitar jogo
    let mens = document.createElement('p')
    let mmm = document.createTextNode("Você deseja jogar com "+data.adv2+"?")

    mens.appendChild(mmm)

    let b = document.createElement("button")
    let t2 = document.createTextNode("Aceitar")
    b.appendChild(t2)
    b.setAttribute('class', 'newBt')
    b.setAttribute('onclick', 'gogo()')

    let d = O('sol')
    d.appendChild(mens)
    d.appendChild(b)

    // AQUIIIII
    jogo = data
})


PubSub.subscribe('jogadaF', function(msg, data){
    // console.log("Jogo processando jogada:", JSON.stringify(data))
    let imagem = 6-data.chances
    if(imagem != 0){
        O('forca').src = "images/forca"+imagem+".png"
    }
    var but = O(data.letra)
    
    // se errou:
    if(data.acertos == jogo.acertos){
        console.log("jogo reconhece que ERRRRRROU")
        but.setAttribute('class', 'errada')
        but.removeAttribute('onclick')
    }
    else{
        let p
        for(p = 0; p < data.preencher.length; p++){
            let sp = O(data.preencher[p])
            let l = document.createTextNode(data.letra)

            sp.appendChild(l)

            let b = O(data.letra)
            b.setAttribute('class', 'certa')
            b.removeAttribute('onclick')
        }
    }
    
    // se acabaram as chances:
    if(data.chances == 0){
        console.log("Não tem mais jeito... acabou... boa sorte!")
        let mens = document.createElement("p")
        let t1 = document.createTextNode("Derrota...")
        mens.appendChild(t1)

        let b = document.createElement("button")
        let t2 = document.createTextNode("Sair")
        let b2 = document.createElement("button")
        let t3 = document.createTextNode("Início")
        b.appendChild(t2)
        b2.appendChild(t3)
        b.setAttribute('class', 'newBt')
        b2.setAttribute('class', 'newBt')
        b.setAttribute('onclick', 'window.location.reload()')
        b2.setAttribute('onClick', 'beggining()')

        let d = O('novo')
        d.appendChild(mens)
        d.appendChild(b)
        d.appendChild(b2)
        
        O('letras').style.display = 'none'
        O('vez').style.display = 'none'
        let f = {tipo:'fim',j:O('nome').value,s:'d'}
        PubSub.publish('fimJogo', f)
    }
    // se acertou todas as letras:
    else if(data.acertos == data.tamPalavra){
        console.log("FIMMMM no bom sentido")
        let mens = document.createElement("p")
        let t1 = document.createTextNode("Parabéns!")
        mens.appendChild(t1)
        O('letras')

        let b = document.createElement("button")
        let b2 = document.createElement("button")
        let t2 = document.createTextNode("Início")
        let t3 = document.createTextNode("Sair")
        b.appendChild(t2)
        b2.appendChild(t3)
        b.setAttribute('class', 'newBt')
        b2.setAttribute('class', 'newBt')
        b.setAttribute('onclick', 'window.location.reload()')
        b2.setAttribute('onClick', 'beggining()')
        
        let d = O('novo')
        d.appendChild(mens)
        d.appendChild(b)
        d.appendChild(b2)

        O('letras').style.display = 'none'
        O('vez').style.display = 'none'

        let f = {tipo:'fim',j:O('nome').value,s:'v'}
        PubSub.publish('fimJogo', f)

    }
    else{
        jogo = data
        preparaJogada(jogo)        
    }
})

