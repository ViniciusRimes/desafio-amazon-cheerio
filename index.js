//importando os módulos necessários
const express = require('express')
const app = express()
const port = 5000
const axios = require('axios')
const cheerio = require('cheerio')
const path = require('path')

// processo de cache usando node-cache
const nodeCache = require('node-cache')
const myCache = new nodeCache({stdTTL: 0, checkperiod: 600})

//middlewares para cache e public
app.use(express.static('public', {
    maxAge: 3600
}))
app.use(express.static(path.join(__dirname + './public')))
app.use((req, res, next)=>{
    res.setHeader('Cache-Control', 'public, max-age=3600')
    next()
})


//Content Secutiry Policy(CSP) para poder utilizar fontes do GoogleFonts
const helmet = require('helmet')
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        fontSrc: ["'self'", "fonts.gstatic.com"]
    }
}))
//routes
app.get('/', (req, res)=>{ //rota base do site
    res.sendFile(__dirname + '/public/index.html')
})
app.get('/api/scrape', async (req, res)=> { //rota para obter as informações dos produtos
    try {
        const keyword =  req.query.keyword //palavra chave que vem do frontend
        if(!keyword){
            res.status(404).json({message: 'Palavra chave não encontrada, verifique e tente novamente!'})
            return
        }
        const searchUrl = `https://www.amazon.com.br/s?k=${keyword}` //url da pesquisa da amazon onde passamos a palavra chave

        const response = await axios.get(searchUrl) //obtendo url usando axios para facilitar
        
        const $ = cheerio.load(response.data) //obtendo o conteúdo da página com cheerio
        const listProducts = []

        if($('.s-search-results').length === 0){
            res.status(404).json({message: 'Nenhum produto foi encontrado!'})
            return
        }
        $('.s-search-results .s-result-item').each((index, element) => { //página dos produtos, preenchendo objetos com base nas informações obtidas com cheerio

            const title = $(element).find('span.a-size-base-plus.a-color-base.a-text-normal').text() //título do produto
            const classification= $(element).find('div.a-row.a-size-small span:first').text() //classificação do produto
            const qtyAvaliations= $(element).find('div.a-row.a-size-small span:last').text() //quantidade de avaliações do produto
            const imageUrl = $(element).find('img.s-image').prop('src') //imagem do produto
            
            const productItem = {title: title, classification: classification, qtyAvaliations: qtyAvaliations, imageUrl: imageUrl}
            
            if(productItem.title){ //só envia o objeto se ele possuir título, para evitar objetos vazios
                listProducts.push(productItem)
            }   
        })
        const obj = {my: 'Keyword', variable: keyword} //cache options
        myCache.set('myKey', obj, 3600)
        res.status(200).json({message: 'Produtos', products: listProducts}) //envio dos produtos por json com código de status
    }catch (error) {
        res.status(400).json({message: 'Erro em processar a sua solicitação', error: error}) //código de erro + erro
    }
})
app.listen(port, (error)=>{ //rodando servidor
    if(error){
        console.log(error)
    }
    console.log('Conectado!')
})