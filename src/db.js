// simple in-memory store for users, posts and comments
// data resets when the server restarts - fine for this project
const store = {
    users: [],
    posts: [],
    comments: [],
    _userId: 1,
    _postId: 1,
    _commentId: 1,

    createUser(username, password) {
        const user = {
            id: this._userId++,
            username,
            password,
            created_at: new Date().toISOString()
        }
        this.users.push(user)
        return user
    },

    findUserByUsername(username) {
        return this.users.find(u => u.username === username) || null
    },

    findUserById(id) {
        return this.users.find(u => u.id === id) || null
    },

    // used in tests to reset state between test runs
    reset() {
        this.users = []
        this.posts = []
        this.comments = []
        this._userId = 1
        this._postId = 1
        this._commentId = 1
    }
}

module.exports = store