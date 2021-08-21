// Módulo jogo: onde ocorre a lógica do jogo

let jogo;

function gogo(){
    // se aceita:
    PubSub.publish('aceitaJogo', jogo)
}

function selLetra(l){
    // se é a primeira jogada:
    console.log("Recebeu jogada com "+l)
    jogo.letra = l
    console.log("Jogo a ser enviado para servidor: "+JSON.stringify(jogo))
    PubSub.publish('jogadaI', jogo)
}

PubSub.subscribe('init', function(msg, data){
    console.log("Módulo de jogo iniciado")
})

