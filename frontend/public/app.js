
const fetchData = async(keyword)=>{
    const response = await fetch(`http://localhost:5000/api/scrape?keyword=${keyword}`)
    const data = await response.json()
    return data
}

const renderResults = (products)=>{
    const fragment = document.createDocumentFragment()
    const searchResults = document.getElementById('searchResults')

    if(products && products.length > 0){
        products.forEach(element => {
            const card = document.createElement('div')
            const title = document.createElement('h2')
            const infos = document.createElement('div')
            // const classification = document.createElement('span')
            const qtyAvaliations = document.createElement('span')
            const image = document.createElement('div')
            const img = document.createElement('img')
            
            title.innerText = element.title
            qtyAvaliations.innerText = element.qtyAvaliations
            img.src = element.imageUrl
            
            const classificationString = element.classification
            
            let classification
            if(classificationString){
                classification = getClassification(classificationString)
            }
            
            const starContainer = document.createElement('div')
            starContainer.classList.add('starContainer')
            rating(starContainer, classification)
            
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
            
            fragment.appendChild(card)
        })
    }else{
        const noProductsMessage = document.createElement('p')
        noProductsMessage.innerText = 'Nenhum Produto encontrado'
        fragment.appendChild(noProductsMessage)
    }
    searchResults.innerHTML = ''
    searchResults.appendChild(fragment)
}

const search = async ()=>{
    const keyword = document.getElementById('searchInput').value
    try{
        const data = await fetchData(keyword)
        renderResults(data.products)
    }catch(error){
        console.log(error)
    }
}
const rating = (container, classification)=>{
    const maxRating = 5
    const rating = classification
    console.log(rating)

    for(let i = 1; i <= maxRating; i++){
        const star = document.createElement('img')
        if(i <= rating){
            star.src = './starfull.png'
            console.log('sim')
        }else if(i - 0.5 <= rating){
            star.src = './starmid.png'
            console.log('mid')
        }else{
            star.src = './star (2).png'
            console.log('not')
        }
        star.classList.add('star')
        container.appendChild(star)
    }
}
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