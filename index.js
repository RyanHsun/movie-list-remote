/* 宣告 */
const
  BASE_URL = 'https://movie-list.alphacamp.io',
  INDEX_URL = BASE_URL + '/api/v1/movies/',
  POSTER_URL = BASE_URL + '/posters/',
  MOVIES_PER_PAGE = 12, // 一個頁面要顯示的電影資料，可自由更換要顯示的數量
  body = document.querySelector('body'),
  dataPanel = document.querySelector('#data-panel'),
  controlPanel = document.querySelector('#control-panel'),
  paginator = document.querySelector('#paginator'),
  searchForm = document.querySelector('#search-form'),
  searchInput = document.querySelector('#search-input'),
  modeSwitch = document.querySelector('#mode-switch'),
  btnReset = document.querySelector('#btn-reset'),
  errorMessage = document.querySelector('#error-message'),
  movies = []

let
  currentPage = 1,
  currentMode = 'card',
  errorMode = 0,
  filteredMovies = []


/* 函式：渲染電影清單
    主要使用 樣板字面值 template literals 快速建構 HTML 內容
    參數 data 會接收到的一組透過 getMoviesByPage(page) 解析過的陣列資料，再使用 forEach() 方法一筆一筆遍歷電影資料，
    依照 template literals 格式將 HTML 內容存進 rawHTML 中
    最後使用 innerHTML 方法將內容放入 dataPanel 區塊中
*/
function renderMovieListCardMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card mb-4">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}
function renderMovieListListMode(data) {
  let rawHTML = '<ul class="list-group mt-2">'
  data.forEach((item) => {
    rawHTML += `
      <li class="list-group-item">
        <h5 class="list-title">${item.title}</h5>
        <div class="">
          <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li> 
  `
  })
  rawHTML += '</ul>'
  dataPanel.innerHTML = rawHTML
}
/* 函式：跳窗畫面 
    使用點擊時存在參數 id 的值作為引數
    使用 docuent.querySelector 方法取得HTML中的 DOM 
    經過 axios .get 解析 API 資料，使用 .then 更換 DOM 內容
*/
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

/* 函式：加到最愛
    點擊啟動事件： > 找資料find() > 不符合跳警示 > 有符合加資料push() > 更新localStorage資料
    取得 LocalStorage 存取的最愛清單資料指向給宣告的常數，使用 JSON.parse 重新編譯為字串格式，並使用邏輯運算子判斷布林值將預設值傳給 list 常數
    使用 find() 語法遍歷 movies 陣列資料，若 電影ID 有符合點擊電影時取得的 ID，找到了第一個符合的就會停止並將該筆資料存進新陣列 favoriteMovies 中
    使用 some() 語法遍歷 list localStorage資料回傳布林值，若是資料中有任何一筆 電影ID 有符合點擊電影時取得的 ID 即為 true，進入判斷式執行指令 return 跳出警示視窗
    return：傳完回傳值就會跳出函式的意思，透過其特性若結果為 false 的話就繼續執行下面的程式
    使用 push() 方法將之前取得的該筆 favoriteMovies 資料增加至 list 陣列中
    透過 setItem() 更新 LocalStorage 資料
*/
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const favoriteMovies = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('您已經收藏過此部電影了！')
  }
  list.push(favoriteMovies)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
/* 函式：每一個分頁要顯示不同的電影資料     
    因為要重複執行電影畫面及搜尋結果的頁數，所以透過三元運算子簡化 if else 判斷式，將結果指向給 data
    將 data 陣列使用 slice() 方法，複製一組透過 begin 至 end(不包含end)取得的新陣列物件
    常數設定：
    page 1 : movie 01 ~ 12 >> 取得 00 ~ 11 >> slice(0, 12)
    page 2 : movie 13 ~ 24 >> 取得 12 ~ 23 >> slice(12, 24)
    page 3 : movie 25 ~ 36 >> 取得 24 ~ 35 >> slice(24, 36)
    依 slice() 邏輯以此類推出算式：第一個值為 (頁數 - 1) * 一頁顯示的數量；第二個值為 brgin的值 + 一頁顯示的數量
*/
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
/* 函式：渲染頁數區塊
    使用 Math.ceil() 方法 將 電影資料總數量 除以 每一頁要顯示的數量 然後講取得的值無條件四捨五入 >> 80 ÷ 12 = 6.666 numberofPage = 7
    設定一個變數 rawHTML，
    使用 numberOfPage 的值做為跑 for迴圈 的上限值，透過 template literal 將內容依序增加至 rawHTML 中，再藉由 innerHTML 方法將內容放入 paginator 內印出頁數按鈕
*/
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


