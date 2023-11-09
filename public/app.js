
const fetchData = async(keyword)=>{ //recebendo a palavra e buscando os produtos, logo em seguida retorna os produtos
    const keywordUpperCase = keyword.toUpperCase()
    try{
        const response = await fetch(`http://localhost:5000/api/scrape?keyword=${keywordUpperCase}`, {
        headers: {
            'Accept': 'application/json'
        }})
        const data = await response.json() 
        console.log(keywordUpperCase)
        return data
    }catch(error){
        console.log(error)
    }
    
}
const renderResults = (products)=>{ //renderizando os produtos na div#searchResults
    const fragment = document.createDocumentFragment()
    const searchResults = document.getElementById('searchResults')
    
    if(products && products.length > 0){ //se os produtos forem maiores que 0, cria se um objeto para informar o número de produtos da página
        const numberElements = document.createElement('div')
        numberElements.classList.add('numberElements')
        numberElements.innerText = `Exibindo ${products.length} resultados!`
        fragment.appendChild(numberElements)
    }

    if(products && products.length > 0){ //loop para criar os elementos no html com base nos produtos, tem-se uma div list onde fica os produtos e uma div card onde fica indivualmente cada produto
        const cardList = document.createElement('div')
        cardList.classList.add('cardList')
        products.forEach(element => {
            const card = document.createElement('div') //card do produto
            const title = document.createElement('h2') //título
            const infos = document.createElement('div') //classificação e avaliações
            const qtyAvaliations = document.createElement('span')
            const image = document.createElement('div') //div imagem
            const img = document.createElement('img') //imagem do produto
            
            title.innerText = element.title
            qtyAvaliations.innerText = element.qtyAvaliations
            img.src = element.imageUrl
            const classificationString = element.classification
            
            let classification
            if(classificationString){
                classification = getClassification(classificationString) //obtendo a classificação em string para modificá-la em uma função abaixo
            }
            
            const starContainer = document.createElement('div') //container das estrelas das avaliações
            starContainer.classList.add('starContainer')
            rating(starContainer, classification) //função que gera as estrelas de acordo com a classificação
            
            card.appendChild(image)
            card.appendChild(title)
            infos.appendChild(starContainer)
            infos.appendChild(qtyAvaliations)
            image.style.backgroundImage = `url(${img.src})`
            image.style.backgroundSize = 'contain'
            image.style.backgroundRepeat = 'no-repeat'
            image.style.backgroundPosition = 'center center'
            card.appendChild(infos)
            
            card.classList.add('productCard')
            title.classList.add('title')
            qtyAvaliations.classList.add('qtyAvaliations')
            infos.classList.add('infos')
            image.classList.add('image')
            cardList.appendChild(card)
            fragment.appendChild(cardList)
        })
        
    }else{
        //se nao encontrar produtos retorna uma mensagem
        const noProductsMessage = document.createElement('p')
        noProductsMessage.innerText = 'Nenhum Produto encontrado'
        fragment.appendChild(noProductsMessage)
    }
    //se encontrar retorna os produtos
    searchResults.innerHTML = ''
    searchResults.appendChild(fragment)
}

//pegando o valor do input e chamando a função de busca
const search = async ()=>{
    const keyword = document.getElementById('searchInput').value.toUpperCase()
    try{
        const data = await fetchData(keyword)
        renderResults(data.products)
    }catch(error){
        console.log(error)
    }
}
//função que gera as estrelas de acordo com a classificação
//valor inteiro = estrela completa
//valor nulo = estrela vazia
//valor decimal / estrela pela metade

const rating = (container, classification)=>{
    const maxRating = 5
    const rating = classification

    for(let i = 1; i <= maxRating; i++){
        const star = document.createElement('img')
        if(i <= rating){
            star.src = '/images/starfull.png'
        }else if(i - 0.5 <= rating){
            star.src = '/images/starmid.png'
        }else{
            star.src = '/images/star (2).png'
        }
        star.classList.add('star')
        container.appendChild(star)
    }
}
//obtendo a classificação e retornando em número decimal
const getClassification = (classification)=>{
    const regex = /(\d+,\d+)/
    const match = classification.match(regex)
    if(match){
        const classificationDecimal = match[0]
        return classificationDecimal.replace(',', '.')
    }else{
        console.log('Impossível obter classificação!')
    }
}

document.getElementById('searchButton').addEventListener('click', search)