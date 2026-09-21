// firebase 또는 API에서 불러온 전체 데이터로 대체 가능
let allPosts = []; // 전체 게시글 데이터 배열
const itemsPerPage = 20; // 페이지당 20개
let currentPage = 1;

function getMaxPageButtons() {
  return window.innerWidth < 768 ? 5 : 10;
}

// 게시글 목록 출력
function renderPosts(page) {
  const listContainer = document.getElementById("post-list");
  if (!listContainer) return;
  
  listContainer.innerHTML = "";

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allPosts.length);

  const currentPosts = allPosts.slice(startIndex, endIndex);

  currentPosts.forEach(post => {
    const postItem = document.createElement("div");
    postItem.className = "post-item";
    postItem.textContent = post.title || `게시글 #${post.id}`;
    listContainer.appendChild(postItem);
  });
}

// 페이지네이션 바 출력
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;
  
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(allPosts.length / itemsPerPage);
  if (totalPages <= 1) return;

  const maxButtons = getMaxPageButtons();
  const currentGroup = Math.floor((currentPage - 1) / maxButtons);
  const startPage = currentGroup * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  // ▶ 다음 그룹 이동 버튼
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "▶";
  nextBtn.disabled = endPage >= totalPages;
  nextBtn.addEventListener("click", () => {
    currentPage = endPage + 1;
    updateView();
  });

  // ▷ 맨 끝 이동 버튼
  const lastBtn = document.createElement("button");
  lastBtn.textContent = "▷";
  lastBtn.disabled = currentPage === totalPages;
  lastBtn.addEventListener("click", () => {
    currentPage = totalPages;
    updateView();
  });

  // 숫자 페이지 버튼
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    if (i === currentPage) pageBtn.classList.add("active");

    pageBtn.addEventListener("click", () => {
      currentPage = i;
      updateView();
    });
    paginationContainer.appendChild(pageBtn);
  }

  paginationContainer.appendChild(nextBtn);
  paginationContainer.appendChild(lastBtn);
}

function updateView() {
  renderPosts(currentPage);
  renderPagination();
}

// 외부에서 파이어베이스 데이터 등을 주입받아 초기화할 때 호출하는 함수
function initPagination(postsData) {
  allPosts = postsData;
  currentPage = 1;
  updateView();
}

window.addEventListener("resize", () => {
  renderPagination();
});
