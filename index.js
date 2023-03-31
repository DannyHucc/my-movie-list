'use strict'

const BASE_URL = 'https://webdev.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/movies/'
const SHOW_URL = BASE_URL + 'posters/'

const movies = []
let filteredMovies = []
let currentPageData = []
let displayModesClassName = 'control-grid'

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const paginator = document.querySelector("#paginator")
const displayModes = document.querySelector("#display-modes")

const MOVIES_PER_PAGE = 15

// 取得對應電影資料
function getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies
    const endIndex = page * MOVIES_PER_PAGE
    currentPageData = data.slice(endIndex - MOVIES_PER_PAGE, endIndex)
    return currentPageData
}

// 渲染電影資料
function renderMovieList(movies) {
    let rawHTML = ''
    if (displayModesClassName === 'control-grid') {
        movies.forEach((movie) => {
            rawHTML +=
                `
        <div class="m-3">
                <div class="mb-2">
                    <div class="card" style="width: 18rem;">
                        <img src="${SHOW_URL}${movie.image}"
                            class="card-img-top" alt="Movie Poster">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                        </div>
                            <div class="card-footer">
                                <button 
                                    type="button" 
                                    class="btn btn-primary btn-show-movie" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#movie-model" 
                                    data-id="${movie.id}">
                                    More
                                </button>
                                <button 
                                    type="submit" 
                                    class="btn btn-info btn-add-favorite"
                                    data-id="${movie.id}">
                                    +
                                </button>
                        </div>
                    </div>
                </div>
            </div>
        `
        })
    } else if (displayModesClassName === 'control-list') {
        movies.forEach((movie) => {
            rawHTML +=
                `
        <div class="col-12">
            <div class="row">
                    <p class="col-9 border-top border-dark p-1 m-0">${movie.title}</p>
                    <div class="col-3 border-top border-dark p-1">
                        <button
                            type="button"
                            class="btn btn-primary btn-show-movie"
                            data-bs-toggle="modal"
                            data-bs-target="#movie-model"
                            data-id="${movie.id}">
                            More
                        </button>
                        <button 
                            type="submit" 
                            class="btn btn-info btn-add-favorite"
                            data-id="${movie.id}">
                            +
                        </button>
                    </div>
            </div>
        </div>
        `
        })
    }
    dataPanel.innerHTML = rawHTML
}

// 顯示分頁器
function renderPaginator(dataLength) {
    const numberOfPages = Math.ceil(dataLength / MOVIES_PER_PAGE)
    let rawHTML = ""
    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML
}

// 顯示電影詳細資訊
function showMovieDetail(id) {
    const modalContent = document.querySelector("#movie-modal-content")
    axios
        .get(INDEX_URL + id)
        .then((response) => {
            const data = response.data.results
            let rawHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="movie-modal-title">${data.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="movie-modal-body">
                        <div class="row">
                            <div class="col-sm-8" id="movie-modal-image">
                                <img src="${SHOW_URL}${data.image}"
                                    alt="movie-poster" class="img-fluid">
                            </div>
                            <div class="col-sm-4">
                                <p><em id="movie-modal-date">release date: ${data.release_date}</em></p>
                                <p id="movie-modal-description">${data.description}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            `
            modalContent.innerHTML = rawHTML
        })
        .catch((err) => console.log(err))
}

// 增加喜歡的電影
function addToFavorite(id) {
    const localStorageList = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    if (localStorageList.some((movie) => Number(movie.id) === id)) {
        const movieIndex = movies.findIndex((movie) => Number(movie.id) === id)
        return alert(`電影：${movies[movieIndex].title} 已經在收藏清單中！`)
    } else {
        const movie = movies.find((movie) => Number(movie.id) === id)
        localStorageList.push(movie)
        localStorage.setItem('favoriteMovies', JSON.stringify(localStorageList))
        return alert(`電影：${movie.title} 已加入到最愛`)
    }
}

// 串接 API 並渲染電影資料
axios.get(INDEX_URL)
    .then((response) => {
        movies.push(...response.data.results)
        renderPaginator(movies.length)
        renderMovieList(getMoviesByPage(1))
    })
    .catch((err) => console.log(err))

// 建立搜尋按鈕的事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    const searchInput = document.querySelector("#search-input")
    event.preventDefault()
    const keyword = searchInput.value.trim().toLowerCase()
    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword))
    if (!keyword.length || keyword.trim().length === 0) {
        alert(`搜尋欄位不能為空\n請輸入要尋找的朋友名字`)
    } else if (!filteredMovies.length) {
        alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }
    searchInput.value = ""
    renderMovieList(getMoviesByPage(1))
    renderPaginator(filteredMovies.length)
})

// 建立顯示模式的按鈕事件
displayModes.addEventListener('click', function onModeClicked(event) {
    // 如果點擊為 gird 模式
    if (event.target.classList.contains('control-grid')) {
        displayModesClassName = 'control-grid' // 將 class name 修改為 gird 模式
        // 如果點擊為 list 模式
    } else if (event.target.classList.contains('control-list')) {
        displayModesClassName = 'control-list' // 將 class name 修改為 list 模式
    }
    renderMovieList(currentPageData)
})

// 建立電影詳細資訊按鈕的事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
        showMovieDetail(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
})

// 建立分頁按鈕事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
    if (event.target.tagName !== 'A') { return }
    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))
})