/* 函式：點擊 more 按鈕 
    使用 if else 判斷式偵測點擊的標籤 class 是否為 .btn-show-movie 或是 .btn-add-favorite
    並使用 HTMLElement.dataset 訪問設定在標籤上的自定義數據屬性 data-id，因為 id 值為數字，記得使用 Number() 將參數轉換為數字
    再將型別轉換完成的值作為 shoMovieModal() 或是 addToFavorite() 的參數
*/
dataPanel.addEventListener('click', function onPanelClicked(event) {
  event.preventDefault()
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-close-error')) {
    errorMode = 0
    searchInput.value = ''
    renderPaginator(movies.length)
    currentMode === 'card' ? renderMovieListCardMode(getMoviesByPage(currentPage)) : renderMovieListListMode(getMoviesByPage(currentPage))
  }
})
/* 函式：搜尋電影
    防止標籤套用初始設定
    抓取輸入框文字並去除空白字元即轉換為小寫放寬搜尋限制加大搜尋範圍
    透過判斷式檢查是否有輸入文字，若沒有則跳出警示
    使用 filter() 方法遍歷 movies 陣列資料將符合搜尋關鍵字的資料存放進新的陣列中
    判斷若新陣列中沒有資料則跳出提示告知使用者
    呼叫 渲染頁數函式 使用新陣列資料重新渲染頁數區塊
    呼叫 渲染電影列表函式 使用新陣列的資料重新渲染列表區塊
*/
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length) {
    return renderErrorMessage('Please check your keyword！')
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return renderErrorMessage(`No result found matching your keyword：" ${keyword} "`)
  }
  currentPage = 1
  renderPaginator(filteredMovies.length)
  currentMode === 'card' ? renderMovieListCardMode(getMoviesByPage(1)) : renderMovieListListMode(getMoviesByPage(1))
  btnReset.classList.remove('d-none')
})

/* 函式：#paginator 區塊內的點擊 
    如果點擊偵測的 HTML 標籤不是 <a> 的話就跳出函式
    設定常數 page 為取得 <a> 標籤設定的 data-page 值，並透過 Number() 方法將值解析為數字
    將 page 作為 getMoviesByPage() 函式的引數，再將 getMoviesByPage(page) 作為 renderMovieList() 的引數
    最後調用函式 renderMovieList(getMoviesByPage(page)) 執行程式內容
*/
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  currentPage = page
  currentMode === 'card' ? renderMovieListCardMode(getMoviesByPage(currentPage)) : renderMovieListListMode(getMoviesByPage(currentPage))
})
/* 函式：顯示狀態切換 
  點擊之後調用渲染電影畫面及渲染頁數區塊的函式
  所以需要有兩個電影模板
*/
controlPanel.addEventListener('click', function onControlPanelClicked(event) {
  if (errorMode === 1) return

  if (event.target.dataset.mode === 'list') {
    currentMode = 'list'
    dataPanel.setAttribute('class', '')
    renderMovieListListMode(getMoviesByPage(currentPage))
  } else if (event.target.dataset.mode === 'card') {
    currentMode = 'card'
    dataPanel.setAttribute('class', 'row')
    renderMovieListCardMode(getMoviesByPage(currentPage))
  } else if (event.target.matches('#btn-reset')) {
    errorMode = 0
    searchInput.value = ''
    filteredMovies = []
    renderPaginator(movies.length)
    currentMode === 'card' ? renderMovieListCardMode(getMoviesByPage(1)) : renderMovieListListMode(getMoviesByPage(1))
    btnReset.classList.add('d-none')
  }
})

/* Alert 警示視窗

*/
function renderErrorMessage(content) {
  let rawHTML = `
    <div class="" id="error-message">
      <h5 class="error-title">${content}</h5>
      <p class="error-info"></p>
      <a href="#" class="btn btn-warning btn-close-error">Reset</a>
    </div>
  `
  errorMode = 1
  dataPanel.innerHTML = rawHTML
  paginator.innerHTML = ''
}



/* Axios：
    將 API 資料用 push 方式存進 常數 movies
    將 movies.length 作為 renderPaginator 的引數
    因為預設畫面是第一頁，所以將 1 作為 getMoviesByPage 的引數，再將 getMoviesByPage(1) 作為 renderMovieList() 的引數
*/
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieListCardMode(getMoviesByPage(1))
  })
  .catch((error) => console.log(error))

