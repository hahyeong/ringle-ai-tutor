// public/js/api.js

const API_BASE_URL = 'http://localhost:3000/api/v1';

// 현재 로그인된 사용자 ID 가져오기
function getCurrentUserId() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        window.location.href = 'login.html';
        return null;
    }
    return parseInt(userId);
}

// 현재 사용자 정보 가져오기
function getCurrentUserInfo() {
    const userInfo = localStorage.getItem('currentUserInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserInfo');
    window.location.href = 'login.html';
}

// API 호출 공통 함수
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 실패:', error);
        throw error;
    }
}

// 멤버십 상태 조회
async function getMembershipStatus(userId = null) {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) return null;
    
    return await apiCall(`/users/${currentUserId}/membership_status`);
}

// 멤버십 타입 목록 조회
async function getMembershipTypes() {
    return await apiCall('/membership_types');
}

// 멤버십 구매
async function purchaseMembership(userId = null, membershipTypeId) {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) return null;
    
    return await apiCall(`/users/${currentUserId}/memberships`, {
        method: 'POST',
        body: JSON.stringify({
            membership_type_id: membershipTypeId
        })
    });
}

// AI 대화 API
async function sendMessage(message, userId = null) {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) return null;
    
    return await apiCall('/conversations/chat', {
        method: 'POST',
        body: JSON.stringify({
            message: message,
            user_id: currentUserId
        })
    });
}