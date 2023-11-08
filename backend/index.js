const express = require('express')
const app = express()
const port = 5000
const axios = require('axios')
const cheerio = require('cheerio')

//cache
const nodeCache = require('node-cache')
const myCache = new nodeCache({stdTTL: 0, checkperiod: 600})

app.use(express.static('public', {
    maxAge: 3600
}))
app.use(express.static('html'))
app.use(express.static('js'))
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

app.get('/api/scrape', async (req, res)=> {
    try {
        const keyword =  req.query.keyword
        if(!keyword){
            res.status(404).json({message: 'Palavra chave não encontrada, verifique e tente novamente!'})
            return
        }

        const searchUrl = `https://www.amazon.com.br/s?k=${keyword}`

        const response = await axios.get(searchUrl)
        
        const $ = cheerio.load(response.data)
        const listProducts = []

        if($('.s-search-results').length === 0){
            res.status(404).json({message: 'Nenhum produto foi encontrado!'})
            return
        }
        $('.s-search-results .s-result-item').each((index, element) => {

            const title = $(element).find('span.a-size-base-plus.a-color-base.a-text-normal').text()
            const classification= $(element).find('div.a-row.a-size-small span:first').text()
            const qtyAvaliations= $(element).find('div.a-row.a-size-small span:last').text()
            const imageUrl = $(element).find('img.s-image').prop('src')
            
            const productItem = {title: title, classification: classification, qtyAvaliations: qtyAvaliations, imageUrl: imageUrl}
            
            if(productItem.title){
                listProducts.push(productItem)
            }   
        })
        const obj = {my: 'Keyword', variable: keyword}
        myCache.set('myKey', obj, 3600)
        res.status(200).json({message: 'Produtos', products: listProducts})
    }catch (error) {
        console.log(error)
        res.status(400).json({message: 'Erro em processar a sua solicitação', error: error})
    }
})
app.listen(port, (error)=>{
    if(error){
        console.log(error)
    }
    console.log('Conectado!')
})