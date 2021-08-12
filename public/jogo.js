// Módulo jogo: onde ocorre a lógica do jogo
function criaJogo() {
    var ad = O('adversario').value
    var thtml = O('lista-conectados').innerHTML
    var existe = thtml.indexOf(ad)
    if (existe != -1) {

        O('header-jogo').innerText = 'Jogo com '+ad
        O('erro').style.display = 'none'


        var j = {tipo:'jogo', adv1:ad, adv2: O('nome').value} 

        console.log(JSON.stringify(j))
        PubSub.publish('jogo', j)
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
    // O('select-cell').addEventListener('click', jogada(O('select-cell').x, O('select-cell').y))
})

// function enviaJogo() {
//     console.log("Enviando jogo!")
//     PubSub.publish('jogo', {})
// }

// document.addEventListener("DOMContentLoaded", function(event) {
//     O('joga').addEventListener('click', enviaJogo)
//     O('adversario').addEventListener('keydown', event => {
//         if (event.key == "Enter"){
//             enviaJogo()
//         } 
//     }) 
//     // O('select-cell').addEventListener('click', jogada(O('select-cell').x, O('select-cell').y))
// })

// recebe jogada:

// Alguém solicitou para jogar:
PubSub.subscribe('solicita', function(msg, data) {

    console.log("Recebeu soliticação de jogo de " + data.adv2)
    // implementar lógica de aceitar jogo
    // AQUIIIII
    // se aceita:
    PubSub.publish('aceitaJogo', data)
})
