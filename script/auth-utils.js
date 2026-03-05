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
export function setupSearch(allPosts, renderFn) {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  const handleSearch = () => {
    const keyword = searchInput.value.toLowerCase().trim();
    
    // 검색어가 없으면 전체 목록을 보여줌
    if (!keyword) {
      renderFn(Object.values(allPosts));
      return;
    }

    // 제목, 부제목, 내용 중 하나라도 키워드가 포함된 글만 필터링
    const filtered = Object.values(allPosts).filter(post => {
      const title = (post.title || '').toLowerCase();
      const subtitle = (post.subtitle || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      
      return title.includes(keyword) || subtitle.includes(keyword) || content.includes(keyword);
    });

    renderFn(filtered); // 필터링된 결과만 화면에 그리기
  };

  searchBtn.onclick = handleSearch;
  // 엔터키를 눌러도 검색되게 설정
  searchInput.onkeyup = (e) => { if (e.key === 'Enter') handleSearch(); };
}
