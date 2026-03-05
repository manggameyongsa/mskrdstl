import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 사용자 권한 가져오기 공통 함수
export async function getUserRole(db, userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().role : 'user';
  } catch { return 'user'; }
}

// 모달 바깥 클릭 시 닫기 기능을 설정하는 공통 함수
export function setupModalOutsideClick(writeModalId, detailModalId, closeWriteFn, closeDetailFn) {
  window.onclick = (event) => {
    const writeModal = document.getElementById(writeModalId);
    const detailModal = document.getElementById(detailModalId);

    if (event.target === writeModal) {
      closeWriteFn();
    }
    if (event.target === detailModal) {
      closeDetailFn();
    }
  };
}

// 링크 변환 공통 함수 (linkify도 빼두면 좋습니다)
export function linkify(text) {
  if (!text) return '';
  return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="post-link">LINK</a>');
}


// 검색 기능 공통 함수
// script/auth-utils.js 에 있는 setupSearch 함수
export function setupSearch(allPosts, renderFn) {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  if (!searchInput || !searchBtn) return; // 요소가 없으면 실행 안 함

  const handleSearch = () => {
    const keyword = searchInput.value.toLowerCase().trim();
    const postsArray = Object.values(allPosts);
    
    if (!keyword) {
      renderFn(postsArray);
      return;
    }

    const filtered = postsArray.filter(post => {
      // 일반 게시판 항목(title, subtitle) + 방명록 항목(userEmail) 모두 체크
      const title = (post.title || '').toLowerCase();
      const subtitle = (post.subtitle || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      const author = (post.userEmail || '').toLowerCase(); 
      
      return title.includes(keyword) || 
             subtitle.includes(keyword) || 
             content.includes(keyword) || 
             author.includes(keyword);
    });

    renderFn(filtered);
  };

  searchBtn.onclick = handleSearch;
  searchInput.onkeyup = (e) => { if (e.key === 'Enter') handleSearch(); };
}
