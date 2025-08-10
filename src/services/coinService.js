import API from '../api/axios';

export const registerUser = (userData) => API.post('/api/auth/register', userData);
export const loginUser = (loginData) => API.post('/api/auth/login', loginData);
export const claimDailyCoins = (userId, token) =>
	API.post('/api/coins/claim-daily', { userId }, { headers: { Authorization: `Bearer ${token}` } });
export const getUserProfile = (userId, token) =>
	API.get(`/api/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
export const getTransactionHistory = (userId, token) =>
	API.get(`/api/user/${userId}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
export const getLeaderboard = () => API.get('/api/leaderboard');
export const getQuizzes = (level, token) =>
	API.get(`/api/quizzes?level=${level}`, { headers: { Authorization: `Bearer ${token}` } });
export const submitQuizAnswers = (userId, quizId, answers, token) =>
	API.post('/api/quizzes/submit', { userId, quizId, answers }, { headers: { Authorization: `Bearer ${token}` } });
export const rewardQuiz = (userId, quizNumber, token) =>
	API.post('/api/actions/quiz', { userId, quizNumber }, { headers: { Authorization: `Bearer ${token}` } });
export const rewardForumPost = (userId, token) =>
	API.post('/api/actions/forum', { userId }, { headers: { Authorization: `Bearer ${token}` } });
export const applyPenalty = (userId, amount, reason, token) =>
	API.post('/api/actions/penalty', { userId, amount, reason }, { headers: { Authorization: `Bearer ${token}` } });

// Forum APIs
export const getForumPosts = (token) =>
	API.get('/api/forum/posts', { headers: { Authorization: `Bearer ${token}` } });
export const createForumPost = (userId, content, token) =>
	API.post('/api/forum/posts', { userId, content }, { headers: { Authorization: `Bearer ${token}` } });

// Forum replies APIs
export const getForumReplies = (postId, token) =>
	API.get(`/api/forum/posts/${postId}/replies`, { headers: { Authorization: `Bearer ${token}` } });
export const createForumReply = (postId, userId, content, token) =>
	API.post(`/api/forum/posts/${postId}/replies`, { userId, content }, { headers: { Authorization: `Bearer ${token}` } });

// Courses APIs
export const getCourses = (token) =>
	API.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
export const completeCourse = (userId, courseId, token) =>
	API.post('/api/courses/complete', { userId, courseId }, { headers: { Authorization: `Bearer ${token}` } });

// Course details & topic progress
export const getCourseById = (courseId, token) =>
	API.get(`/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
export const completeCourseTopic = (userId, courseId, topicIndex, token) =>
	API.post('/api/courses/complete-topic', { userId, courseId, topicIndex }, { headers: { Authorization: `Bearer ${token}` } });