// Módulo jogo: onde ocorre a lógica do jogo

let jogo;

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

function gogo(){
    // se aceita:
    PubSub.publish('aceitaJogo', jogo)
}

function beginning(){
    O('header-jogo').style.display = 'none'
    O('tabul').style.display = 'none'
    O('erro').style.display = 'none'
    O('vez').style.display = 'none'
    O('escolhe-jogador').style.display = 'inline'
}

function selLetra(l){
    // se é a primeira jogada:
    console.log("Recebeu jogada com "+l)
    jogo.letra = l
    console.log("Jogo a ser enviado para servidor: "+JSON.stringify(jogo))
    PubSub.publish('jogadaI', jogo)
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

document.addEventListener("DOMContentLoaded", function(event) {
    O('joga').addEventListener('click', criaJogo)
    O('adversario').addEventListener('keydown', event => {
        if (event.key == "Enter"){
            criaJogo() 
        } 
    }) 
    // O('select-cell').addEventListener('click', jogada(O('select-cell').x, O('select-cell').y))
})
// Alguém solicitou para jogar:
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

PubSub.subscribe('jogoAtual', function(msg, data) {
    console.log("Recebeu jogo atual!")
    preparaJogada(data);
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
        b2.setAttribute('onClick', 'beginning()')

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
        let t2 = document.createTextNode("Início")
        b.appendChild(t2)
        b.setAttribute('class', 'newBt')
        b.setAttribute('onclick', 'window.location.reload()')
        
        let d = O('novo')
        d.appendChild(mens)
        d.appendChild(b)

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

