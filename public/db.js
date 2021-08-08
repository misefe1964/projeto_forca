// Módulo de banco de dados: gerencia o BD, possibilita adição de palavras, e contabiliza vitórias e derrotas dos usuários
var MongoClient = require("mongodb").MongoClient
var url = 'mongodb://localhost:27017'
var dbo

MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, db) {
    if (err) {
        console.log("Erro conectando com o servidor de BD")
    }
    
    else console.log("Conectado ao BD")
    dbo = db.db("forca")

    // O banco de dadoos se chama "forca", e a coleção se chama "palavras".
    // Cada documento da coleção tem um campo '_id' e um campo 'p' onde a palavra é armazenada. 

    dbo.collection('palavras').find({}).toArray(function (err, result) {
        if (err) throw err;
        if (result[0] == undefined) console.log("Não deu certo")
        else{
            for (let a = 0; a < result.length; a++) {
                console.log("Achou ", result[a].p)
            }
        }
    })
})
