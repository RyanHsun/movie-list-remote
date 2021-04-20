// 宣告
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies'))
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

// 函式：點擊 more 按鈕
function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFormFavorite(Number(event.target.dataset.id))
  }
}
// 函式：產生電影清單
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-4">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}
// 函式：跳窗畫面
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date : ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
}
// 函式：移除我的最愛
function removeFormFavorite(id) {
  if (!favoriteMovies) return

  const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) return

  favoriteMovies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))

  renderPaginator(favoriteMovies.length)
  renderMovieList(getMoviesByPage(1))
}
// 函式：每一個分頁要顯示不同的電影資料
function getMoviesByPage(page) {
  const data = favoriteMovies.length ? favoriteMovies : []
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
// 函式：渲染頁數區塊
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
// 函式：偵測在 #data-panel 區塊點擊
function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
}

// 事件監聽器
dataPanel.addEventListener('click', onPanelClicked)
paginator.addEventListener('click', onPaginatorClicked)

// 呼叫函式
renderPaginator(favoriteMovies.length)
renderMovieList(getMoviesByPage(1))
