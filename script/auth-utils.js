import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 사용자 권한 가져오기 공통 함수
export async function getUserRole(db, userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data().role : 'user';
  } catch { return 'user'; }
}

// 링크 변환 공통 함수 (linkify도 빼두면 좋습니다)
export function linkify(text) {
  if (!text) return '';
  return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="post-link">LINK</a>');
}
