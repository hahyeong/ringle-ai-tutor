// public/js/api.js

const API_BASE_URL = 'http://localhost:3000/api/v1';

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
async function getMembershipStatus(userId = 6) {  // 1 → 6으로 변경
    return await apiCall(`/users/${userId}/membership_status`);
}

// 멤버십 타입 목록 조회
async function getMembershipTypes() {
    return await apiCall('/membership_types');
}

// 멤버십 구매
async function purchaseMembership(userId, membershipTypeId) {
    return await apiCall(`/users/${userId}/memberships`, {
        method: 'POST',
        body: JSON.stringify({
            membership_type_id: membershipTypeId
        })
    });
}

// AI 대화 API (나중에 구현)
async function sendMessage(message) {
    return await apiCall('/conversations/chat', {
        method: 'POST',
        body: JSON.stringify({
            message: message,
            user_id: 1
        })
    });
}