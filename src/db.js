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

    createPost(title, body, userId) {
        const post = {
            id: this._postId++,
            title,
            body,
            user_id: userId,
            created_at: new Date().toISOString()
        }
        this.posts.push(post)
        return post
    },

    getAllPosts() {
        return this.posts.map(p => ({
            ...p,
            username: this.findUserById(p.user_id)?.username
        })).reverse()
    },

    findPostById(id) {
        const post = this.posts.find(p => p.id === id) || null
        if (!post) return null
        return { ...post, username: this.findUserById(post.user_id)?.username }
    },

    updatePost(id, title, body) {
        const post = this.posts.find(p => p.id === id)
        if (!post) return null
        if (title) post.title = title
        if (body) post.body = body
        return post
    },

    deletePost(id) {
        const index = this.posts.findIndex(p => p.id === id)
        if (index === -1) return false
        this.posts.splice(index, 1)
        this.comments = this.comments.filter(c => c.post_id !== id)
        return true
    },

    createComment(body, userId, postId) {
        const comment = {
            id: this._commentId++,
            body,
            user_id: userId,
            post_id: postId,
            created_at: new Date().toISOString()
        }
        this.comments.push(comment)
        return comment
    },

    getCommentsByPost(postId) {
        return this.comments
            .filter(c => c.post_id === postId)
            .map(c => ({
                ...c,
                username: this.findUserById(c.user_id)?.username
            }))
    },

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
